import express from 'express';
import authMiddleware from '../../middleware/auth.middleware';
import getHistoryController from '../../controllers/payment/get-history.controller';
import sendPaymentController from '../../controllers/payment/send-payment.controller';

const paymentRouter = express.Router();

paymentRouter.get('/history', authMiddleware, getHistoryController);
paymentRouter.post('/send', authMiddleware, sendPaymentController);

export default paymentRouter;
