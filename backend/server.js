import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dns from 'dns';
import shipmentRoutes from './routes/shipmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';  
import invoiceRoutes from './routes/invoiceRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
// Routes
import authRoutes from './routes/authRoutes.js';

dotenv.config();

// ✅ Fix DNS SRV resolution issues on Windows/VPN
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS configuration (allow all localhost and your frontend ports)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://thecargogrid.com'
  // Add your production domains here later
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ✅ Increased payload limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/payments', paymentRoutes);  
app.use('/api/invoices', invoiceRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/customers', customerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });