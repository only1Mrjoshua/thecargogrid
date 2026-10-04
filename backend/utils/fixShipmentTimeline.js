import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Shipment from '../models/Shipment.js'; // Ensure this path is correct

dotenv.config();

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const fixShipmentTimeline = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const trackingId = 'TCG-974864982129';
    
    // 1. Find the shipment
    const shipment = await Shipment.findOne({ id: trackingId });

    if (!shipment) {
      console.error(`❌ Shipment with ID ${trackingId} not found.`);
      process.exit(1);
    }

    console.log(`📦 Found shipment: ${shipment.id} | Current Status: ${shipment.status}`);

    // 2. Separate "upcoming" steps from the rest
    const upcomingSteps = shipment.steps.filter(step => step.status === 'upcoming');
    
    // 3. Get the completed/active steps and remove the ones we just added (to prevent duplicates)
    let completedSteps = shipment.steps.filter(step => step.status !== 'upcoming');
    
    // Remove the recently added events so we can re-insert them in the correct position
    completedSteps = completedSteps.filter(step => 
      step.event !== 'Departed from departure country/region' || step.date !== '2026-09-20 22:59:00'
    );
    completedSteps = completedSteps.filter(step => 
      step.event !== 'Arrived at linehaul office' || step.date !== '2026-09-21 01:21:00'
    );

    // 4. Mark any previously "active" steps as "completed"
    completedSteps = completedSteps.map(step => {
      if (step.status === 'active') {
        return { ...step, status: 'completed' };
      }
      return step;
    });

    // 5. Define the new events
    const newEvents = [
      {
        event: 'Departed from departure country/region',
        status: 'completed',
        description: 'Shipment has officially departed the origin country and is en route.',
        date: '2026-09-20 22:59:00',
        location: 'Colombo, Sri Lanka'
      },
      {
        event: 'Arrived at linehaul office',
        status: 'active', // Most recent event
        description: 'Shipment has arrived at the linehaul office for sorting and transit.',
        date: '2026-09-21 01:21:00',
        location: 'Transit Hub'
      }
    ];

    // 6. Combine them: Completed Steps -> New Events -> Upcoming Steps
    const finalSteps = [...completedSteps, ...newEvents, ...upcomingSteps];

    // 7. Update the shipment
    shipment.steps = finalSteps;
    shipment.history = finalSteps; // Keep history in sync
    shipment.status = 'In Transit';
    shipment.location = 'Arrived at Linehaul Office';
    shipment.dateTime = '2026-09-21T01:21:00';
    shipment.lastUpdated = new Date().toISOString();

    // 8. Save changes
    await shipment.save();

    console.log('✅ Timeline successfully reordered and updated!');
    console.log(`📦 Current Status: ${shipment.status}`);
    console.log(`📍 Latest Location: ${shipment.location}`);
    
    // Log the order of events to verify
    console.log('\n📋 Verifying Order:');
    shipment.steps.forEach((step, index) => {
      console.log(`${index + 1}. [${step.status}] ${step.event} - ${step.date}`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error updating shipment:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

fixShipmentTimeline();