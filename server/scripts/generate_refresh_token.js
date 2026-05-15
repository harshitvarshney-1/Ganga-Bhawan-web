import dotenv from 'dotenv';
import { google } from 'googleapis';
import readline from 'readline';

dotenv.config();

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET } = process.env;

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
  console.error('❌ Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET in .env');
  process.exit(1);
}

const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.send',
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\n--- 🔑 GMAIL REFRESH TOKEN GENERATOR ---');
console.log('\n1. Open this URL in your browser:');
console.log('\x1b[36m%s\x1b[0m', authUrl);
console.log('\n2. Sign in with:', process.env.EMAIL_USER);
console.log('3. After clicking "Allow", you will be redirected to the OAuth Playground.');
console.log('4. Copy the "Authorization Code" from the Playground (or from the URL bar after "code=")');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n5. Paste the Authorization Code here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log('\n✅ SUCCESS!');
    console.log('\nCopy this new REFRESH TOKEN and paste it in your .env file:');
    console.log('\x1b[32m%s\x1b[0m', tokens.refresh_token);
    console.log('\nAfter updating .env, restart your server.');
  } catch (err) {
    console.error('\n❌ FAILED to get tokens:', err.message);
  }
});
