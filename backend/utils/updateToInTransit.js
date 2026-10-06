// utils/updateToInTransit.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Shipment from '../models/Shipment.js';

dotenv.config();

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const TRACKING_ID = 'TCG-883011516487';

// ─── Date helpers ───────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDateTime = (d) => `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

const now = new Date();

const updateShipment = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const shipment = await Shipment.findOne({ id: TRACKING_ID });
    if (!shipment) {
      console.error(`❌ No shipment found with id: ${TRACKING_ID}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`📦 Found shipment: ${shipment.id} | ${shipment.customer} | current status: ${shipment.status}`);

    // ─── Rebuild steps: everything up to "In Transit" becomes completed/active ───
    const inTransitNow = fmtDateTime(now);

    const updatedSteps = (shipment.steps || []).map((step) => {
      const event = (step.event || '').toLowerCase();

      if (event === 'order received' || event === 'shipment processed') {
        return {
          ...step.toObject?.() ?? step,
          status: 'completed',
          date: step.date || inTransitNow,
          location: step.location || 'Wyoming, USA'
        };
      }

      if (event === 'in transit') {
        return {
          ...step.toObject?.() ?? step,
          status: 'active',
          description: 'Departed Wyoming, USA – currently en route to Hinwil, Switzerland',
          date: inTransitNow,
          location: 'In transit – en route to Switzerland'
        };
      }

      // Everything after stays upcoming
      return {
        ...step.toObject?.() ?? step,
        status: 'upcoming'
      };
    });

    // ─── Update top-level fields ────────────────────────────────────
    shipment.status = 'In Transit';
    shipment.location = 'In transit – departed Wyoming, USA, en route to Hinwil, Switzerland';
    shipment.description =
      'High-value international shipment containing money and a car key. ' +
      'Currently in transit from Wyoming, USA to Walderstrasse 7, 8340 Hinwil, Switzerland. ' +
      `In transit as of ${inTransitNow}.`;
    shipment.dateTime = now.toISOString();

    shipment.steps = updatedSteps;
    shipment.history = updatedSteps;
    shipment.markModified('steps');
    shipment.markModified('history');

    await shipment.save();

    console.log(`✅ Shipment ${shipment.id} updated to status: ${shipment.status}`);
    console.log(`📍 Location: ${shipment.location}`);
    console.log(`🕒 In transit since: ${inTransitNow}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateShipment();