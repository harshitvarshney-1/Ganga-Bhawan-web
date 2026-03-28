import Payment from '../../models/payment.model.js';
import User from '../../models/user.model.js';
import { currentConfig } from '../../config/env.js';
import { sendEmail, getAdminPaymentNotificationTemplate } from '../../utils/email.util.js';
import { generateQuickTokens } from '../admin/payment.controller.js';
import { uploadToCloudinary } from '../../infra/cloudinary.js';

export const submitPayment = async (req, res) => {
  try {
    const { month, monthIndex, amount } = req.body;

    console.log('Payment submission data received:', { month, monthIndex, amount });

    if (!month || monthIndex === undefined || (amount === undefined || amount === null || amount === '')) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: month, monthIndex, amount'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Barcode image is required'
      });
    }

    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not found in token'
      });
    }

    const existingPayment = await Payment.findOne({
      userId: userId,
      month: month,
      monthIndex: parseInt(monthIndex),
      isAdvanced: req.body.isAdvanced === 'true' || req.body.isAdvanced === true,
      status: { $in: ['pending', 'success'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'Payment already submitted for this month'
      });
    }

    // ─── Cloudinary Upload ───────────────────────────────────────────────────
    let imageUrl = null;
    try {
      if (req.file) {
        console.log('Uploading barcode image to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer, 'payments', req.file.mimetype);
        imageUrl = result.secure_url;
        console.log('Cloudinary upload successful:', imageUrl);
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload image to storage. Please check Cloudinary credentials.'
      });
    }

    const payment = new Payment({
      userId: userId,
      month: month,
      monthIndex: parseInt(monthIndex),
      amount: parseFloat(amount),
      isAdvanced: req.body.isAdvanced === 'true' || req.body.isAdvanced === true,
      barcodeImage: imageUrl,
      status: 'pending',
      paymentDate: new Date()
    });

    await payment.save();

    // ─── Send Notification Email to Admin ────────────────────────────────────
    try {
      const tenant = await User.findById(userId);
      if (tenant) {
        // Generate secure 1-click approve/reject URLs
        const { approveToken, rejectToken } = generateQuickTokens(payment._id);
        
        // We use the server's public URL/host. In prod, ensure this points to your backend.
        const baseUrl = process.env.API_URL || 'http://localhost:5000/api';
        
        const approveUrl = `${baseUrl}/admin/quick-approve?token=${approveToken}`;
        const rejectUrl  = `${baseUrl}/admin/quick-reject?token=${rejectToken}`;

        const emailHtml = getAdminPaymentNotificationTemplate(
          tenant.fullName,
          tenant.email,
          payment.month,
          payment.paymentDate,
          approveUrl,
          rejectUrl
        );

        await sendEmail({
          to: currentConfig.email.user, // Send to the admin's email (defined in env)
          subject: `ACTION REQUIRED: New Payment Receipt from ${tenant.fullName} - ${payment.month}`,
          html: emailHtml
        });
        
        console.log(`✅ Admin notification email sent for payment ${payment._id}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send admin payment notification email:', emailError);
      // We don't throw - payment is still saved successfully
    }

    res.json({
      success: true,
      message: 'Payment submitted successfully. Waiting for admin approval.',
      payment
    });

  } catch (error) {
    console.error('Payment submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit payment'
    });
  }
};
