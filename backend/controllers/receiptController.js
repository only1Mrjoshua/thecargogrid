import Receipt from '../models/Receipt.js';

// @desc    Get all receipts
// @route   GET /api/receipts
// @access  Private
export const getReceipts = async (req, res, next) => {
  try {
    const receipts = await Receipt.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, receipts });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single receipt by receiptNumber or id
// @route   GET /api/receipts/:id
// @access  Private
export const getReceiptById = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({
      $or: [{ _id: req.params.id }, { receiptNumber: req.params.id }]
    });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.status(200).json({ success: true, receipt });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new receipt (usually after payment)
// @route   POST /api/receipts
// @access  Private
export const createReceipt = async (req, res, next) => {
  try {
    const { trackingNumber, customer, amount, currency, paymentMethod, description, paymentReference } = req.body;
    if (!trackingNumber || !customer || !amount) {
      return res.status(400).json({ message: 'Tracking number, customer, and amount are required' });
    }

    const receipt = await Receipt.create({
      trackingNumber,
      customer,
      amount: parseFloat(amount),
      currency: currency || 'GBP',
      paymentMethod: paymentMethod || 'Credit Card',
      description: description || '',
      paymentReference: paymentReference || '',
      createdBy: req.userId,
    });

    res.status(201).json({ success: true, receipt });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Receipt number already exists' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(err);
  }
};

// @desc    Update receipt status (viewed, downloaded)
// @route   PUT /api/receipts/:id
// @access  Private
export const updateReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const allowedFields = ['status', 'paymentMethod', 'description', 'pdfUrl'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        receipt[field] = req.body[field];
      }
    });

    await receipt.save();
    res.status(200).json({ success: true, receipt });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a receipt
// @route   DELETE /api/receipts/:id
// @access  Private
export const deleteReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    await receipt.deleteOne();
    res.status(200).json({ success: true, message: 'Receipt deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Search receipts
// @route   GET /api/receipts/search?q=...
// @access  Private
export const searchReceipts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const receipts = await Receipt.find({
      $or: [
        { receiptNumber: { $regex: q, $options: 'i' } },
        { trackingNumber: { $regex: q, $options: 'i' } },
        { customer: { $regex: q, $options: 'i' } },
      ]
    });
    res.status(200).json({ success: true, receipts });
  } catch (err) {
    next(err);
  }
};