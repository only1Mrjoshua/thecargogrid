import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'Shipment Update',
      'Customs Hold',
      'Customs Fee Required',
      'Shipment Delayed',
      'Payment Confirmation',
      'Shipment Cleared',
      'Out for Delivery',
      'Delivered'
    ],
    required: true,
  },
  trackingNumber: {
    type: String,
    required: true,
    ref: 'Shipment',
  },
  recipient: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Sent', 'Failed'],
    default: 'Pending',
  },
  date: {
    type: String,
    default: () => new Date().toISOString(),
  },
  attachments: {
    type: [String],
    default: [],
  },
  triggeredBy: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Pre-save hook to ensure date is set
notificationSchema.pre('save', function() {
  if (!this.date) {
    this.date = new Date().toISOString();
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;