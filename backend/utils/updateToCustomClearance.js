// utils/updateToCustomsHold.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Shipment from '../models/Shipment.js';

dotenv.config();

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const TRACKING_ID = 'TCG-883011516487';
const CUSTOM_CLEARANCE_FEE = 3189.00;

// ✅ Matches the enum in models/Shipment.js
const HOLD_STATUS = 'Customs Hold';

// ─── Date helpers ───────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDateTime = (d) => `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

const now = new Date();
const nowStr = fmtDateTime(now);
const feeLabel = `$${CUSTOM_CLEARANCE_FEE.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

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

      if (event.includes('custom') || event.includes('clearance') || event.includes('hold')) {
        return {
          ...plain,
          event: 'Vehicle Customs Hold',
          status: 'active',
          description: `Held at a European transit port near Belgium pending customs clearance. Outstanding customs fee of ${feeLabel} must be settled before release.`,
          date: nowStr,
          location: 'European Transit Port, near Belgium'
        };
      }

      return { ...plain, status: 'upcoming' };
    });

    // Insert the hold step if missing
    const hasHoldStep = updatedSteps.some((s) =>
      (s.event || '').toLowerCase().includes('hold') ||
      (s.event || '').toLowerCase().includes('clearance') ||
      (s.event || '').toLowerCase().includes('custom')
    );

    if (!hasHoldStep) {
      const inTransitIdx = updatedSteps.findIndex((s) =>
        (s.event || '').toLowerCase() === 'in transit'
      );
      const insertAt = inTransitIdx >= 0 ? inTransitIdx + 1 : updatedSteps.length;
      updatedSteps.splice(insertAt, 0, {
        event: 'Vehicle Customs Hold',
        status: 'active',
        description: `Held at a European transit port near Belgium pending customs clearance. Outstanding customs fee of ${feeLabel} must be settled before release.`,
        date: nowStr,
        location: 'European Transit Port, near Belgium'
      });
    }

    // ─── Top-level fields ───────────────────────────────────────────
    shipment.status = HOLD_STATUS;
    shipment.location = 'European Transit Port, near Belgium';
    shipment.description =
      `Vehicle held pending customs clearance at a European transit port near Belgium. ` +
      `Customs fee of ${feeLabel} must be paid before release. En route to Switzerland.`;
    shipment.dateTime = now.toISOString();
    shipment.lastUpdated = now.toISOString();
    shipment.nextAction = `Pay customs clearance fee of ${feeLabel} to release the vehicle`;

    // ─── Fees: ONLY the unpaid customs fee ──────────────────────────
    shipment.fees = {
      total: CUSTOM_CLEARANCE_FEE,
      currency: 'USD',
      paid: false,
      breakdown: [
        { label: 'Import Custom Clearance Fee', amount: CUSTOM_CLEARANCE_FEE }
      ]
    };

    // ─── Special instructions ───────────────────────────────────────
    shipment.specialInstructions =
      `Vehicle on customs hold at a European transit port near Belgium. ` +
      `Customs fee of ${feeLabel} must be paid before clearance and release. ` +
      `No additional documents required. Destination: Switzerland.`;

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

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateShipment();