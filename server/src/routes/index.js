import express from 'express';
import authRoutes from './apis/auth.route.js';
import paymentRoutes from './apis/payment.route.js';
import tenantRoutes from './apis/tenant.route.js';
import adminRoutes from './apis/admin.route.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/payments', paymentRoutes);
router.use('/tenant', tenantRoutes);
router.use('/admin', adminRoutes);

export default router;
