import express from 'express';
import {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All customer routes are protected and require admin role
router.use(protect, authorize('admin'));

router.route('/')
  .get(getCustomers);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

export default router;