import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import Shipment from '../models/Shipment.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the parent folder (backend root)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// DNS settings (same as your seed script)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const fixShipment = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const trackingId = 'TCG-428831589476';
    const shipment = await Shipment.findOne({ id: trackingId });

    if (!shipment) {
      console.log('❌ Shipment not found');
      process.exit(0);
    }

    // Update images to use production domain
    shipment.packageDetails.images = [
      'https://thecargogrid.com/car.jpeg',
      'https://thecargogrid.com/box.jpeg'
    ];

    await shipment.save();
    console.log(`✅ Updated images for ${trackingId}`);
    console.log('New images:', shipment.packageDetails.images);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

fixShipment();