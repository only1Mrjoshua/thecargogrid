import Invoice from '../models/Invoice.js';

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
export const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, invoices });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single invoice by invoiceNumber or id
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      $or: [{ _id: req.params.id }, { invoiceNumber: req.params.id }]
    });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
export const createInvoice = async (req, res, next) => {
  try {
    console.log('📄 Invoice creation payload:', req.body);
    const { customer, trackingNumber, description, amount, currency, dueDate, status } = req.body;

    // Check required fields
    if (!customer || !trackingNumber || !description || !amount || !dueDate) {
      console.log('❌ Missing fields:', { customer, trackingNumber, description, amount, dueDate });
      return res.status(400).json({
        message: 'Customer, tracking, description, amount, and due date are required'
      });
    }

    // Validate tracking number format (optional)
    if (!trackingNumber.startsWith('TCG-')) {
      console.log('❌ Invalid tracking number format:', trackingNumber);
      return res.status(400).json({ message: 'Tracking number must start with TCG-' });
    }

    const invoice = await Invoice.create({
      customer,
      trackingNumber,
      description,
      amount: parseFloat(amount),
      currency: currency || 'GBP',
      dueDate,
      status: status || 'Draft',
      createdBy: req.userId,
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    console.error('❌ Invoice creation error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(err);
  }
};

// @desc    Update invoice (status, fields)
// @route   PUT /api/invoices/:id
// @access  Private
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const allowedFields = ['customer', 'trackingNumber', 'description', 'amount', 'currency', 'dueDate', 'status'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        invoice[field] = req.body[field];
      }
    });

    invoice.updatedAt = new Date().toISOString().slice(0, 10);
    await invoice.save();
    res.status(200).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an invoice
// @route   DELETE /api/invoices/:id
// @access  Private
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await invoice.deleteOne();
    res.status(200).json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Search invoices
// @route   GET /api/invoices/search?q=...
// @access  Private
export const searchInvoices = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const invoices = await Invoice.find({
      $or: [
        { invoiceNumber: { $regex: q, $options: 'i' } },
        { customer: { $regex: q, $options: 'i' } },
        { trackingNumber: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ]
    });
    res.status(200).json({ success: true, invoices });
  } catch (err) {
    next(err);
  }
};

// @desc    Get invoice statistics (for dashboard)
// @route   GET /api/invoices/stats
// @access  Private
export const getInvoiceStats = async (req, res, next) => {
  try {
    const total = await Invoice.countDocuments();
    const draft = await Invoice.countDocuments({ status: 'Draft' });
    const sent = await Invoice.countDocuments({ status: 'Sent' });
    const paid = await Invoice.countDocuments({ status: 'Paid' });
    const overdue = await Invoice.countDocuments({ status: 'Overdue' });
    const cancelled = await Invoice.countDocuments({ status: 'Cancelled' });
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        draft,
        sent,
        paid,
        overdue,
        cancelled,
        totalRevenue: totalRevenue[0]?.total || 0,
      }
    });
  } catch (err) {
    next(err);
  }
};