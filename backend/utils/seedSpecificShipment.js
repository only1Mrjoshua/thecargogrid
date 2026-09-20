import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Shipment from '../models/Shipment.js'; // Ensure this path is correct

dotenv.config();

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ─── HARDCODED PRODUCTION URL ────────────────────────────────────────
// This forces the script to use the live domain regardless of .env
const IMAGE_BASE_URL = 'https://thecargogrid.com';

const generateTracking = () => {
  const randomDigits = String(Math.floor(100000000000 + Math.random() * 900000000000));
  return `TCG-${randomDigits}`;
};

const seedSpecificShipment = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📸 Forcing image base URL: ${IMAGE_BASE_URL}`);

    // ─── Detailed Timeline Steps ──────────────────────────────────────
    const steps = [
      {
        event: 'Departed from warehouse',
        status: 'completed',
        description: 'Shipment has left the origin warehouse.',
        date: '2026-09-17 14:05:45',
        location: 'Colombo, Sri Lanka'
      },
      {
        event: 'Processing at sorting center',
        status: 'completed',
        description: 'Shipment is being processed at the local sorting facility.',
        date: '2026-09-17 14:05:59',
        location: 'Colombo, Sri Lanka'
      },
      {
        event: 'Departed from sorting center',
        status: 'completed',
        description: 'Shipment has left the sorting center.',
        date: '2026-09-18 01:21:26',
        location: 'Colombo, Sri Lanka'
      },
      {
        event: 'Arrived at departure transport hub',
        status: 'completed',
        description: 'Shipment has arrived at the main transport hub.',
        date: '2026-09-18 06:49:14',
        location: 'Colombo, Sri Lanka'
      },
      {
        event: 'Import customs clearance started',
        status: 'completed',
        description: 'Import customs clearance process has begun.',
        date: '2026-09-18 18:48:19',
        location: 'Sri Lanka'
      },
      {
        event: 'Export customs clearance started',
        status: 'completed',
        description: 'Export customs clearance process has begun.',
        date: '2026-09-19 08:00:32',
        location: 'Colombo, Sri Lanka'
      },
      {
        event: 'Export customs clearance complete',
        status: 'completed',
        description: 'Customs clearance was a success. Package is cleared for export.',
        date: '2026-09-19 09:31:17',
        location: 'Colombo, Sri Lanka'
      },
      {
        event: 'Leaving from departure country/region',
        status: 'active', 
        description: 'Shipment is leaving the departure country and en route to destination.',
        date: '2026-09-19 21:23:00',
        location: 'Colombo, Sri Lanka'
      },
      // ─── Upcoming Steps ─────────────────────────────────────────────
      {
        event: 'Arrived at Destination Country',
        status: 'upcoming',
        description: 'Awaiting arrival in the USA.',
        date: '',
        location: 'Louisiana, USA'
      },
      {
        event: 'Out for Delivery',
        status: 'upcoming',
        description: 'Awaiting local dispatch.',
        date: '',
        location: 'Louisiana, USA'
      },
      {
        event: 'Delivered',
        status: 'upcoming',
        description: 'Awaiting delivery confirmation.',
        date: '',
        location: 'Louisiana, USA'
      }
    ];

    const shipment = {
      id: generateTracking(),

      sender: {
        name: 'Ramos H Adrian',
        email: 'ramos.adrian@example.com',
        phone: '+94 77 123 4567',
        address: '123 Galle Road, Colombo, Sri Lanka'
      },
      
      receiver: {
        name: 'Dorothy Guillott',
        email: 'dorothy.guillott@example.com',
        phone: '+1 504 555 0192',
        address: '456 Bourbon Street, New Orleans, Louisiana, USA'
      },

      customer: 'Ramos H Adrian',
      email: 'ramos.adrian@example.com',
      phone: '+94 77 123 4567',
      address: '123 Galle Road, Colombo, Sri Lanka',

      origin: 'Colombo, Sri Lanka',
      destination: 'Louisiana, USA',

      status: 'In Transit', 
      payment: 'Paid',                    
      date: '2026-09-17',
      expectedDelivery: '2026-09-25',

      weight: '15 kg',
      packageType: 'Mixed Goods (Fragile, Pet Supplies, Luxury)',
      location: 'In Transit – Leaving Colombo, Sri Lanka',
      description: 'Shipment containing: 1x Glass Flower (Fragile), 1x Pets Box of Toys, 1x Pets Bed and Towels, 1x Designer Handbag.',
      dateTime: '2026-09-19T21:23:00',

      steps: steps,
      history: steps,
      documents: [],

      packageDetails: {
        length: 40,
        width: 30,
        height: 30,
        declaredValue: 1500,
        isFragile: true, 
        isDangerous: false,
        description: '1x Glass Flower, 1x Pets Box of Toys, 1x Pets Bed and Towels, 1x Designer Handbag',
        category: 'Mixed',
        // Now hardcoded to use the production domain
        images: [
          `${IMAGE_BASE_URL}/glass-flower.jpeg`,
          `${IMAGE_BASE_URL}/pet-toys.jpeg`,
          `${IMAGE_BASE_URL}/pet-bed.jpeg`,
          `${IMAGE_BASE_URL}/pet-towel.jpeg`,
          `${IMAGE_BASE_URL}/designer-handbag.jpeg`
        ]
      },

      fees: {
        total: 480.00,
        currency: 'USD',
        paid: true,
        breakdown: [
          { label: 'International Freight', amount: 300.00 },
          { label: 'Fragile Handling & Packaging', amount: 80.00 },
          { label: 'Insurance Premium (High-Value)', amount: 100.00 }
        ]
      },

      specialInstructions: 'Handle with care. Contains fragile glass items. Customs clearance completed on Sep 19.'
    };

    const result = await Shipment.create(shipment);
    console.log(`✅ Created shipment: ${result.id} | ${result.customer} | Status: ${result.status}`);
    console.log(`📸 Images added: ${result.packageDetails.images.length}`);
    
    // Verify the URL saved
    console.log(`🔗 First image URL: ${result.packageDetails.images[0]}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedSpecificShipment();