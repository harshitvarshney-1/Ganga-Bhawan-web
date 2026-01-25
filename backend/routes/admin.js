const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Payment = require('../models/Payment');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// GET: All pending tenant approvals
router.get('/pending-tenants', auth, isAdmin, async (req, res) => {
  try {
    const tenants = await User.find({
      role: 'tenant',
      isApproved: false
    });

    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: All approved tenants
router.get('/approved-tenants', auth, isAdmin, async (req, res) => {
  try {
    const tenants = await User.find({
      role: 'tenant',
      isApproved: true
    });

    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST: Approve tenant
router.post('/approve-tenant/:id', auth, isAdmin, async (req, res) => {
  try {
    const tenant = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      success: true,
      message: 'Tenant approved successfully',
      tenant
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE: Reject tenant (for pending tenants)
router.delete('/reject-tenant/:id', auth, isAdmin, async (req, res) => {
  try {
    const tenant = await User.findByIdAndDelete(req.params.id);

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      success: true,
      message: 'Tenant rejected successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE: Permanently delete tenant (for when tenant leaves PG)
router.delete('/delete-tenant/:id', auth, isAdmin, async (req, res) => {
  try {
    const tenant = await User.findByIdAndDelete(req.params.id);

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      success: true,
      message: 'Tenant deleted permanently'
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: Payments summary for all tenants
router.get('/payments-summary', auth, isAdmin, async (req, res) => {
  try {
    // Get all tenants
    const tenants = await User.find({ role: 'tenant' }).select('_id fullName email');

    // Get all successful payments
    const payments = await Payment.find({ status: 'success' })
      .sort({ paymentDate: -1 })
      .populate('userId', 'fullName email');

    // Create a map of tenant payments
    const tenantPaymentMap = {};

    payments.forEach(payment => {
      // payment.userId could be null if the tenant was deleted
      if (!payment.userId) return;

      const tenantId = payment.userId._id.toString();

      if (!tenantPaymentMap[tenantId]) {
        tenantPaymentMap[tenantId] = {
          tenantId: tenantId,
          latestMonthPaid: null,
          latestPaymentDate: null,
          status: 'failed', // default
          totalPayments: 0
        };
      }

      // Update latest payment if this is more recent
      if (!tenantPaymentMap[tenantId].latestPaymentDate ||
        payment.paymentDate > tenantPaymentMap[tenantId].latestPaymentDate) {
        tenantPaymentMap[tenantId].latestMonthPaid = payment.month;
        tenantPaymentMap[tenantId].latestPaymentDate = payment.paymentDate;
        tenantPaymentMap[tenantId].status = 'success';
      }

      tenantPaymentMap[tenantId].totalPayments += 1;
    });

    // Create summary array for all tenants
    const summary = tenants.map(tenant => {
      const tenantId = tenant._id.toString();
      const paymentInfo = tenantPaymentMap[tenantId];

      if (paymentInfo) {
        return {
          tenantId: tenantId,
          latestMonthPaid: paymentInfo.latestMonthPaid,
          status: paymentInfo.status,
          totalPayments: paymentInfo.totalPayments,
          latestPaymentDate: paymentInfo.latestPaymentDate
        };
      } else {
        // No payments found for this tenant
        return {
          tenantId: tenantId,
          latestMonthPaid: null,
          status: 'failed',
          totalPayments: 0,
          latestPaymentDate: null
        };
      }
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching payments summary:', error);
    res.status(500).json({ error: 'Failed to fetch payments summary' });
  }
});

// GET: Pending Payments (for admin approval)
router.get('/pending-payments', auth, isAdmin, async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('userId', 'fullName email mobileNumber')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
});

// POST: Approve Payment
router.post('/approve-payment/:paymentId', auth, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment is not pending' });
    }

    payment.status = 'success';
    payment.approvedBy = req.user.userId || req.user.id;
    payment.approvedAt = new Date();

    await payment.save();

    res.json({
      success: true,
      message: 'Payment approved successfully',
      payment
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

// POST: Reject Payment
router.post('/reject-payment/:paymentId', auth, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment is not pending' });
    }

    payment.status = 'rejected';
    payment.approvedBy = req.user.userId || req.user.id;
    payment.approvedAt = new Date();

    await payment.save();

    res.json({
      success: true,
      message: 'Payment rejected',
      payment
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// GET: All payments for a specific tenant (for payment history grid)
router.get('/tenant-payments/:tenantId', auth, isAdmin, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.tenantId })
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching tenant payments:', error);
    res.status(500).json({ error: 'Failed to fetch tenant payments' });
  }
});

// POST: Reset tenant password (manual override by admin)
router.post('/reset-password/:tenantId', auth, isAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const tenant = await User.findById(req.params.tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    tenant.password = hashedPassword;
    await tenant.save();

    res.json({
      success: true,
      message: `Password for ${tenant.fullName} has been updated successfully.`
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// GET: Serving Aadhaar file from database Buffer
router.get('/tenant-aadhaar/:id', async (req, res) => {
  try {
    // Custom auth logic for query param token (for <img> and <iframe>)
    const token = req.query.token || (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin' && decoded.userId !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tenant = await User.findById(req.params.id);
    if (!tenant || !tenant.aadhaarFileData || !tenant.aadhaarFileData.data) {
      return res.status(404).json({ error: 'Aadhaar file not found' });
    }

    res.set('Content-Type', tenant.aadhaarFileData.contentType || 'image/jpeg');
    res.send(tenant.aadhaarFileData.data);
  } catch (error) {
    console.error('Error serving Aadhaar file:', error);
    res.status(500).json({ error: 'Server error serving file' });
  }
});

// DELETE: Delete a payment (Revoke approval/Reset status)
router.delete('/delete-payment/:paymentId', auth, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      message: 'Payment record deleted successfully. Tenant can now re-upload.'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

module.exports = router;