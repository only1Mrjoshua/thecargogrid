import express from 'express';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  resendNotification,
  searchNotifications,
  getNotificationStats,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All notification routes are protected and require admin role
router.use(protect, authorize('admin'));

router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.get('/search', searchNotifications);
router.get('/stats', getNotificationStats);

router.post('/:id/resend', resendNotification);

router.route('/:id')
  .get(getNotificationById)
  .put(updateNotification)
  .delete(deleteNotification);

export default router;