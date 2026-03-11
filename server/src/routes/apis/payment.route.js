import express from 'express';
import { upload } from '../../infra/cloudinary.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { submitPayment } from '../../controllers/payment/submit.controller.js';
import { getPaymentHistory } from '../../controllers/payment/history.controller.js';

const router = express.Router();

router.get('/history', authMiddleware, getPaymentHistory);
router.post('/submit', authMiddleware, upload.single('barcodeImage'), submitPayment);

export default router;
