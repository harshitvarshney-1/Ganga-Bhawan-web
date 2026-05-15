import { google } from 'googleapis';

let oauth2Client = null;

// ─── Core: Initialize Gmail API Client ─────────────────────────────────────
function getGmailClient() {
  if (oauth2Client) return oauth2Client;

  oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'http://localhost:5000/oauth2callback' // This doesn't matter for sending, but must exist
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// ─── Verify (called on startup) ──────────────────────────────────────────────
export const verifyEmailConnection = async () => {
  try {
    const gmail = getGmailClient();
    // Verify tokens by getting profile
    await gmail.users.getProfile({ userId: 'me' });
    console.log('✅ Gmail API: READY (HTTPS Mode)');
    return true;
  } catch (error) {
    console.error('❌ Gmail API Verification: FAILED —', error.message);
    return false;
  }
};

// ─── Send Email via Gmail API (HTTPS) ────────────────────────────────────────
export const sendEmail = async ({ to, subject, html, senderName, senderEmail }) => {
  try {
    const gmail = getGmailClient();
    
    // Smart Display Name: Shows "Name (email)" to the owner
    const displayName = senderName 
      ? (senderEmail ? `${senderName} (${senderEmail})` : `${senderName} (Ganga Bhawan)`)
      : "Ganga Bhawan";
      
    const from = `"${displayName}" <${process.env.EMAIL_USER}>`;
    
    // Construct RFC822 message (Standard format for Gmail API)
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: ${from}`,
      `To: ${to}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      `Subject: ${utf8Subject}`,
      `Reply-To: ${senderEmail || process.env.EMAIL_USER}`,
      '',
      html
    ];
    const message = messageParts.join('\n');

    // Gmail API requires base64url encoding
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`📧 Email Sent via HTTPS [To: ${to}]:`, res.data.id);
    return res.data;
  } catch (error) {
    console.error('❌ Gmail API Send FAILED:', error.message);
    throw error;
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

const PRIMARY_COLOR = '#4f46e5';
const DARK_BG = '#1e293b';
const LIGHT_BG = '#f8fafc';
const BORDER_COLOR = '#e2e8f0';

const getEmailHeader = (title) => `
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${DARK_BG}; border-radius: 16px 16px 0 0;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="border: 2px solid rgba(255,255,255,0.3); padding: 10px 20px; border-radius: 8px;">
              <span style="color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">Ganga Bhawan</span>
            </td>
          </tr>
        </table>
        <h1 style="color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 700; margin: 20px 0 0 0;">${title}</h1>
      </td>
    </tr>
  </table>
`;

const getEmailFooter = () => `
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid ${BORDER_COLOR}; margin-top: 30px;">
    <tr>
      <td style="padding: 30px 0; text-align: center;">
        <p style="color: ${DARK_BG}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; margin: 0;">Ganga Bhawan (Hariom)</p>
        <p style="color: #64748b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; margin: 5px 0;">Premium Student & Executive Living</p>
        <p style="color: ${PRIMARY_COLOR}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; margin: 10px 0;">
          📞 +91 7453857474, 8410225050
        </p>
        <p style="color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; margin: 20px 0 0 0;">
          📍 Chaumuhan, Mathura, Uttar Pradesh
        </p>
      </td>
    </tr>
  </table>
`;

const wrapInContainer = (header, body) => `
  <div style="background-color: #f1f5f9; padding: 40px 20px;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <tr>
        <td>
          ${header}
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 40px;">
            <tr>
              <td>
                ${body}
                ${getEmailFooter()}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

export const getWelcomeEmailTemplate = (fullName, email) => {
  const header = getEmailHeader('Registration Approved');
  const body = `
    <p style="color: #334155; font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
      Namaste <strong>${fullName}</strong>,
    </p>
    <p style="color: #475569; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Welcome to <strong>Ganga Bhawan</strong>! We are pleased to inform you that your registration has been successfully verified and approved by the management.
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${LIGHT_BG}; border-radius: 12px; border: 1px solid ${BORDER_COLOR}; margin-bottom: 30px;">
      <tr>
        <td style="padding: 25px;">
          <p style="color: #64748b; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Account Access</p>
          <p style="color: #1e293b; font-family: Arial, sans-serif; font-size: 15px; margin: 0 0 5px 0;"><strong>Username:</strong> ${email}</p>
          <p style="color: #1e293b; font-family: Arial, sans-serif; font-size: 15px; margin: 0;"><strong>Password:</strong> Your registered password</p>
        </td>
      </tr>
    </table>
    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL}" style="background-color: ${PRIMARY_COLOR}; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; font-weight: 700; padding: 16px 32px; text-decoration: none; border-radius: 8px;">Login to Portal</a>
    </div>
  `;
  return wrapInContainer(header, body);
};

export const getPasswordResetEmailTemplate = (fullName, newPassword) => {
  const header = getEmailHeader('Security Update');
  const body = `
    <p style="color: #334155; font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
      Hello <strong>${fullName}</strong>,
    </p>
    <p style="color: #475569; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Your account password has been reset by the administrator. Please use the temporary password below to sign in and update your security settings.
    </p>
    <div style="background-color: #fff7ed; border: 2px dashed #fb923c; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
      <p style="color: #9a3412; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase;">New Temporary Password</p>
      <p style="color: ${PRIMARY_COLOR}; font-family: Courier New, Courier, monospace; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: 4px;">${newPassword}</p>
    </div>
    <p style="color: #ef4444; font-family: Arial, sans-serif; font-size: 13px; font-weight: 600; text-align: center; margin-bottom: 30px;">
      ⚠️ Please change this password immediately after logging in.
    </p>
  `;
  return wrapInContainer(header, body);
};

export const getPaymentApprovalEmailTemplate = (fullName, month, date) => {
  const submissionDate = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const header = getEmailHeader('Payment Approved');
  const body = `
    <p style="color: #334155; font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
      Dear <strong>${fullName}</strong>,
    </p>
    <p style="color: #475569; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Your rent payment has been verified and recorded. Thank you for your continued cooperation.
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; margin-bottom: 30px;">
      <tr>
        <td style="padding: 25px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="color: #166534; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; padding-bottom: 10px;">Month:</td>
              <td align="right" style="color: #166534; font-family: Arial, sans-serif; font-size: 16px; font-weight: 800; padding-bottom: 10px;">${month}</td>
            </tr>
            <tr>
              <td style="color: #166534; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600;">Approved On:</td>
              <td align="right" style="color: #166534; font-family: Arial, sans-serif; font-size: 16px; font-weight: 800;">${submissionDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="color: #64748b; font-family: Arial, sans-serif; font-size: 14px; text-align: center; margin-bottom: 0;">
      You can download your receipt from the tenant portal.
    </p>
  `;
  return wrapInContainer(header, body);
};

export const getAdminPaymentNotificationTemplate = (tenantName, tenantEmail, month, submittedAt, approveUrl, rejectUrl, barcodeImageUrl) => {
  const header = getEmailHeader('New Payment Receipt');
  const body = `
    <p style="color: #475569; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
      A tenant has submitted a new rent payment proof for your review.
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${LIGHT_BG}; border-radius: 12px; border: 1px solid ${BORDER_COLOR}; margin-bottom: 30px;">
      <tr>
        <td style="padding: 25px;">
          <p style="color: #64748b; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; margin: 0 0 5px 0; text-transform: uppercase;">Tenant</p>
          <p style="color: #1e293b; font-family: Arial, sans-serif; font-size: 16px; font-weight: 700; margin: 0 0 20px 0;">${tenantName} (${tenantEmail})</p>
          <p style="color: #64748b; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; margin: 0 0 5px 0; text-transform: uppercase;">Rent Month</p>
          <p style="color: #1e293b; font-family: Arial, sans-serif; font-size: 18px; font-weight: 800; margin: 0;">${month}</p>
        </td>
      </tr>
    </table>
    ${barcodeImageUrl ? `
      <div style="margin-bottom: 30px; text-align: center;">
        <img src="${barcodeImageUrl}" width="100%" style="max-width: 400px; border-radius: 8px; border: 1px solid ${BORDER_COLOR};" />
      </div>
    ` : ''}
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td width="48%">
          <a href="${approveUrl}" style="background-color: #10b981; color: #ffffff; display: block; font-family: Arial, sans-serif; font-size: 14px; font-weight: 700; padding: 15px; text-decoration: none; border-radius: 8px; text-align: center;">APPROVE</a>
        </td>
        <td width="4%">&nbsp;</td>
        <td width="48%">
          <a href="${rejectUrl}" style="background-color: #ef4444; color: #ffffff; display: block; font-family: Arial, sans-serif; font-size: 14px; font-weight: 700; padding: 15px; text-decoration: none; border-radius: 8px; text-align: center;">REJECT</a>
        </td>
      </tr>
    </table>
  `;
  return wrapInContainer(header, body);
};
