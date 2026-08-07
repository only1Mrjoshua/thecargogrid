import express from 'express';
import {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  searchShipments,
  addTimelineStep,
  updateTimelineStep,
  deleteTimelineStep,
  getDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  toggleDocumentAttach,
  getCustomersWithShipments,
  getPublicShipment,  // ✅ new import
} from '../controllers/shipmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ✅ PUBLIC ROUTES – NO AUTH REQUIRED
router.get('/public/:id', getPublicShipment);

// ✅ PROTECTED ADMIN ROUTES
router.use(protect, authorize('admin'));

// Main CRUD
router.route('/')
  .get(getShipments)
  .post(createShipment);

router.get('/search', searchShipments);
router.get('/customers', getCustomersWithShipments);

router.route('/:id')
  .get(getShipmentById)
  .put(updateShipment)
  .delete(deleteShipment);

// Timeline routes
router.post('/:id/timeline', addTimelineStep);
router.put('/:id/timeline/:stepIndex', updateTimelineStep);
router.delete('/:id/timeline/:stepIndex', deleteTimelineStep);

// Document routes
router.get('/:id/documents', getDocuments);
router.post('/:id/documents', uploadDocument);
router.delete('/:id/documents/:docId', deleteDocument);
router.get('/:id/documents/:docId/download', downloadDocument);
router.patch('/:id/documents/:docId/toggle', toggleDocumentAttach);

export default router;