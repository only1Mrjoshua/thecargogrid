import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import Shipment from '../models/Shipment.js';

// ── ESM helpers ────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Load .env from backend root ──────────────────────────────────
dotenv.config({ path: path.resolve(__dirname, '../.env') });

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const TRACKING_ID = 'TCG-428831589476';

const updateShipmentTimeline = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in .env file.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const shipment = await Shipment.findOne({ id: TRACKING_ID });
    if (!shipment) {
      console.error(`❌ Shipment with ID ${TRACKING_ID} not found.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`📦 Found shipment: ${shipment.id} | Current status: ${shipment.status}`);

    // ─── Current timestamp for active steps ──────────────────────
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

    // ─── New timeline ──────────────────────────────────────────────
    const newSteps = [
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
      // ─── License/Permit – now active ────────────────────────────
      {
        event: 'License/Permit',
        status: 'active',
        description: 'Export license and permits – in progress',
        date: now,
        location: 'Los Angeles, USA'
      },
      // ─── Port/Terminal Clearance – also active ──────────────────
      {
        event: 'Port/Terminal Clearance',
        status: 'active',
        description: 'Clearing customs and terminal operations – in progress',
        date: now,    // same timestamp, but appears later in the list
        location: 'Los Angeles, USA'
      },
      // ─── In Transit – now upcoming ──────────────────────────────
      {
        event: 'In Transit',
        status: 'upcoming',
        description: 'Awaiting departure from Los Angeles to Sydney',
        date: '',
        location: ''
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

    // Update both timeline and history
    shipment.steps = newSteps;
    shipment.history = newSteps;

    // ❗ DO NOT change `shipment.status` – keep the existing value (e.g., "In Transit")
    // This avoids the enum validation error.

    await shipment.save();
    console.log(`✅ Updated shipment ${shipment.id}`);
    console.log(`📋 Status remains: ${shipment.status}`);
    console.log(`📋 Timeline now has ${shipment.steps.length} steps.`);
    console.log(`📋 Active steps: License/Permit and Port/Terminal Clearance`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateShipmentTimeline();