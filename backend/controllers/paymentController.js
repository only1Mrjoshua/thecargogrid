import Payment from '../models/Payment.js';

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single payment by reference or id
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      $or: [{ _id: req.params.id }, { reference: req.params.id }]
    });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res, next) => {
  try {
    const { trackingNumber, customer, amount, currency, paymentMethod, description, invoiceNumber } = req.body;
    if (!trackingNumber || !customer || !amount) {
      return res.status(400).json({ message: 'Tracking number, customer, and amount are required' });
    }

    const payment = await Payment.create({
      trackingNumber,
      customer,
      amount,
      currency: currency || 'GBP',
      paymentMethod: paymentMethod || 'Credit Card',
      description: description || '',
      invoiceNumber: invoiceNumber || '',
      createdBy: req.userId,
    });

    res.status(201).json({ success: true, payment });
  } catch (err) {
    // Handle duplicate reference or validation errors
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Payment reference already exists' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(err);
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const allowedFields = ['status', 'paymentMethod', 'description', 'amount', 'currency', 'receiptUrl'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        payment[field] = req.body[field];
      }
    });

    await payment.save();
    res.status(200).json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private
export const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    await payment.deleteOne();
    res.status(200).json({ success: true, message: 'Payment deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Search payments
// @route   GET /api/payments/search?q=...
// @access  Private
export const searchPayments = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const payments = await Payment.find({
      $or: [
        { reference: { $regex: q, $options: 'i' } },
        { trackingNumber: { $regex: q, $options: 'i' } },
        { customer: { $regex: q, $options: 'i' } },
      ]
    });
    res.status(200).json({ success: true, payments });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payment statistics (for dashboard)
// @route   GET /api/payments/stats
// @access  Private
export const getPaymentStats = async (req, res, next) => {
  try {
    const total = await Payment.countDocuments();
    const pending = await Payment.countDocuments({ status: 'Pending' });
    const paid = await Payment.countDocuments({ status: 'Paid' });
    const failed = await Payment.countDocuments({ status: 'Failed' });
    const refunded = await Payment.countDocuments({ status: 'Refunded' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        paid,
        failed,
        refunded,
        totalRevenue: totalRevenue[0]?.total || 0,
      }
    });
  } catch (err) {
    next(err);
  }
};