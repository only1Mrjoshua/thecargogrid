import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  reference: {
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
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  date: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10),
  },
  paymentMethod: {
    type: String,
    default: 'Credit Card',
  },
  description: {
    type: String,
    default: '',
  },
  receiptUrl: {
    type: String,
    default: '',
  },
  // Optional: link to invoice or transaction logs
  invoiceNumber: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Generate a reference number if missing
paymentSchema.pre('save', async function() {
  if (!this.reference) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Payment').countDocuments();
    this.reference = `PAY-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;