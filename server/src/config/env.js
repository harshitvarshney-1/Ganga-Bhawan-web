import dotenv from 'dotenv';
dotenv.config();

// Force Gmail SMTP when using a Gmail address, regardless of env variables.
// This prevents Brevo (or other stale) env vars from breaking email delivery.
function getEmailConfig() {
  const user = process.env.EMAIL_USER || '';
  const isGmail = user.toLowerCase().includes('gmail.com');
  return {
    host: isGmail ? 'smtp.gmail.com' : (process.env.EMAIL_HOST || 'smtp.gmail.com').trim(),
    port: isGmail ? 465 : Number((process.env.EMAIL_PORT || '465').trim()),
    user,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || `"Ganga Bhawan" <${user}>`
  };
}

export const config = {
  development: {
    port: process.env.PORT || 9000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ganga-bhawan',
    jwtSecret: process.env.JWT_SECRET || 'qwer',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dfg',
      apiKey: process.env.CLOUDINARY_API_KEY || 'cvbn',
      apiSecret: process.env.CLOUDINARY_API_SECRET || 'asdf'
    },
    email: getEmailConfig()
  },
  production: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL,
    jwtSecret: process.env.JWT_SECRET,
    clientUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL,
    apiUrl: process.env.API_URL || process.env.SERVER_URL,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    email: getEmailConfig()
  }
};

const env = process.env.NODE_ENV || 'development';
export const currentConfig = config[env];