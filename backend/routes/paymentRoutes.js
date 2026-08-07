import express from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  searchPayments,
  getPaymentStats,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All payment routes are protected and require admin role
router.use(protect, authorize('admin'));

router.route('/')
  .get(getPayments)
  .post(createPayment);

router.get('/search', searchPayments);
router.get('/stats', getPaymentStats);

router.route('/:id')
  .get(getPaymentById)
  .put(updatePayment)
  .delete(deletePayment);

export default router;