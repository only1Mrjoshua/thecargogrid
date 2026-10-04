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

    // 2. Extract "upcoming" steps, but REMOVE any that we are now completing
    // This prevents "Delivered" from appearing twice or old placeholders showing up
    const upcomingSteps = shipment.steps.filter(step => 
      step.status === 'upcoming' && 
      !['Arrived at Destination Country', 'Out for Delivery', 'Delivered'].includes(step.event)
    );
    
    // 3. Get completed/active steps and remove duplicates of the new events
    let completedSteps = shipment.steps.filter(step => step.status !== 'upcoming');
    
    // Remove the new events if they already exist (prevents duplicates if script is run twice)
    completedSteps = completedSteps.filter(step => 
      step.event !== 'Arrived at destination country/region sorting center' || step.date !== '2026-09-26 07:36:37'
    );
    completedSteps = completedSteps.filter(step => 
      step.event !== 'Out for delivery' || step.date !== '2026-09-26 07:47:37'
    );
    completedSteps = completedSteps.filter(step => 
      step.event !== 'Delivered, Garage / Other Door / Other Location at Address' || step.date !== '2026-09-26 12:15:23'
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
        event: 'Arrived at destination country/region sorting center',
        status: 'completed',
        description: 'Shipment has arrived at the destination country sorting center.',
        date: '2026-09-26 07:36:37',
        location: 'Louisiana, USA'
      },
      {
        event: 'Out for delivery',
        status: 'completed',
        description: 'Shipment is out for final delivery with the local courier.',
        date: '2026-09-26 07:47:37',
        location: 'Louisiana, USA'
      },
      {
        event: 'Delivered, Garage / Other Door / Other Location at Address',
        status: 'completed', // Delivered is a completed step, no active steps remaining
        description: 'Shipment has been successfully delivered to the recipient.',
        date: '2026-09-26 12:15:23',
        location: 'Louisiana, USA'
      }
    ];

    // 6. Combine them: Completed Steps -> New Events -> Remaining Upcoming Steps
    const finalSteps = [...completedSteps, ...newEvents, ...upcomingSteps];

    // 7. Update the shipment fields
    shipment.steps = finalSteps;
    shipment.history = finalSteps; // Keep history in sync
    shipment.status = 'Delivered'; // Matches the enum in your schema
    shipment.location = 'Delivered - Louisiana, USA';
    shipment.dateTime = '2026-09-26T12:15:23';
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