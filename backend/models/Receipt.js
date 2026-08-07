import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
  },
  trackingNumber: {
    type: String,
    required: true,
    ref: 'Shipment',
  },
  customer: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'GBP',
  },
  date: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10),
  },
  status: {
    type: String,
    enum: ['Sent', 'Viewed', 'Downloaded'],
    default: 'Sent',
  },
  paymentMethod: {
    type: String,
    default: 'Credit Card',
  },
  description: {
    type: String,
    default: '',
  },
  pdfUrl: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  paymentReference: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Pre-save hook to generate receipt number if missing
receiptSchema.pre('save', async function() {
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Receipt').countDocuments();
    this.receiptNumber = `RCP-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

const Receipt = mongoose.model('Receipt', receiptSchema);
export default Receipt;