import Payment from '../../models/payment.model.js';
import User from '../../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { currentConfig } from '../../config/env.js';
import { sendEmail, getPaymentApprovalEmailTemplate, getPasswordResetEmailTemplate, getPaymentRejectedEmailTemplate } from '../../utils/email.util.js';

// Secret used only for quick-approve links (separate from user JWT secret)
const QUICK_SECRET = process.env.QUICK_APPROVE_SECRET || (currentConfig.jwtSecret + '_quick');

export const assignDuePayment = async (req, res) => {
  try {
    const { userId, month, monthIndex, amount, isAdvanced } = req.body;
    
    if (!userId || monthIndex === undefined || month === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await Payment.findOne({
      userId,
      monthIndex,
      isAdvanced: isAdvanced === true
    });

    if (existing) {
      if (existing.status !== 'due') {
        return res.status(400).json({ error: `Payment for this month already exists with status: ${existing.status}` });
      }
      existing.amount = parseFloat(amount) || 0;
      await existing.save();
      return res.json({ success: true, message: 'Updated due payment amount', payment: existing });
    }

    const payment = new Payment({
      userId,
      month,
      monthIndex,
      amount: parseFloat(amount) || 0,
      isAdvanced: isAdvanced === true,
      status: 'due'
    });

    await payment.save();
    res.json({ success: true, message: 'Rent assigned successfully', payment });
  } catch (error) {
    console.error('Error assigning due payment:', error);
    res.status(500).json({ error: 'Failed to assign due payment' });
  }
};

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

    // Send payment approval email
    try {
      const tenant = await User.findById(payment.userId);
      if (tenant) {
        const emailHtml = getPaymentApprovalEmailTemplate(tenant.fullName, payment.month, payment.paymentDate);
        // Send email in background to keep UI fast
        sendEmail({
          to: tenant.email,
          subject: `Payment Successful - ${payment.month} Bill Approved`,
          html: emailHtml
        }).catch(e => console.error('Background Email Error:', e));
        
        console.log(`✅ Payment approval triggered for ${tenant.email} for ${payment.month}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send payment approval email:', emailError);
    }

    res.json({
      success: true,
      message: 'Payment approved successfully. Confirmation email sent.',
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

    // Send payment rejection email
    try {
      const tenant = await User.findById(payment.userId);
      if (tenant) {
        const emailHtml = getPaymentRejectedEmailTemplate(tenant.fullName, payment.month);
        sendEmail({
          to: tenant.email,
          subject: `Payment Declined - Action Required for ${payment.month}`,
          html: emailHtml
        }).catch(e => console.error('Background Reject Email Error:', e));
        
        console.log(`❌ Payment rejection triggered for ${tenant.email} for ${payment.month}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send payment rejection email:', emailError);
    }

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

    // Send password reset email
    try {
      const emailHtml = getPasswordResetEmailTemplate(tenant.fullName, newPassword);
      // Send email in background to keep UI fast
      sendEmail({
        to: tenant.email,
        subject: 'Login Password Updated - Ganga Bhawan',
        html: emailHtml
      }).catch(e => console.error('Background Password Reset Email Error:', e));
      
      console.log(`✅ Password reset triggered for ${tenant.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
    }

    res.json({
      success: true,
      message: `Password for ${tenant.fullName} has been updated successfully. Tenant has been notified via email.`
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};



// ─── One-Click Approve from Email ───────────────────────────────────────────
export const quickApprovePayment = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send(htmlPage('❌ Invalid Link', 'No token provided.', 'error'));

    let decoded;
    try {
      decoded = jwt.verify(token, QUICK_SECRET);
    } catch {
      return res.status(400).send(htmlPage('❌ Link Expired', 'This approval link has expired or is invalid. Please use the Admin Portal.', 'error'));
    }

    if (decoded.action !== 'approve') {
      return res.status(400).send(htmlPage('❌ Invalid Action', 'This link is not for approving payments.', 'error'));
    }

    const payment = await Payment.findById(decoded.paymentId);
    if (!payment) return res.status(404).send(htmlPage('❌ Not Found', 'Payment record not found.', 'error'));
    
    if (payment.status !== 'pending') {
      return res.send(htmlPage(
        payment.status === 'success' ? '✅ Already Approved' : '❌ Payment Rejected',
        `This payment is already marked as <strong>${payment.status}</strong>. No action needed.`,
        payment.status === 'success' ? 'success' : 'warn'
      ));
    }

    // Identify batch: All pending payments from same user with same barcode image
    const batch = await Payment.find({
      userId: payment.userId,
      barcodeImage: payment.barcodeImage,
      status: 'pending'
    });

    const monthSummary = batch.map(p => p.month).join(', ');

    // Approve all in batch
    for (const p of batch) {
      p.status = 'success';
      p.approvedAt = new Date();
      p.approvedViaEmail = true;
      await p.save();
    }

    // Notify tenant
    try {
      const tenant = await User.findById(payment.userId);
      if (tenant) {
        const emailHtml = getPaymentApprovalEmailTemplate(tenant.fullName, monthSummary, payment.paymentDate);
        // Send email in background
        sendEmail({
          to: tenant.email,
          subject: `✅ Payment Approved - ${monthSummary}`,
          html: emailHtml
        }).catch(e => console.error('Background Batch Email Error:', e));
      }
    } catch (e) {
      console.error('Email to tenant failed:', e);
    }

    return res.send(htmlPage('✅ Batch Approved!', `All payments for <strong>${monthSummary}</strong> have been approved. A confirmation email has been sent to the tenant.`, 'success'));
  } catch (error) {
    console.error('Quick approve error:', error);
    return res.status(500).send(htmlPage('❌ Server Error', 'Something went wrong. Please use the Admin Portal.', 'error'));
  }
};

// ─── One-Click Reject from Email ────────────────────────────────────────────
export const quickRejectPayment = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send(htmlPage('❌ Invalid Link', 'No token provided.', 'error'));

    let decoded;
    try {
      decoded = jwt.verify(token, QUICK_SECRET);
    } catch {
      return res.status(400).send(htmlPage('❌ Link Expired', 'This reject link has expired or is invalid. Please use the Admin Portal.', 'error'));
    }

    if (decoded.action !== 'reject') {
      return res.status(400).send(htmlPage('❌ Invalid Action', 'This link is not for rejecting payments.', 'error'));
    }

    const payment = await Payment.findById(decoded.paymentId);
    if (!payment) return res.status(404).send(htmlPage('❌ Not Found', 'Payment record not found.', 'error'));
    if (payment.status !== 'pending') {
      return res.send(htmlPage(
        '⚠️ Already Processed',
        `This payment is already marked as <strong>${payment.status}</strong>. No action needed.`,
        'warn'
      ));
    }

    // Identify batch
    const batch = await Payment.find({
      userId: payment.userId,
      barcodeImage: payment.barcodeImage,
      status: 'pending'
    });

    const monthSummary = batch.map(p => p.month).join(', ');

    // Reject all in batch
    for (const p of batch) {
      p.status = 'rejected';
      await p.save();
    }

    // Notify tenant of batch rejection
    try {
      const tenant = await User.findById(payment.userId);
      if (tenant) {
        const emailHtml = getPaymentRejectedEmailTemplate(tenant.fullName, monthSummary);
        sendEmail({
          to: tenant.email,
          subject: `❌ Payment Declined - ${monthSummary}`,
          html: emailHtml
        }).catch(e => console.error('Background Batch Reject Email Error:', e));
      }
    } catch (e) {
      console.error('Email to tenant failed:', e);
    }

    return res.send(htmlPage('❌ Batch Rejected', `Payments for <strong>${monthSummary}</strong> have been rejected. The tenant will need to re-submit.`, 'error'));
  } catch (error) {
    console.error('Quick reject error:', error);
    return res.status(500).send(htmlPage('❌ Server Error', 'Something went wrong. Please use the Admin Portal.', 'error'));
  }
};

// ─── Helper to generate quick-approve/reject tokens ─────────────────────────
export const generateQuickTokens = (paymentId) => {
  const approveToken = jwt.sign({ paymentId: paymentId.toString(), action: 'approve' }, QUICK_SECRET, { expiresIn: '48h' });
  const rejectToken  = jwt.sign({ paymentId: paymentId.toString(), action: 'reject'  }, QUICK_SECRET, { expiresIn: '48h' });
  return { approveToken, rejectToken };
};

// ─── Simple HTML response page (no React needed — email click lands here) ───
function htmlPage(title, message, type) {
  const colors = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a', btn: '#16a34a' },
    error:   { bg: '#fef2f2', border: '#fecaca', icon: '#dc2626', btn: '#dc2626' },
    warn:    { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', btn: '#d97706' },
  };
  const c = colors[type] || colors.warn;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Ganga Bhawan</title></head>
<body style="font-family:'Segoe UI',sans-serif;background:#f8fafc;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="max-width:480px;width:90%;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
    <div style="background:#0f172a;padding:28px 36px;">
      <p style="color:#818cf8;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin:0 0 4px;">Ganga Bhawan Admin</p>
      <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0;">${title}</h1>
    </div>
    <div style="padding:32px 36px;">
      <div style="background:${c.bg};border:1px solid ${c.border};border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0;color:#1f2937;font-size:15px;line-height:1.6;">${message}</p>
      </div>
      <a href="${currentConfig.clientUrl}/login" style="display:inline-block;background:${c.btn};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;">Go to Admin Portal</a>
    </div>
    <div style="border-top:1px solid #f1f5f9;padding:16px 36px;background:#f8fafc;">
      <p style="font-size:11px;color:#9ca3af;margin:0;text-align:center;">Ganga Bhawan (Hariom) | Mathura, UP</p>
    </div>
  </div>
</body></html>`;
}
