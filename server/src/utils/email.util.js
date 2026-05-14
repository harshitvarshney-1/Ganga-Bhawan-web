import nodemailer from 'nodemailer';
import dns from 'dns';
import { currentConfig } from '../config/env.js';

// --- SENIOR DEVOPS FIX: Force IPv4 globally for this process ---
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const transporterConfig = {
  host: currentConfig.email.host,
  port: currentConfig.email.port,
  secure: currentConfig.email.port === 465, // true for 465, false for other ports
  auth: {
    user: currentConfig.email.user,
    pass: currentConfig.email.pass,
  },
  tls: { 
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000,
  family: 4, // Force IPv4 to avoid ENETUNREACH errors with IPv6-unfriendly networks
};

// Fallback to Gmail SMTP if host is undefined or not a Gmail host
if (!transporterConfig.host || !transporterConfig.host.includes('gmail.com')) {
  // Prefer Gmail when using a Gmail user email address
  if (transporterConfig.auth.user && transporterConfig.auth.user.toLowerCase().includes('gmail.com')) {
    transporterConfig.host = 'smtp.gmail.com';
    transporterConfig.port = 465;
    transporterConfig.secure = true;
  }
}



const transporter = nodemailer.createTransport(transporterConfig);

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
