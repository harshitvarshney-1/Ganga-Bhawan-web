import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const OAuth2 = google.auth.OAuth2;

let cachedTransporter = null;

// ─── Core: Create Transporter using Gmail OAuth2 ────────────────────────────
async function createTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  let accessToken;
  try {
    const tokenResponse = await oauth2Client.getAccessToken();
    accessToken = tokenResponse.token;
    console.log('[Gmail OAuth2] Access token generated successfully');
  } catch (err) {
    console.error('[Gmail OAuth2] Token generation failed:', err.message);
    throw new Error(`[Gmail OAuth2] Token generation failed: ${err.message}`);
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken,
    },
    family: 4, // CRITICAL: Force IPv4 to avoid ENETUNREACH on Render
    tls: {
      rejectUnauthorized: false
    }
  });

  cachedTransporter = transporter;
  return transporter;
}

// ─── Verify (called on startup) ──────────────────────────────────────────────
export const verifyEmailConnection = async () => {
  try {
    await createTransporter();
    console.log('✅ Gmail OAuth2: READY');
    return true;
  } catch (error) {
    console.error('❌ Gmail OAuth2 Connection: FAILED —', error.message);
    return false;
  }
};

// ─── Send Email ───────────────────────────────────────────────────────────────
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = await createTransporter();
    const from = process.env.EMAIL_FROM || `"Ganga Bhawan" <${process.env.EMAIL_USER}>`;
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    
    console.log('📧 Email Sent Successfully (OAuth2):', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email Delivery Error (OAuth2):', error.message);
    cachedTransporter = null; // Reset cache on failure to retry token generation
    throw error;
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

export const getWelcomeEmailTemplate = (fullName, email) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5; text-align: center;">Welcome to Ganga Bhawan!</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>We are excited to inform you that your registration for <strong>Ganga Bhawan (Hariom)</strong> has been approved!</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Username:</strong> ${email}</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> Your registered password</p>
      </div>
      <p style="font-size: 12px; color: #6b7280; text-align: center;">Automated message - Please do not reply.</p>
    </div>
  `;
};

export const getPasswordResetEmailTemplate = (fullName, newPassword) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4f46e5; text-align: center;">Password Updated</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Your login password has been updated by the admin.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>New Password:</strong> <span style="font-size: 18px; font-weight: bold; color: #4f46e5;">${newPassword}</span></p>
      </div>
      <p style="font-size: 12px; color: #6b7280; text-align: center;">Automated message - Please do not reply.</p>
    </div>
  `;
};

export const getPaymentApprovalEmailTemplate = (fullName, month, date) => {
  const submissionDate = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #111827; text-align: center;">Rent Payment Received</h2>
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Your rent payment for <strong>${month}</strong> has been approved.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #f3f4f6; margin: 25px 0;">
         <p><strong>Month:</strong> ${month}</p>
         <p><strong>Date:</strong> ${submissionDate}</p>
         <p><strong>Status:</strong> APPROVED</p>
      </div>
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">Ganga Bhawan (Hariom)</p>
    </div>
  `;
};

export const getAdminPaymentNotificationTemplate = (tenantName, tenantEmail, month, submittedAt, approveUrl, rejectUrl, barcodeImageUrl) => {
  return `
    <div style="font-family: sans-serif; max-width: 620px; margin: auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
      <div style="background: #0f172a; padding: 20px; color: white;">
        <h1>New Payment Receipt</h1>
      </div>
      <div style="padding: 20px;">
        <p><strong>Tenant:</strong> ${tenantName} (${tenantEmail})</p>
        <p><strong>Month:</strong> ${month}</p>
        ${barcodeImageUrl ? `<img src="${barcodeImageUrl}" style="max-width: 100%; border-radius: 8px;" />` : ''}
        <div style="margin-top: 20px;">
          <a href="${approveUrl}" style="background: #4f46e5; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Approve</a>
          <a href="${rejectUrl}" style="color: #dc2626; margin-left: 20px;">Reject</a>
        </div>
      </div>
    </div>
  `;
};
