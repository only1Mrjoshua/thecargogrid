// utils/updateWeight.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Shipment from '../models/Shipment.js';

dotenv.config();

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const TRACKING_ID = 'TCG-883011516487';
const NEW_WEIGHT = '2,607 kg';   // 🔁 change to just '2,607' if you don't want the unit

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

    console.log(`📦 Found shipment: ${shipment.id} | ${shipment.customer}`);
    console.log(`⚖️  Old weight: ${shipment.weight || '(empty)'}`);

    shipment.weight = NEW_WEIGHT;
    shipment.lastUpdated = new Date().toISOString();

    await shipment.save();

    console.log(`✅ Weight updated to: ${shipment.weight}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateShipment();