import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true, // still unique, but not required
  },
  customer: {
    type: String,
    required: true,
  },
  trackingNumber: {
    type: String,
    required: true,
    ref: 'Shipment',
  },
  description: {
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
  dueDate: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Draft',
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10),
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10),
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Pre-save hook to generate invoice number if missing
invoiceSchema.pre('save', async function() {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  this.updatedAt = new Date().toISOString().slice(0, 10);
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;