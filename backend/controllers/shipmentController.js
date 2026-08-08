import Shipment from '../models/Shipment.js';

export const getShipments = async (req, res, next) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, shipments });
  } catch (err) {
    next(err);
  }
};

export const getShipmentById = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
};

export const createShipment = async (req, res, next) => {
  try {
    const {
      id, customer, origin, destination, status, payment,
      date, weight, packageType, expectedDelivery,
      email, phone, address
    } = req.body;

    // Required field validation
    if (!customer || !origin || !destination) {
      return res.status(400).json({ message: 'Customer, origin, and destination are required' });
    }

    // Generate tracking number if not provided
    let trackingId = id;
    if (!trackingId) {
      const random = Math.floor(Math.random() * 10**12).toString().padStart(12, '0');
      trackingId = `TCG-${random}`;
    }

    // Check for duplicate tracking number
    const existing = await Shipment.findOne({ id: trackingId });
    if (existing) {
      return res.status(400).json({ message: 'Tracking number already exists' });
    }

    // Prepare shipment data
    const shipmentData = {
      id: trackingId,
      customer,
      email: email || '',
      phone: phone || '',
      address: address || '',
      origin,
      destination,
      status: status || 'Pending',
      payment: payment || 'Unpaid',
      date: date || new Date().toISOString().slice(0, 10),
      weight: weight || '',
      packageType: packageType || 'Standard Parcel',
      expectedDelivery: expectedDelivery || '',
      createdBy: req.userId,
      history: [],
      steps: [],
      documents: [],
      fees: {},
      lastUpdated: new Date().toISOString(),
    };

    const shipment = await Shipment.create(shipmentData);
    res.status(201).json({ success: true, shipment });
  } catch (err) {
    // ✅ Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    // Handle duplicate key error (MongoDB)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Tracking number already exists' });
    }
    console.error('Create shipment error:', err);
    next(err);
  }
};

export const updateShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const allowedFields = [
      'customer', 'email', 'phone', 'address', 'origin', 'destination',
      'status', 'payment', 'date', 'weight', 'packageType', 'expectedDelivery',
      'location', 'description', 'dateTime', 'nextAction', 'lastUpdated',
      'history', 'steps', 'documents', 'fees'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        shipment[field] = req.body[field];
      }
    });

    if (req.body.status && shipment.status !== req.body.status) {
      shipment.history = shipment.history || [];
      shipment.history.push({
        event: `Status changed to ${req.body.status}`,
        status: req.body.status,
        date: new Date().toISOString(),
        description: 'Admin update',
      });
    }

    shipment.lastUpdated = new Date().toISOString();
    await shipment.save();

    res.status(200).json({ success: true, shipment });
  } catch (err) {
    // Handle validation errors on update
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(err);
  }
};

export const deleteShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    await shipment.deleteOne();
    res.status(200).json({ success: true, message: 'Shipment deleted' });
  } catch (err) {
    next(err);
  }
};

export const searchShipments = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const shipments = await Shipment.find({
      $or: [
        { id: { $regex: q, $options: 'i' } },
        { customer: { $regex: q, $options: 'i' } },
        { origin: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } },
      ]
    });
    res.status(200).json({ success: true, shipments });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a milestone to the shipment timeline
// @route   POST /api/shipments/:id/timeline
// @access  Private
export const addTimelineStep = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const { event, status, date, description, location } = req.body;
    if (!event) {
      return res.status(400).json({ message: 'Event label is required' });
    }

    const newStep = {
      event,
      status: status || 'upcoming',
      date: date || new Date().toISOString().slice(0, 16),
      description: description || '',
      location: location || '',
    };

    shipment.steps = shipment.steps || [];
    shipment.steps.push(newStep);
    await shipment.save();

    res.status(201).json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a timeline step
