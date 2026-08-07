import express from 'express';
import {
  getReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  searchReceipts,
} from '../controllers/receiptController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All receipt routes are protected and require admin role
router.use(protect, authorize('admin'));

router.route('/')
  .get(getReceipts)
  .post(createReceipt);

router.get('/search', searchReceipts);

router.route('/:id')
  .get(getReceiptById)
  .put(updateReceipt)
  .delete(deleteReceipt);

export default router;