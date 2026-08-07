import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import dns from 'dns';

dotenv.config();

// DNS fix for seed script
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    const adminEmail = 'admin@thecargogrid.com';
    const existing = await User.findOne({ email: adminEmail });

    if (!existing) {
      await User.create({
        email: adminEmail,
        password: 'password123',
        name: 'Admin User',
        role: 'admin'
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seedAdmin();