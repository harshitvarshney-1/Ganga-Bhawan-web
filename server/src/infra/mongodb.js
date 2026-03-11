import mongoose from 'mongoose';
import { currentConfig } from '../config/env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(currentConfig.mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