// @route   PUT /api/shipments/:id/timeline/:stepIndex
// @access  Private
export const updateTimelineStep = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const stepIndex = parseInt(req.params.stepIndex);
    if (isNaN(stepIndex) || stepIndex < 0 || stepIndex >= (shipment.steps || []).length) {
      return res.status(400).json({ message: 'Invalid step index' });
    }

    const { event, status, date, description, location } = req.body;
    const step = shipment.steps[stepIndex];

    if (event) step.event = event;
    if (status) step.status = status;
    if (date) step.date = date;
    if (description) step.description = description;
    if (location) step.location = location;

    await shipment.save();
    res.status(200).json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a timeline step
// @route   DELETE /api/shipments/:id/timeline/:stepIndex
// @access  Private
export const deleteTimelineStep = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const stepIndex = parseInt(req.params.stepIndex);
    if (isNaN(stepIndex) || stepIndex < 0 || stepIndex >= (shipment.steps || []).length) {
      return res.status(400).json({ message: 'Invalid step index' });
    }

    shipment.steps.splice(stepIndex, 1);
    await shipment.save();
    res.status(200).json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all documents for a shipment
// @route   GET /api/shipments/:id/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json({ success: true, documents: shipment.documents || [] });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload a document to a shipment
// @route   POST /api/shipments/:id/documents
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const { name, type, size, data, attached } = req.body;
    console.log('📄 Upload request:', { 
      name, 
      type, 
      size, 
      attached, 
      dataLength: data?.length 
    });

    if (!name || !data) {
      return res.status(400).json({ message: 'Document name and data are required' });
    }

    // Generate unique ID
    const docId = 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const newDoc = {
      id: docId,
      name: name,
      type: type || 'application/pdf',
      size: size || '',
      uploadDate: new Date().toISOString().slice(0, 10),
      attached: attached || false,
      data: data,
    };

    shipment.documents = shipment.documents || [];
    shipment.documents.push(newDoc);
    await shipment.save();

    res.status(201).json({ success: true, document: newDoc });
  } catch (err) {
    console.error('❌ Upload error:', err);
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    // Handle duplicate key or other errors
    next(err);
  }
};

// @desc    Delete a document from a shipment
// @route   DELETE /api/shipments/:id/documents/:docId
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const { docId } = req.params;
    const initialLength = shipment.documents.length;
    shipment.documents = shipment.documents.filter(doc => doc.id !== docId);

    if (shipment.documents.length === initialLength) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await shipment.save();
    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Download a document (returns the file data)
