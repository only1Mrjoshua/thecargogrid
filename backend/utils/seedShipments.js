import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Shipment from '../models/Shipment.js';

dotenv.config();

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ─── Dynamic image base URL ─────────────────────────────────────────
// Local dev → http://localhost:3000 (frontend serves public folder)
// Production → https://thecargogrid.com
// Override with IMAGE_BASE_URL environment variable if needed.
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://thecargogrid.com' 
    : 'http://localhost:3000');   // ✅ frontend dev server

// ─── Helper to generate a random tracking number ──────────────────
const generateTracking = () => {
  const randomDigits = String(Math.floor(100000000000 + Math.random() * 900000000000));
  return `TCG-${randomDigits}`;
};

const seedShipment = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📸 Using image base URL: ${IMAGE_BASE_URL}`);

    const steps = [
      {
        event: 'Order Received',
        status: 'completed',
        description: 'Shipment created',
        date: '2026-08-11 00:00',
        location: 'Los Angeles, USA'
      },
      {
        event: 'Shipment Processed',
        status: 'completed',
        description: 'Vehicle and safe box inspected, sealed, and loaded for export',
        date: '2026-08-12 00:00',
        location: 'Los Angeles, USA'
      },
      {
        event: 'In Transit',
        status: 'active',
        description: 'Departed Los Angeles – currently en route to Sydney',
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        location: 'Pacific Ocean / en route'
      },
      {
        event: 'Arrived at Facility',
        status: 'upcoming',
        description: 'Awaiting arrival at Sydney port / hub',
        date: '',
        location: ''
      },
      {
        event: 'Out for Delivery',
        status: 'upcoming',
        description: 'Awaiting collection or local dispatch',
        date: '',
        location: ''
      },
      {
        event: 'Delivered',
        status: 'upcoming',
        description: 'Awaiting delivery confirmation',
        date: '',
        location: ''
      }
    ];

    const shipment = {
      id: generateTracking(),

      sender: {
        name: 'Lee Jun ho',
        email: 'realjunho1990@gmail.com',
        phone: '+1 818 278 0024',
        address: 'N/A'
      },
      recipient: {
        name: 'Eluisa Bean',
        email: 'eluisatbean@gmail.com',
        phone: '+61 448 004 779',
        address: 'Sydney, Australia'
      },

      // Flat fields (backward compatibility)
      customer: 'Lee Jun ho',
      email: 'realjunho1990@gmail.com',
      phone: '+1 818 278 0024',
      address: 'N/A',

      origin: 'Los Angeles, USA',
      destination: 'Sydney, Australia',

      status: 'In Transit',
      payment: 'Unpaid',
      date: '2026-08-11',
      expectedDelivery: '2026-08-30',

      weight: '1900 kg',
      packageType: 'Freight - Vehicle & Safe Box',
      location: 'In transit – departed Los Angeles today, en route to Sydney',
      description: 'High-value international freight: Audi Q5 2025 with secured safe box containing cash and jewelries. Los Angeles, USA to Sydney, Australia. Payment pending.',
      dateTime: new Date().toISOString(),

      steps: steps,
      history: steps,
      documents: [],

      // ─── Images ──────────────────────────────────────────────────────
      packageDetails: {
        images: [
          `${IMAGE_BASE_URL}/car.jpeg`,
          `${IMAGE_BASE_URL}/box.jpeg`
        ]
      },

      fees: {
        total: 6300.00,
        currency: 'USD',
        paid: false,
        breakdown: [
          { label: 'International Freight (Vehicle + Safe Box)', amount: 4000.00 },
          { label: 'Special Handling & Security Escort', amount: 1500.00 },
          { label: 'Additional Insurance Premium (High-Value Cargo)', amount: 800.00 }
        ]
      },

      specialInstructions: 'Enclosed container required. High-value security escort. Anti-theft seals. Do not stack. Customs clearance documents must be pre-submitted. Destination: Sydney, Australia – hold for collection or local delivery arrangement. Payment outstanding – $6,300.00 USD due.'
    };

    const result = await Shipment.create(shipment);
    console.log(`✅ Created shipment: ${result.id} | ${result.customer} | ${result.status}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedShipment();