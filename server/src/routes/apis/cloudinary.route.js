import express from 'express';
import { getCloudinarySignature } from '../../controllers/cloudinary/sign.controller.js';

const router = express.Router();

// POST /api/cloudinary/sign
router.post('/sign', getCloudinarySignature);

export default router;
