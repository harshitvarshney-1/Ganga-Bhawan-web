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

function validateRequiredSecrets(env) {
  const nodeEnv = process.env.NODE_ENV || 'development';

  // In production, enforce all secrets
  if (nodeEnv === 'production') {
    const required = {
      JWT_SECRET: 'JWT secret for token signing',
      CLOUDINARY_CLOUD_NAME: 'Cloudinary cloud name',
      CLOUDINARY_API_KEY: 'Cloudinary API key',
      CLOUDINARY_API_SECRET: 'Cloudinary API secret'
    };

    const missing = Object.entries(required)
      .filter(([key]) => !process.env[key])
      .map(([key, desc]) => `${key} (${desc})`);

    if (missing.length > 0) {
      console.error('❌ FATAL: Required environment variables missing:');
      missing.forEach(m => console.error(`   - ${m}`));
      process.exit(1);
    }
  } else {
    // Development: warn but don't fail
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ JWT_SECRET not set. Using development fallback.');
    }
  }
}

export const config = {
  development: {
    port: process.env.PORT || 9000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ganga-bhawan',
    jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    apiUrl: process.env.SERVER_URL || process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dev-cloudinary',
      apiKey: process.env.CLOUDINARY_API_KEY || 'dev-api-key',
      apiSecret: process.env.CLOUDINARY_API_SECRET || 'dev-api-secret'
    },
    email: getEmailConfig()
  },
  production: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL,
    jwtSecret: process.env.JWT_SECRET || (validateRequiredSecrets('production'), process.env.JWT_SECRET),
    clientUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL,
    apiUrl: process.env.API_URL || process.env.SERVER_URL,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || (validateRequiredSecrets('production'), process.env.CLOUDINARY_CLOUD_NAME),
      apiKey: process.env.CLOUDINARY_API_KEY || (validateRequiredSecrets('production'), process.env.CLOUDINARY_API_KEY),
      apiSecret: process.env.CLOUDINARY_API_SECRET || (validateRequiredSecrets('production'), process.env.CLOUDINARY_API_SECRET)
    },
    email: getEmailConfig()
  }
};

// Validate required secrets on startup
validateRequiredSecrets();

const env = process.env.NODE_ENV || 'development';
export const currentConfig = config[env];