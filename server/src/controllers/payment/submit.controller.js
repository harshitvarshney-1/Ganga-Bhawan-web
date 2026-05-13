import Payment from '../../models/payment.model.js';
import User from '../../models/user.model.js';
import { currentConfig } from '../../config/env.js';
import { sendEmail, getAdminPaymentNotificationTemplate } from '../../utils/email.util.js';
import { generateQuickTokens } from '../admin/payment.controller.js';
import { uploadToCloudinary } from '../../infra/cloudinary.js';

export const submitPayment = async (req, res) => {
  try {
    const { month, monthIndex, amount, barcodeImageUrl, isAdvanced, selectedMonths } = req.body;

    const isBulk = Array.isArray(selectedMonths) && selectedMonths.length > 0;

    // Validation
    if (!isBulk && (!month || monthIndex === undefined)) {
      return res.status(400).json({ success: false, error: 'Missing month details' });
    }
    if (!barcodeImageUrl) {
      return res.status(400).json({ success: false, error: 'Receipt image is required' });
    }

    const userId = req.user.userId || req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Prepare combined data
    let finalMonth = month;
    let finalMonthIndices = [parseInt(monthIndex)];

    if (isBulk) {
      finalMonth = selectedMonths.map(m => m.month).join(', ');
      finalMonthIndices = selectedMonths.map(m => parseInt(m.monthIndex));
    }

    // Check for overlap: Is any of these months already paid?
    const existing = await Payment.findOne({
      userId: userId,
      status: { $in: ['pending', 'success'] },
      $or: [
        { monthIndex: { $in: finalMonthIndices } },
        { monthIndices: { $in: finalMonthIndices } }
      ]
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: `One or more months in this selection are already submitted or paid.` 
      });
    }

    const payment = new Payment({
      userId: userId,
      month: finalMonth,
      monthIndex: finalMonthIndices[0], // First month as primary
      monthIndices: finalMonthIndices,   // Full list for tracking
      amount: parseFloat(amount) || 0,
      isAdvanced: isAdvanced === true || isAdvanced === 'true',
      barcodeImage: barcodeImageUrl,
      status: 'pending',
      paymentDate: new Date()
    });

    await payment.save();

    // ─── Admin Notification ──────────────────────────────────────────────────
    try {
      const tenant = await User.findById(userId);
      if (tenant) {
        const { approveToken, rejectToken } = generateQuickTokens(payment._id);
        const baseUrl = process.env.API_URL || 'http://localhost:5000/api';
        const approveUrl = `${baseUrl}/admin/quick-approve?token=${approveToken}`;
        const rejectUrl  = `${baseUrl}/admin/quick-reject?token=${rejectToken}`;

        const emailHtml = getAdminPaymentNotificationTemplate(
          tenant.fullName,
          tenant.email,
          payment.month,
          payment.paymentDate,
          approveUrl,
          rejectUrl,
          barcodeImageUrl
        );

        await sendEmail({
          to: currentConfig.email.user,
          subject: `ACTION REQUIRED: Payment from ${tenant.fullName} (${payment.month})`,
          html: emailHtml
        });
      }
    } catch (e) { console.error('Admin email failed:', e); }

    res.json({ success: true, message: 'Payment submitted successfully', payment });

  } catch (error) {
    console.error('Payment submission error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
