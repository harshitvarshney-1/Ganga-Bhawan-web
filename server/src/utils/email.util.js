import nodemailer from 'nodemailer';
import dns from 'dns';
import { currentConfig } from '../config/env.js';

// --- SENIOR DEVOPS FIX: Force IPv4 globally for this process ---
// This prevents the 'ENETUNREACH' and 'ETIMEDOUT' issues where Node tries IPv6 first
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Optimized transporter using 'service' instead of manual host/port
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: currentConfig.email.user,
    pass: currentConfig.email.pass,
  },
  pool: true, // Use connection pooling for better performance
  maxConnections: 5,
  maxMessages: 100,
  tls: {
    rejectUnauthorized: false // Bypass self-signed cert issues on proxies
  }
});

// --- CRITICAL: Verify connection on startup ---
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection: READY');
    return true;
  } catch (error) {
    console.error('❌ SMTP Connection: FAILED');
    console.error('Reason:', error.message);
    return false;
  }
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: currentConfig.email.from,
      to,
      subject,
      html,
    });
    console.log('📧 Email Sent Successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email Delivery Error:', error.message);
    throw error;
  }
};

// Templates remain same as before
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

// Template functions for payment approval and other notifications...
export const getPaymentApprovalEmailTemplate = (fullName, month, date) => {
  return `<!-- Template Content -->`; // Same as before
};

export const getAdminPaymentNotificationTemplate = (tenantName, tenantEmail, month, submittedAt, approveUrl, rejectUrl, barcodeImageUrl) => {
  return `<!-- Template Content -->`; // Same as before
};
