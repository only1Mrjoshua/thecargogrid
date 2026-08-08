import express from 'express';
import { uploadPackageImage } from '../controllers/uploadController.js';

const router = express.Router();

// Public upload route – no auth needed
router.post('/package-image', uploadPackageImage);

export default router;