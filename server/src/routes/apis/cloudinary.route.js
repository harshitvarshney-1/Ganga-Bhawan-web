import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { getCloudinarySignature } from '../../controllers/cloudinary/sign.controller.js';

const router = express.Router();

// Rate limiting: prevent bot abuse of signature generation
const signLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 signature requests per window
  message: { error: 'Too many upload attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/cloudinary/sign
router.post('/sign', signLimiter, getCloudinarySignature);

export default router;
