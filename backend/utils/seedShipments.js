import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Shipment from '../models/Shipment.js';

dotenv.config();

// Fix DNS for MongoDB Atlas
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Helper to generate a random date within the last 30 days
const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString().slice(0, 10);
};

// Helper to generate a tracking number
const generateTracking = (index) => `TCG-${String(100000000000 + index).padStart(12, '0')}`;

// Helper to generate a document ID
const generateDocId = () => 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

// Predefined customers
const customers = [
  { name: 'John Smith', email: 'john@techsupply.co.uk', phone: '+44 20 7946 0958', address: '123 Business Park, London, E1 6AN' },
  { name: 'Alice Brown', email: 'alice@fastmove.co.uk', phone: '+44 161 234 5678', address: '10 Warehouse Lane, Manchester, M1 1AD' },
  { name: 'David Wilson', email: 'david@glasgowexports.co.uk', phone: '+44 141 555 0199', address: '88 Trade Street, Glasgow, G1 1AB' },
  { name: 'Emma Thompson', email: 'emma@londonretail.co.uk', phone: '+44 20 7946 0958', address: '22 Oxford Street, London, W1D 1AN' },
  { name: 'Mark Davies', email: 'mark@birminghamman.co.uk', phone: '+44 121 555 0199', address: '45 Industrial Estate, Birmingham, B1 1AB' },
];

// Origins & Destinations
const locations = [
  { origin: 'London, UK', destination: 'Edinburgh, UK' },
  { origin: 'Manchester, UK', destination: 'Bristol, UK' },
  { origin: 'Glasgow, UK', destination: 'London, UK' },
  { origin: 'Birmingham, UK', destination: 'Liverpool, UK' },
  { origin: 'Leeds, UK', destination: 'Glasgow, UK' },
];

// Package types
const packageTypes = ['Standard Parcel', 'Express Parcel', 'Freight', 'Documents', 'Fragile', 'Electronics'];
const weights = ['1.2 kg', '2.5 kg', '3.8 kg', '0.8 kg', '5.0 kg'];

// Define statuses and their timeline steps
const statusConfigs = {
  'In Transit': {
    status: 'In Transit',
    steps: [
      { event: 'Order Received', status: 'completed', description: 'Shipment created' },
      { event: 'Shipment Processed', status: 'completed', description: 'Package sorted and labelled' },
      { event: 'In Transit', status: 'active', description: 'Departed origin facility' },
      { event: 'Arrived at Facility', status: 'upcoming', description: 'Awaiting arrival at hub' },
      { event: 'Out for Delivery', status: 'upcoming', description: 'Will be dispatched to recipient' },
      { event: 'Delivered', status: 'upcoming', description: 'Package delivered to recipient' },
    ],
  },
  'Delivered': {
    status: 'Delivered',
    steps: [
      { event: 'Order Received', status: 'completed', description: 'Shipment created' },
      { event: 'Shipment Processed', status: 'completed', description: 'Package sorted and labelled' },
      { event: 'In Transit', status: 'completed', description: 'Departed origin facility' },
      { event: 'Arrived at Facility', status: 'completed', description: 'Arrived at destination hub' },
      { event: 'Out for Delivery', status: 'completed', description: 'Dispatched for delivery' },
      { event: 'Delivered', status: 'completed', description: 'Delivered to recipient' },
    ],
  },
  'Out for Delivery': {
    status: 'Out for Delivery',
    steps: [
      { event: 'Order Received', status: 'completed', description: 'Shipment created' },
      { event: 'Shipment Processed', status: 'completed', description: 'Package sorted and labelled' },
      { event: 'In Transit', status: 'completed', description: 'Departed origin facility' },
      { event: 'Arrived at Facility', status: 'completed', description: 'Arrived at destination hub' },
      { event: 'Out for Delivery', status: 'active', description: 'Out for delivery to recipient' },
      { event: 'Delivered', status: 'upcoming', description: 'Awaiting delivery confirmation' },
    ],
  },
  'Processing': {
    status: 'Processing',
    steps: [
      { event: 'Order Received', status: 'completed', description: 'Shipment created' },
      { event: 'Shipment Processed', status: 'active', description: 'Processing at facility' },
      { event: 'In Transit', status: 'upcoming', description: 'Awaiting departure' },
      { event: 'Out for Delivery', status: 'upcoming', description: 'Will be dispatched later' },
      { event: 'Delivered', status: 'upcoming', description: 'Package will be delivered' },
    ],
  },
  'Customs Hold': {
    status: 'Customs Hold',
    steps: [
      { event: 'Order Received', status: 'completed', description: 'Shipment created' },
      { event: 'Shipment Processed', status: 'completed', description: 'Package sorted and labelled' },
      { event: 'In Transit', status: 'completed', description: 'Departed origin facility' },
      { event: 'Arrived at Facility', status: 'completed', description: 'Arrived at customs facility' },
      { event: 'Customs Hold', status: 'active', description: 'Awaiting customs processing – documents required' },
      { event: 'Out for Delivery', status: 'upcoming', description: 'Will be dispatched after customs clearance' },
      { event: 'Delivered', status: 'upcoming', description: 'Package will be delivered after release' },
    ],
  },
};

