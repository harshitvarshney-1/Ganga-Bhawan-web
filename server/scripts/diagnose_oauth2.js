import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const OAuth2 = google.auth.OAuth2;

async function diagnose() {
  console.log('--- Gmail OAuth2 Diagnostic ---');
  console.log('User:', process.env.EMAIL_USER);
  console.log('Client ID:', process.env.GMAIL_CLIENT_ID ? 'Set' : 'MISSING');
  console.log('Client Secret:', process.env.GMAIL_CLIENT_SECRET ? 'Set' : 'MISSING');
  console.log('Refresh Token:', process.env.GMAIL_REFRESH_TOKEN ? 'Set' : 'MISSING');

  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  try {
    console.log('\nAttempting to get access token...');
    const { token } = await oauth2Client.getAccessToken();
    console.log('✅ SUCCESS! Access token generated.');
    console.log('Token snippet:', token.substring(0, 10) + '...');
  } catch (err) {
    console.error('\n❌ FAILED');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.response && err.response.data) {
      console.error('Detailed Error from Google:', JSON.stringify(err.response.data, null, 2));
    }
    
    if (err.message.includes('invalid_grant')) {
      console.log('\n--- Troubleshooting "invalid_grant" ---');
      console.log('1. Refresh Token expired: If your Google Cloud project is in "Testing" mode, tokens expire every 7 days.');
      console.log('2. Token revoked: You might have revoked access in your Google Account security settings.');
      console.log('3. Redirect URI mismatch: Ensure you used "https://developers.google.com/oauthplayground" when generating the token.');
      console.log('4. Project Change: If you changed the Client ID or Secret, the old Refresh Token won\'t work.');
    }
  }
}

diagnose();
