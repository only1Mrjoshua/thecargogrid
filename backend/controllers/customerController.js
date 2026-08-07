import User from '../models/User.js';
import Shipment from '../models/Shipment.js';

// @desc    Get all customers (users with role 'user')
// @route   GET /api/customers
// @access  Private/Admin
export const getCustomers = async (req, res, next) => {
  try {
    // Get all users with role 'user'
    const users = await User.find({ role: 'user' }).select('-password -refreshToken');
    // For each user, aggregate shipment statistics
    const customers = await Promise.all(users.map(async (user) => {
      const shipments = await Shipment.find({ email: user.email }); // or link by userId later
      const totalShipments = shipments.length;
      const activeShipments = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').length;
      const completedShipments = shipments.filter(s => s.status === 'Delivered').length;
      const paymentHistory = shipments.map(s => ({
        trackingNumber: s.id,
        amount: s.payment === 'Paid' ? s.fees?.total || 0 : 0,
        status: s.payment || 'Unpaid',
        date: s.date,
      }));
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '—',
        address: user.address || '—',
        totalShipments,
        activeShipments,
        completedShipments,
        paymentHistory,
        shipments: shipments.map(s => ({
          id: s.id,
          origin: s.origin,
          destination: s.destination,
          status: s.status,
          date: s.date,
        })),
      };
    }));
    res.status(200).json({ success: true, customers });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private/Admin
export const getCustomerById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const shipments = await Shipment.find({ email: user.email });
    const totalShipments = shipments.length;
    const activeShipments = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').length;
    const completedShipments = shipments.filter(s => s.status === 'Delivered').length;
    const paymentHistory = shipments.map(s => ({
      trackingNumber: s.id,
      amount: s.payment === 'Paid' ? s.fees?.total || 0 : 0,
      status: s.payment || 'Unpaid',
      date: s.date,
    }));
    const customer = {
      ...user.toObject(),
      totalShipments,
      activeShipments,
      completedShipments,
      paymentHistory,
      shipments: shipments.map(s => ({
        id: s.id,
        origin: s.origin,
        destination: s.destination,
        status: s.status,
        date: s.date,
      })),
    };
    res.status(200).json({ success: true, customer });
  } catch (err) {
    next(err);
  }
};

// @desc    Update customer info (admin only)
// @route   PUT /api/customers/:id
// @access  Private/Admin
export const updateCustomer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const allowedFields = ['name', 'email', 'phone', 'address', 'isActive'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });
    await user.save();
    res.status(200).json({ success: true, user: user.toObject() });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete customer (admin only)
// @route   DELETE /api/customers/:id
// @access  Private/Admin
export const deleteCustomer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};