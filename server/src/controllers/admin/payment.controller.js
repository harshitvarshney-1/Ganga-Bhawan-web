import Payment from '../../models/payment.model.js';
import User from '../../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { currentConfig } from '../../config/env.js';

export const getPaymentsSummary = async (req, res) => {
  try {
    const tenants = await User.find({ role: 'tenant' }).select('_id fullName email');

    const payments = await Payment.find({ status: 'success' })
      .sort({ paymentDate: -1 })
      .populate('userId', 'fullName email');

    const tenantPaymentMap = {};

    payments.forEach(payment => {
      if (!payment.userId) return;

      const tenantId = payment.userId._id.toString();

      if (!tenantPaymentMap[tenantId]) {
        tenantPaymentMap[tenantId] = {
          tenantId: tenantId,
          latestMonthPaid: null,
          latestPaymentDate: null,
          status: 'failed',
          totalPayments: 0
        };
      }

      if (!tenantPaymentMap[tenantId].latestPaymentDate ||
        payment.paymentDate > tenantPaymentMap[tenantId].latestPaymentDate) {
        tenantPaymentMap[tenantId].latestMonthPaid = payment.month;
        tenantPaymentMap[tenantId].latestPaymentDate = payment.paymentDate;
        tenantPaymentMap[tenantId].status = 'success';
      }

      tenantPaymentMap[tenantId].totalPayments += 1;
    });

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
};

export const getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('userId', 'fullName email mobileNumber')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
};

export const approvePayment = async (req, res) => {
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
};

export const rejectPayment = async (req, res) => {
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
};

export const getTenantPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.tenantId })
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching tenant payments:', error);
    res.status(500).json({ error: 'Failed to fetch tenant payments' });
  }
};

export const deletePayment = async (req, res) => {
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
};

export const resetTenantPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const tenant = await User.findById(req.params.tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

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
};

export const getTenantAadhaar = async (req, res) => {
  try {
    const token = req.query.token || (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, currentConfig.jwtSecret);
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
};
