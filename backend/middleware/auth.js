import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account disabled' });
      }
      req.user = user;

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } catch (err) {
    next(err);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};