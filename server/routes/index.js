import express from 'express';
import authRouter from './api/auth.routes.js';
import tenantRouter from './api/tenant.routes.js';
import paymentRouter from './api/payment.routes.js';
import adminRouter from './api/admin.routes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/tenant', tenantRouter);
router.use('/payment', paymentRouter);
router.use('/admin', adminRouter);

export default router;
