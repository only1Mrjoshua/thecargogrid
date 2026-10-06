import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Shipment from '../models/Shipment.js';

dotenv.config();

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ─── Date helpers ───────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDateTime = (d) => `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const now = new Date();
const shipDate = addDays(now, 1);       // shipment date = tomorrow
const deliveryDate = addDays(now, 12);  // tomorrow + 11 days = max 11 days in transit

// ─── Helper to generate a random tracking number ──────────────────
const generateTracking = () => {
  const randomDigits = String(Math.floor(100000000000 + Math.random() * 900000000000));
  return `TCG-${randomDigits}`;
};

const seedShipment = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const steps = [
      {
        event: 'Order Received',
        status: 'completed',
        description: 'Shipment created and booking confirmed',
        date: fmtDateTime(now),
        location: 'Wyoming, USA'
      },
      {
        event: 'Shipment Processed',
        status: 'active',
        description: 'Package inspected, sealed, and prepared for export',
        date: fmtDateTime(shipDate),
        location: 'Wyoming, USA'
      },
      {
        event: 'In Transit',
        status: 'upcoming',
        description: 'Awaiting departure from Wyoming, USA – en route to Hinwil, Switzerland',
        date: '',
        location: ''
      },
      {
        event: 'Arrived at Facility',
        status: 'upcoming',
        description: 'Awaiting arrival at Zurich / Hinwil hub',
        date: '',
        location: ''
      },
      {
        event: 'Out for Delivery',
        status: 'upcoming',
        description: 'Awaiting local dispatch to recipient address',
        date: '',
        location: ''
      },
      {
        event: 'Delivered',
        status: 'upcoming',
        description: `Estimated delivery by ${fmtDate(deliveryDate)}`,
        date: '',
        location: ''
      }
    ];

    const shipment = {
      id: generateTracking(),

      sender: {
        name: 'Margret Hopper',
        email: 'margrethopper@example.com',   // 🔁 update if you have the real email
        phone: '+1 307 000 0000',             // 🔁 update with real phone
        address: 'Wyoming, USA'
      },
      recipient: {
        name: 'Graeme William Eliason',
        email: 'graeme.eliasion@example.com', // 🔁 update if you have the real email
        phone: '+41 00 000 0000',             // 🔁 update with real phone
        address: 'Walderstrasse 7, 8340 Hinwil, Switzerland'
      },

      // Flat fields (backward compatibility)
      customer: 'Margret Hopper',
      email: 'margrethopper@example.com',
      phone: '+1 307 000 0000',
      address: 'Wyoming, USA',

      origin: 'Wyoming, USA',
      destination: 'Hinwil, Switzerland',

      status: 'Processing',                 // 🔁 change to match your enum if needed
      payment: 'Paid',                      // 🔁 change to 'Pending' if unpaid
      date: fmtDate(shipDate),
      expectedDelivery: fmtDate(deliveryDate),

      weight: '2 kg',
      packageType: 'Parcel - Money & Car Key',
      location: 'Preparing for dispatch from Wyoming, USA',
      description:
        'High-value international shipment containing money and a car key. ' +
        'Origin: Wyoming, USA. Destination: Walderstrasse 7, 8340 Hinwil, Switzerland. ' +
        `Estimated delivery within 11 days (by ${fmtDate(deliveryDate)}).`,
      dateTime: new Date().toISOString(),

      steps: steps,
      history: steps,
      documents: [],

      // ─── No images attached for this shipment ──────────────────────
      packageDetails: {
        images: []
      },

      fees: {
        total: 3800.00,
        currency: 'USD',
        paid: true,                        // 🔁 set false if payment not received
        breakdown: [
          { label: 'International Freight (High-Value Parcel)', amount: 2200.00 },
          { label: 'Special Handling & Security Escort', amount: 900.00 },
          { label: 'Additional Insurance Premium (High-Value Cargo)', amount: 700.00 }
        ]
      },

      specialInstructions:
        'High-value parcel containing money and a car key. Enclosed and sealed container required. ' +
        'Anti-theft seals. Do not stack. Customs clearance documents must be pre-submitted. ' +
        'Destination: Walderstrasse 7, 8340 Hinwil, Switzerland – hold for collection or local delivery arrangement. ' +
        'Estimated delivery within 11 days. Payment completed.'
    };

    const result = await Shipment.create(shipment);
    console.log(`✅ Created shipment: ${result.id} | ${result.customer} | ${result.status}`);
    console.log(`📅 Ship date: ${fmtDate(shipDate)} | Expected delivery: ${fmtDate(deliveryDate)}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedShipment();