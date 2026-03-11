import express from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import {
  getPendingTenants,
  getApprovedTenants,
  approveTenant,
  rejectTenant,
  deleteTenant
} from '../../controllers/admin/tenant.controller.js';
import {
  getPaymentsSummary,
  getPendingPayments,
  approvePayment,
  rejectPayment,
  getTenantPayments,
  deletePayment,
  resetTenantPassword,
  getTenantAadhaar
} from '../../controllers/admin/payment.controller.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    console.warn(`⚠️ Access denied for user ${req.user.email}. Role: ${req.user.role}`);
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Apply auth and isAdmin middleware to all routes below
router.use(authMiddleware);

// Tenant Management Routes
router.get('/pending-tenants', isAdmin, getPendingTenants);
router.get('/approved-tenants', isAdmin, getApprovedTenants);
router.post('/approve-tenant/:id', isAdmin, approveTenant);
router.delete('/reject-tenant/:id', isAdmin, rejectTenant);
router.delete('/delete-tenant/:id', isAdmin, deleteTenant);

// Payment Management Routes
router.get('/payments-summary', isAdmin, getPaymentsSummary);
router.get('/pending-payments', isAdmin, getPendingPayments);
router.post('/approve-payment/:paymentId', isAdmin, approvePayment);
router.post('/reject-payment/:paymentId', isAdmin, rejectPayment);
router.get('/tenant-payments/:tenantId', isAdmin, getTenantPayments);
router.delete('/delete-payment/:paymentId', isAdmin, deletePayment);

// Other Admin Routes
router.post('/reset-password/:tenantId', isAdmin, resetTenantPassword);
// This one has custom auth inside logic
router.get('/tenant-aadhaar/:id', getTenantAadhaar);

export default router;