// @route   GET /api/shipments/:id/documents/:docId/download
// @access  Private
export const downloadDocument = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const { docId } = req.params;
    const doc = shipment.documents.find(d => d.id === docId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // In a real app, you might stream a file from disk or cloud storage.
    // Here we'll return the base64 data.
    res.status(200).json({
      success: true,
      document: {
        name: doc.name,
        type: doc.type,
        file: doc.file,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle document attachment status
// @route   PATCH /api/shipments/:id/documents/:docId/toggle
// @access  Private
export const toggleDocumentAttach = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const { docId } = req.params;
    const doc = shipment.documents.find(d => d.id === docId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    doc.attached = !doc.attached;
    await shipment.save();
    res.status(200).json({ success: true, document: doc });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all unique customers with their tracking numbers
// @route   GET /api/shipments/customers
// @access  Private
export const getCustomersWithShipments = async (req, res, next) => {
  try {
    const shipments = await Shipment.find({}, 'customer id').sort({ customer: 1 });
    const customerMap = {};
    shipments.forEach(s => {
      if (!customerMap[s.customer]) {
        customerMap[s.customer] = [];
      }
      customerMap[s.customer].push(s.id);
    });
    const customers = Object.keys(customerMap).map(name => ({
      name,
      trackingNumbers: customerMap[name]
    }));
    res.status(200).json({ success: true, customers });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single shipment by tracking number (public)
// @route   GET /api/shipments/public/:id
// @access  Public
export const getPublicShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ id: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json({ success: true, shipment });
  } catch (err) {
    next(err);
  }
};

// @desc    Public booking endpoint – create a shipment from frontend form
// @route   POST /api/shipments/public/book
// @access  Public
export const publicBookShipment = async (req, res, next) => {
  try {
    const {
      sender, receiver, package: pkg, shippingOption, additionalServices,
      quote, pickupDate, pickupTime
    } = req.body;

    // Validate required sender info
    if (!sender?.name || !sender?.email || !sender?.phone || !sender?.address) {
      return res.status(400).json({ message: 'Sender information is required' });
    }
    if (!receiver?.name || !receiver?.email || !receiver?.phone || !receiver?.address) {
      return res.status(400).json({ message: 'Receiver information is required' });
    }
    if (!pkg?.weight || !pkg?.category) {
      return res.status(400).json({ message: 'Package weight and category are required' });
    }

    // 🔐 Generate a unique tracking number
    const generateTracking = () => {
      const random = Math.floor(Math.random() * 10**12).toString().padStart(12, '0');
      return `TCG-${random}`;
    };

    let trackingId;
    let isUnique = false;
    // Ensure uniqueness (with a simple loop – in production you'd use a more robust method)
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      trackingId = generateTracking();
      const existing = await Shipment.findOne({ id: trackingId });
      if (!existing) isUnique = true;
      attempts++;
    }
    if (!isUnique) {
      return res.status(500).json({ message: 'Could not generate a unique tracking number. Please try again.' });
    }

    // Build shipment data – now with a pre‑generated `id`
    const shipmentData = {
      id: trackingId, // ✅ explicitly set the tracking number
      customer: sender.name,
      email: sender.email,
      phone: sender.phone,
      address: sender.address,
      origin: sender.address,
      destination: receiver.address,
      packageType: pkg.category || 'Standard Parcel',
      weight: String(pkg.weight),
      status: 'Order Received',
      payment: 'Unpaid',
      date: new Date().toISOString().slice(0, 10),
      expectedDelivery: quote?.deliveryTime || '2-4 business days',
      sender: {
        name: sender.name,
        email: sender.email,
        phone: sender.phone,
        address: sender.address,
      },
      receiver: {
        name: receiver.name,
        email: receiver.email,
        phone: receiver.phone,
        address: receiver.address,
      },
      packageDetails: {
        length: pkg.length || 0,
        width: pkg.width || 0,
        height: pkg.height || 0,
        declaredValue: pkg.declaredValue || 0,
        isFragile: pkg.isFragile || false,
        isDangerous: pkg.isDangerous || false,
        description: pkg.description || '',
        category: pkg.category || '',
        images: pkg.images || [],
      },
      shippingOption: shippingOption || 'standard',
      additionalServices: additionalServices || [],
      fees: {
        total: quote?.total || 0,
        currency: quote?.currency || 'USD',
        paid: false,
        breakdown: quote?.breakdown || [],
      },
      bookingData: {
        ...req.body,
      },
      dateTime: pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : '',
    };

    // Generate initial timeline steps
    shipmentData.steps = [
      { event: 'Order Received', status: 'completed', date: new Date().toISOString().slice(0, 16).replace('T', ' '), description: 'Shipment created' },
      { event: 'Processing', status: 'active', date: new Date().toISOString().slice(0, 16).replace('T', ' '), description: 'Booking confirmed' },
      { event: 'In Transit', status: 'upcoming', date: null, description: 'Awaiting pickup' },
      { event: 'Out for Delivery', status: 'upcoming', date: null, description: 'Will be dispatched later' },
      { event: 'Delivered', status: 'upcoming', date: null, description: 'Package will be delivered' },
    ];

    const shipment = await Shipment.create(shipmentData);

    res.status(201).json({
      success: true,
      trackingNumber: shipment.id,
      shipment: shipment,
    });
  } catch (err) {
    console.error('❌ Booking error details:', err);

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message,
        value: e.value,
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({ message: 'Tracking number already exists' });
    }

    next(err);
  }
};