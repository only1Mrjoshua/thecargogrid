import mongoose from 'mongoose';

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
  documents: { type: Array, default: [] },
  fees: { type: Object, default: {} },

  // --- NEW FIELDS FOR SHIPPING BOOKING ---
  sender: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
  },
  receiver: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
  },
  packageDetails: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    declaredValue: { type: Number },
    isFragile: { type: Boolean, default: false },
    isDangerous: { type: Boolean, default: false },
    description: { type: String },
    category: { type: String },
    images: { type: [String], default: [] },
  },
  shippingOption: { type: String, enum: ['standard', 'express', 'priority'], default: 'standard' },
  additionalServices: { type: [String], default: [] },
  bookingData: { type: mongoose.Schema.Types.Mixed, default: {} },
  // --- END NEW FIELDS ---

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