// Document schema fields
const createDocument = (name, required = true) => ({
  id: generateDocId(),
  name: name,
  type: 'application/pdf',
  size: '100 KB',
  uploadDate: new Date().toISOString().slice(0, 10),
  attached: false,
  data: '',
  required: required,
  uploaded: false, // we set this for customs hold
});

// Additional customs hold details for the customs shipment
const customsHoldDetails = {
  reason: 'Missing commercial invoice',
  explanation: 'The shipment requires a detailed commercial invoice with correct HS codes and declared value.',
  instructions: 'Please provide the completed commercial invoice and proof of value. Upload the document or contact support.',
  fee: {
    amount: 35.00,
    currency: 'USD',
    description: 'Customs processing fee',
    paid: false,
  },
  nextSteps: 'Once documents are submitted and verified, the shipment will be released within 24 hours.',
  requiredDocuments: [
    createDocument('Commercial Invoice', true),
    createDocument('Packing List', true),
    createDocument('Proof of Value', false),
  ],
};

const seedShipments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const shipmentData = [];

    // Create 5 shipments
    for (let i = 0; i < 5; i++) {
      const customer = customers[i % customers.length];
      const location = locations[i % locations.length];
      const pkgType = packageTypes[i % packageTypes.length];
      const weight = weights[i % weights.length];
      const daysAgo = 30 - i * 5;

      let config;
      let customsData = null;

      // Make the 5th shipment customs hold (index 4)
      if (i === 4) {
        config = statusConfigs['Customs Hold'];
        customsData = customsHoldDetails;
      } else {
        const statusKeys = ['In Transit', 'Delivered', 'Out for Delivery', 'Processing'];
        config = statusConfigs[statusKeys[i % statusKeys.length]];
      }

      const trackingId = generateTracking(i + 1);
      const shipmentDate = randomDate(daysAgo);
      const expectedDelivery = new Date(new Date(shipmentDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      // Build steps with dates
      const steps = config.steps.map((step, idx) => {
        const stepDate = new Date(shipmentDate);
        stepDate.setDate(stepDate.getDate() + idx);
        return {
          ...step,
          date: stepDate.toISOString().slice(0, 16).replace('T', ' '),
          location: step.status === 'completed' || step.status === 'active' ? location.origin : '',
        };
      });

      // Build shipment object
      const shipment = {
        id: trackingId,
        customer: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        origin: location.origin,
        destination: location.destination,
        status: config.status,
        payment: i % 2 === 0 ? 'Paid' : 'Unpaid',
        date: shipmentDate,
        weight: weight,
        packageType: pkgType,
        expectedDelivery: expectedDelivery,
        location: config.status === 'Customs Hold' ? 'Customs Clearance Centre, London' : location.origin,
        description: config.status === 'Customs Hold' ? customsHoldDetails.reason : 'Standard shipment',
        dateTime: new Date().toISOString(),
        steps: steps,
        history: steps, // duplicate for compatibility
        documents: config.status === 'Customs Hold' ? customsHoldDetails.requiredDocuments : [],
        fees: config.status === 'Customs Hold' ? customsHoldDetails.fee : {
          total: parseFloat((Math.random() * 50 + 20).toFixed(2)),
          currency: 'USD',
          paid: i % 2 === 0,
          breakdown: [
            { label: 'Shipping', amount: parseFloat((Math.random() * 30 + 10).toFixed(2)) },
            { label: 'Handling', amount: parseFloat((Math.random() * 10 + 2).toFixed(2)) },
          ],
        },
      };

      // Add customs hold extra fields
      if (config.status === 'Customs Hold') {
        shipment.currentLocation = 'Customs Clearance Centre, London';
        shipment.nextAction = 'Submit documents';
        shipment.reason = customsHoldDetails.reason;
        shipment.explanation = customsHoldDetails.explanation;
        shipment.instructions = customsHoldDetails.instructions;
        shipment.requiredDocuments = customsHoldDetails.requiredDocuments; // This field is not in model, but we can add it as extra
        shipment.fee = customsHoldDetails.fee;
        shipment.nextSteps = customsHoldDetails.nextSteps;
        // ensure documents are stored
        shipment.documents = customsHoldDetails.requiredDocuments;
      }

      shipmentData.push(shipment);
    }

    // Delete existing shipments (optional – comment out if you want to keep)
    // await Shipment.deleteMany({});
    // console.log('🗑️ Deleted existing shipments');

    // Insert shipments
    const result = await Shipment.insertMany(shipmentData);
    console.log(`✅ Created ${result.length} shipments:`);
    result.forEach(s => {
      console.log(`   - ${s.id} | ${s.customer} | ${s.status}`);
    });

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Seed error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedShipments();