import nodemailer from 'nodemailer';
import { currentConfig } from '../config/env.js';

// Production-ready transporter with robust settings for Gmail
const transporter = nodemailer.createTransport({
  host: currentConfig.email.host,
  port: currentConfig.email.port,
  secure: currentConfig.email.port === 465, // true for 465, false for other ports
  auth: {
    user: currentConfig.email.user,
    pass: currentConfig.email.pass,
  },
  // TLS settings for production servers (Render/Railway)
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds
  logger: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'production'
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: currentConfig.email.from,
      to,
      subject,
      html,
    });
    console.log('✅ Email successfully sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ CRITICAL EMAIL FAILURE:', error.message);
    // If it fails, log the full error stack in production for debugging
    if (process.env.NODE_ENV === 'production') {
      console.error(error);
    }
    throw error;
  }
};

export const getWelcomeEmailTemplate = (fullName, email) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5; text-align: center;">Welcome to Ganga Bhawan!</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>We are excited to inform you that your registration for <strong>Ganga Bhawan (Hariom)</strong> has been approved by the admin!</p>
      <p>You can now log in to the tenant portal using your registered credentials:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Username/Email:</strong> ${email}</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> The password you set during registration</p>
      </div>
      <p><strong>PG Details:</strong></p>
      <ul style="list-style: none; padding: 0;">
        <li>📍 <strong>Address:</strong> Badhauta Road, Chaumuhan, Mathura, UP – 281406</li>
        <li>📞 <strong>Contact:</strong> +91 84102 25050, +91 74538 57474</li>
        <li>💬 <strong>WhatsApp:</strong> <a href="https://wa.me/917453857474" style="color: #10b981; text-decoration: none;">Chat with us</a></li>
      </ul>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #6b7280; text-align: center;">This is an automated message, please do not reply to this email.</p>
    </div>
  `;
};

export const getPasswordResetEmailTemplate = (fullName, newPassword) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5; text-align: center;">Password Updated</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Your login password for <strong>Ganga Bhawan</strong> has been updated by the admin.</p>
      <p>Your new credentials are:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>New Password:</strong> <span style="font-size: 18px; font-weight: bold; color: #4f46e5;">${newPassword}</span></p>
      </div>
      <p>Please log in and change your password as soon as possible for security.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #6b7280; text-align: center;">This is an automated message, please do not reply to this email.</p>
    </div>
  `;
};

export const getPaymentApprovalEmailTemplate = (fullName, month, date) => {
  const submissionDate = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="background-color: #ecfdf5; color: #059669; display: inline-block; padding: 10px 20px; border-radius: 50px; font-weight: bold; font-size: 14px;">
          ✓ PAYMENT SUCCESSFUL
        </div>
      </div>
      <h2 style="color: #111827; text-align: center; margin-top: 0;">Rent Payment Received</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Thank you! Your rent payment for the month of <strong>${month}</strong> has been successfully approved by the admin.</p>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #f3f4f6; margin: 25px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Month</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: bold; text-align: right;">${month}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Submitted On</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: bold; text-align: right;">${submissionDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Status</td>
            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: bold; text-align: right;">APPROVED</td>
          </tr>
        </table>
      </div>

      <p>You can view your detailed payment history in your tenant portal dashboard.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${currentConfig.clientUrl}/login" style="background-color: #4f46e5; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Go to Dashboard</a>
      </div>

      <p style="font-size: 14px; color: #374151;">Regards,<br><strong>Owner, Ganga Bhawan (Hariom)</strong></p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">Ganga Bhawan (Hariom) | Mathura, UP</p>
    </div>
  `;
};

export const getAdminPaymentNotificationTemplate = (tenantName, tenantEmail, month, submittedAt, approveUrl, rejectUrl, barcodeImageUrl) => {
  const date = new Date(submittedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 620px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
      <!-- Header -->
      <div style="background: #0f172a; padding: 32px 40px;">
        <p style="color: #818cf8; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 6px;">Ganga Bhawan Admin</p>
        <h1 style="color: #fff; font-size: 22px; font-weight: 800; margin: 0 0 4px;">New Payment Receipt Submitted</h1>
        <p style="color: #64748b; font-size: 13px; margin: 0;">A tenant is awaiting your approval</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px 40px;">
        <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">A tenant has uploaded a payment receipt and requires your approval.</p>

        <!-- Receipt Preview -->
        ${barcodeImageUrl ? `
        <div style="margin-bottom: 28px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; text-align: left;">Payment Receipt Preview:</p>
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; background: #f8fafc; display: inline-block; max-width: 100%;">
            <img src="${barcodeImageUrl}" alt="Payment Receipt" style="max-width: 100%; border-radius: 8px; height: auto; max-height: 400px; display: block;" />
          </div>
        </div>
        ` : ''}

        <!-- Details Card -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 40%;">Tenant Name</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 700;">${tenantName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-top: 1px solid #f1f5f9;">Email</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 700; border-top: 1px solid #f1f5f9;">${tenantEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-top: 1px solid #f1f5f9;">Month</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 700; border-top: 1px solid #f1f5f9;">${month}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-top: 1px solid #f1f5f9;">Submitted At</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 700; border-top: 1px solid #f1f5f9;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; border-top: 1px solid #f1f5f9;">Status</td>
              <td style="padding: 8px 0; border-top: 1px solid #f1f5f9;">
                <span style="background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px;">Pending Review</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Action Buttons -->
        <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 16px;">Take action directly from this email:</p>
        <table style="margin-bottom: 28px;">
          <tr>
            <td style="padding-right: 12px;">
              <a href="${approveUrl}" style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px;">✅ Approve Payment</a>
            </td>
            <td>
              <a href="${rejectUrl}"  style="display: inline-block; background: #fff; color: #dc2626; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 32px; border-radius: 10px; border: 2px solid #fecaca;">❌ Reject Payment</a>
            </td>
          </tr>
        </table>

        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 13px; color: #92400e;">⚠️ <strong>Security Notice:</strong> These links are valid for <strong>48 hours</strong> and are single-use. Do not forward this email.</p>
        </div>

        <p style="font-size: 14px; color: #374151;">You can also review payments in the <a href="${currentConfig.clientUrl}/login" style="color: #4f46e5; font-weight: 600;">Admin Portal</a>.</p>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #f1f5f9; padding: 20px 40px; background: #f8fafc;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">Ganga Bhawan (Hariom) | Mathura, UP &nbsp;•&nbsp; This is an automated message.</p>
      </div>
    </div>
  `;
};
