import dotenv from 'dotenv';
dotenv.config();

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
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM || '"Ganga Bhawan" <gangabhawan.service@gmail.com>'
    }
  },
  production: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    clientUrl: process.env.CLIENT_URL,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM || `"Ganga Bhawan" <${process.env.EMAIL_USER}>`
    }
  }
};

const env = process.env.NODE_ENV || 'development';
export const currentConfig = config[env];