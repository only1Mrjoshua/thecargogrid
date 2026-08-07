import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  searchInvoices,
  getInvoiceStats,
} from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All invoice routes are protected and require admin role
router.use(protect, authorize('admin'));

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.get('/search', searchInvoices);
router.get('/stats', getInvoiceStats);

router.route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

export default router;