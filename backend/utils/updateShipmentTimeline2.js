import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Shipment from '../models/Shipment.js'; // Ensure this path is correct

dotenv.config();

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const updateShipmentTimeline = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const trackingId = 'TCG-974864982129';
    
    // 1. Find the shipment by custom ID
    const shipment = await Shipment.findOne({ id: trackingId });

    if (!shipment) {
      console.error(`❌ Shipment with ID ${trackingId} not found.`);
      process.exit(1);
    }

    console.log(`📦 Found shipment: ${shipment.id} | Current Status: ${shipment.status}`);

    // 2. Separate "upcoming" steps from the rest
    const upcomingSteps = shipment.steps.filter(step => step.status === 'upcoming');
    
    // 3. Get completed/active steps and remove any duplicate new events
    let completedSteps = shipment.steps.filter(step => step.status !== 'upcoming');
    
    // Remove the new events if they already exist (prevents duplicates if script is run twice)
    completedSteps = completedSteps.filter(step => 
      step.event !== 'Import customs clearance complete' || step.date !== '2026-09-22 11:47:00'
    );
    completedSteps = completedSteps.filter(step => 
      step.event !== 'Departed from customs' || step.date !== '2026-09-22 17:41:00'
    );
    completedSteps = completedSteps.filter(step => 
      step.event !== 'Accepted at USPS Facility' || step.date !== '2026-09-23 08:44:44'
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
        event: 'Import customs clearance complete',
        status: 'completed',
        description: 'Import customs clearance has been completed successfully.',
        date: '2026-09-22 11:47:00',
        location: 'USA Customs'
      },
      {
        event: 'Departed from customs',
        status: 'completed',
        description: 'Shipment has been released from customs and is moving to the next facility.',
        date: '2026-09-22 17:41:00',
        location: 'USA Customs'
      },
      {
        event: 'Accepted at USPS Facility',
        status: 'active', // This is the most recent event
        description: 'Shipment has been accepted by USPS for final delivery.',
        date: '2026-09-23 08:44:44',
        location: 'USPS Facility'
      }
    ];

    // 6. Combine them: Completed Steps -> New Events -> Upcoming Steps
    const finalSteps = [...completedSteps, ...newEvents, ...upcomingSteps];

    // 7. Update the shipment fields
    shipment.steps = finalSteps;
    shipment.history = finalSteps; // Keep history in sync
    shipment.status = 'Arrived at Facility'; // Updated status based on the latest event
    shipment.location = 'USPS Facility';
    shipment.dateTime = '2026-09-23T08:44:44';
    shipment.lastUpdated = new Date().toISOString();

    // 8. Save changes
    await shipment.save();

    console.log('✅ Timeline successfully updated!');
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

updateShipmentTimeline();