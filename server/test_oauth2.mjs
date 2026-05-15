import dotenv from 'dotenv';
dotenv.config();

import { sendEmail, verifyEmailConnection } from './src/utils/email.util.js';

console.log('--- OAuth2 Test Start ---');
console.log('EMAIL_USER:', process.env.EMAIL_USER);

async function test() {
  try {
    console.log('\n--- Verifying OAuth2 Connection ---');
    const ok = await verifyEmailConnection();

    if (ok) {
      console.log('\n--- Sending OAuth2 Test Email ---');
      const info = await sendEmail({
        to: process.env.EMAIL_USER,
        subject: 'OAuth2 Test — Ganga Bhawan',
        html: '<h2>✅ Gmail OAuth2 setup is working perfectly!</h2><p>This email was sent using the Google API via HTTPS port 443.</p>',
      });
      console.log('\nSUCCESS! Message ID:', info.messageId);
    } else {
      console.log('\n❌ OAuth2 verification failed.');
    }
  } catch (err) {
    console.error('\n❌ Test failed with error:', err.message);
    if (err.response) {
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
  }
  console.log('\n--- OAuth2 Test End ---');
}

test();
