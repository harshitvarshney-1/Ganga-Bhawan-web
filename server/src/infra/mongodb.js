import mongoose from 'mongoose';
import { currentConfig } from '../config/env.js';

// Cached connection for Vercel serverless (avoids reconnecting on every invocation)
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

export const connectDB = async () => {
  // If already connected, reuse
  if (cached.conn) {
    console.log('✅ MongoDB: using cached connection');
    return cached.conn;
  }

  if (!currentConfig.mongoUri) {
    console.error('❌ MONGO_URI is not defined! Check your environment variables.');
    throw new Error('MONGO_URI is not defined');
  }

  try {
    if (!cached.promise) {
      console.log('🔌 MongoDB: connecting...');
      cached.promise = mongoose.connect(currentConfig.mongoUri, {
        serverSelectionTimeoutMS: 10000, // 10s timeout instead of default 30s
      });
    }
    cached.conn = await cached.promise;
    console.log(`✅ MongoDB Connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset so next request retries
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // DO NOT process.exit(1) — it kills the entire Vercel serverless function!
    throw error;
  }
};
