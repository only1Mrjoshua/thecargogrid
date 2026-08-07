import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login', login);

// Protected
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Admin only example
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome admin' });
});

export default router;