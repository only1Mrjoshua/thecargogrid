import mongoose from 'mongoose';

// Document subdocument schema
const documentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: 'application/pdf' },
  size: { type: String, default: '' },
  uploadDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  attached: { type: Boolean, default: false },
  data: { type: String, default: '' }, // base64 data URL
});

const shipmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: String,
    required: true,
    trim: true,
  },
  email: { type: String, trim: true, lowercase: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  status: {
    type: String,
    enum: [
      'Order Received',
      'Processing',
      'In Transit',
      'Arrived at Facility',
      'Customs',
      'Customs Hold',
      'Customs Fee Pending',
      'Shipment Delayed',
      'Cleared',
      'Out for Delivery',
      'Delivered',
      'Pending'
    ],
    default: 'Pending',
  },
  payment: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid',
  },
  date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  weight: { type: String, default: '' },
  packageType: { type: String, default: 'Standard Parcel' },
  expectedDelivery: { type: String, default: '' },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  dateTime: { type: String, default: '' },
  nextAction: { type: String, default: '' },
  lastUpdated: { type: String, default: () => new Date().toISOString() },
  history: { type: Array, default: [] },
  steps: { type: Array, default: [] },
  documents: [documentSchema], // 👈 now uses subdocument schema
  fees: { type: Object, default: {} },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Pre-save hook – generates tracking number if missing
shipmentSchema.pre('save', async function() {
  if (!this.id) {
    const random = Math.floor(Math.random() * 10**12).toString().padStart(12, '0');
    this.id = `TCG-${random}`;
  }
  if (!this.date) {
    this.date = new Date().toISOString().slice(0, 10);
  }
  if (!this.lastUpdated) {
    this.lastUpdated = new Date().toISOString();
  }
});

const Shipment = mongoose.model('Shipment', shipmentSchema);
export default Shipment;