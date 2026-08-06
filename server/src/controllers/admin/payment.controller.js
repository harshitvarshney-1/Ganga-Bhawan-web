import Payment from '../../models/payment.model.js';
import User from '../../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { currentConfig } from '../../config/env.js';
import { sendEmail, getPaymentApprovalEmailTemplate, getPasswordResetEmailTemplate, getPaymentRejectedEmailTemplate } from '../../utils/email.util.js';
import { deleteFromCloudinary } from '../../infra/cloudinary.js';

// Secret used only for quick-approve links (separate from user JWT secret)
const QUICK_SECRET = process.env.QUICK_APPROVE_SECRET || (currentConfig.jwtSecret + '_quick');

export const assignDuePayment = async (req, res) => {
  try {
    const { userId, month, monthIndex, amount, isAdvanced, paymentDate } = req.body;
    
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
      status: 'due',
      paymentDate: paymentDate || new Date()
    });

    await payment.save();
    res.json({ success: true, message: 'Rent assigned successfully', payment });
  } catch (error) {
    console.error('Error assigning due payment:', error);
    res.status(500).json({ error: 'Failed to assign due payment' });
  }
};

export const recordManualPayment = async (req, res) => {
  try {
    const { userId, month, monthIndex, monthIndices, amount, isAdvanced, paymentDate, notes, paymentMode } = req.body;

    if (!userId || (!month && monthIndex === undefined && (!monthIndices || monthIndices.length === 0))) {
      return res.status(400).json({ error: 'Missing required fields (tenant and payment month/details)' });
    }

    const tenant = await User.findById(userId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const adminId = req.user.userId || req.user.id;
    const isAdv = isAdvanced === true || isAdvanced === 'true';
    const parsedAmount = parseFloat(amount) || 0;
    const dateOfPayment = paymentDate ? new Date(paymentDate) : new Date();

    let payment;

    // Check if an existing payment (due or pending) exists for this user and selection
    const queryConditions = {
      userId,
      isAdvanced: isAdv,
    };

    if (Array.isArray(monthIndices) && monthIndices.length > 0) {
      queryConditions.$or = [
        { monthIndex: { $in: monthIndices } },
        { monthIndices: { $in: monthIndices } }
      ];
    } else if (monthIndex !== undefined && monthIndex !== null) {
      queryConditions.monthIndex = Number(monthIndex);
    } else if (month) {
      queryConditions.month = month;
    }

    const existing = await Payment.findOne(queryConditions);

    if (existing) {
      existing.status = 'success';
      existing.amount = parsedAmount || existing.amount;
      existing.approvedBy = adminId;
      existing.approvedAt = new Date();
      existing.paymentDate = dateOfPayment;
      // Overwrite receipt with manual mode if applied manually
      if (paymentMode) existing.paymentMode = paymentMode;
      existing.barcodeImage = null; // Explicitly remove receipt since admin is manually recording it
      if (notes) existing.notes = notes;
      payment = await existing.save();
    } else {
      payment = new Payment({
        userId,
        month: month || 'Manual Payment',
        monthIndex: monthIndex !== undefined && monthIndex !== null ? Number(monthIndex) : 99,
        monthIndices: Array.isArray(monthIndices) ? monthIndices : [],
        amount: parsedAmount,
        isAdvanced: isAdv,
        status: 'success',
        paymentDate: dateOfPayment,
        approvedBy: adminId,
        approvedAt: new Date(),
        paymentMode: paymentMode || 'Cash',
        barcodeImage: null,
        notes: notes || ''
      });
      payment = await payment.save();
    }

    // Trigger Payment Approval Confirmation Email to Tenant
    try {
      const emailHtml = getPaymentApprovalEmailTemplate(tenant.fullName, payment.month, payment.paymentDate, parsedAmount, paymentMode || 'Cash', payment.isAdvanced);
      sendEmail({
        to: tenant.email,
        subject: payment.isAdvanced 
          ? `Advanced Payment Confirmed - ${payment.month} (${paymentMode || 'Cash/Offline'})`
          : `Payment Confirmed - ${payment.month} (${paymentMode || 'Cash/Offline'})`,
        html: emailHtml
      }).catch(e => console.error('Background Email Error (Manual Payment):', e));
      
      console.log(`✅ Manual payment approval email triggered for ${tenant.email} for ${payment.month}`);
    } catch (emailError) {
      console.error('❌ Failed to send manual payment approval email:', emailError);
    }

    res.json({
      success: true,
      message: `Manual payment of ₹${parsedAmount} recorded for ${tenant.fullName} (${payment.month}). Confirmation email sent.`,
      payment
    });
  } catch (error) {
    console.error('Error recording manual payment:', error);
    res.status(500).json({ error: error.message || 'Failed to record manual payment' });
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
        const emailHtml = getPaymentApprovalEmailTemplate(tenant.fullName, payment.month, payment.paymentDate, payment.amount, 'Online', payment.isAdvanced);
        // Send email in background to keep UI fast
        sendEmail({
          to: tenant.email,
          subject: payment.isAdvanced 
            ? `Advanced Payment Successful - ${payment.month} Bill Approved`
            : `Payment Successful - ${payment.month} Bill Approved`,
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

    // 🗑️ Auto-delete the receipt image from Cloudinary before rejecting
    if (payment.barcodeImage) {
      deleteFromCloudinary(payment.barcodeImage).catch(e =>
        console.error('[Cloudinary] Failed to delete receipt on rejection:', e)
      );
    }

    payment.status = 'rejected';
    payment.barcodeImage = null; // Clear so tenant must re-upload
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
      message: 'Payment rejected and receipt image deleted from storage.',
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
    const { validatePassword } = await import('../../utils/password.util.js');

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Invalid password',
        details: passwordValidation.errors
      });
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

    // 🗑️ Auto-delete the shared receipt image from Cloudinary (only once - same image for batch)
    if (payment.barcodeImage) {
      deleteFromCloudinary(payment.barcodeImage).catch(e =>
        console.error('[Cloudinary] Failed to delete receipt on batch rejection:', e)
      );
    }

    // Reject all in batch and clear receipt reference
    for (const p of batch) {
      p.status = 'rejected';
      p.barcodeImage = null; // Clear so tenant must re-upload
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
    success: { bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a', btn: '#16a34a', emoji: '✅' },
    error:   { bg: '#fef2f2', border: '#fecaca', accent: '#dc2626', btn: '#dc2626', emoji: '❌' },
    warn:    { bg: '#fffbeb', border: '#fde68a', accent: '#d97706', btn: '#d97706', emoji: '⚠️' },
  };
  const c = colors[type] || colors.warn;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>${title} — Ganga Bhawan</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .card {
      background: #1e293b;
      border-radius: 20px;
      overflow: hidden;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5);
    }
    .header {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      padding: 28px 28px 24px;
      border-bottom: 1px solid #334155;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #818cf8;
      margin-bottom: 8px;
    }
    .header h1 {
      color: #f1f5f9;
      font-size: 22px;
      font-weight: 800;
      line-height: 1.3;
    }
    .body { padding: 28px; }
    .alert-box {
      background: ${c.bg};
      border: 1px solid ${c.border};
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .alert-box p {
      color: #1e293b;
      font-size: 16px;
      line-height: 1.6;
    }
    .portal-btn {
      display: block;
      width: 100%;
      background: ${c.btn};
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      font-size: 17px;
      padding: 18px 24px;
      border-radius: 12px;
      text-align: center;
      -webkit-tap-highlight-color: transparent;
    }
    .footer {
      border-top: 1px solid #334155;
      padding: 16px 28px;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">Ganga Bhawan Admin</span>
      <h1>${c.emoji} ${title}</h1>
    </div>
    <div class="body">
      <div class="alert-box">
        <p>${message}</p>
      </div>
      <a href="${currentConfig.clientUrl}/login" class="portal-btn">Open Admin Portal</a>
    </div>
    <div class="footer">
      <p>Ganga Bhawan (Hariom) &bull; Mathura, Uttar Pradesh</p>
    </div>
  </div>
</body>
</html>`;}
