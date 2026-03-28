import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { currentConfig } from '../config/env.js';

// 🔧 Cloudinary Config
cloudinary.config({
  cloud_name: currentConfig.cloudinary.cloudName,
  api_key: currentConfig.cloudinary.apiKey,
  api_secret: currentConfig.cloudinary.apiSecret,
  secure: true,
  timeout: 600000,
  connection_timeout: 600000
});

// 📦 Multer Memory Storage
const storage = multer.memoryStorage();

// ✅ File Upload Middleware
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, PDF files are allowed'));
    }
  }
});

/**
 * 🚀 Bullet-proof Upload to Cloudinary
 * Writes buffer to a temp file, then uploads via file path.
 * This is the MOST reliable Cloudinary upload method.
 * Retries on ANY error with exponential backoff.
 */
export const uploadToCloudinary = async (buffer, folder = 'ganga-bhawan', mimetype, retryCount = 0) => {
  const MAX_RETRIES = 5;
  const fileSizeInKB = (buffer.length / 1024).toFixed(2);

  // Determine file extension from mimetype
  const extMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'application/pdf': '.pdf' };
  const ext = extMap[mimetype] || '.tmp';

  // Write buffer to a temp file
  const tempFilePath = path.join(os.tmpdir(), `cloudinary_upload_${Date.now()}_${retryCount}${ext}`);

  try {
    console.log(`[Cloudinary] ${retryCount > 0 ? `⚡ Retry ${retryCount}/${MAX_RETRIES}: ` : ''}Uploading ${fileSizeInKB} KB (${mimetype}) to ${folder}...`);

    // Step 1: Write buffer to disk
    fs.writeFileSync(tempFilePath, buffer);

    // Step 2: Upload the file path to Cloudinary (most stable method)
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      timeout: 600000
    });

    console.log(`[Cloudinary] ✅ Success: ${result.secure_url}`);
    return result;

  } catch (error) {
    // Log the FULL error so we can actually see what's happening
    console.error(`[Cloudinary] ❌ Attempt ${retryCount + 1} failed:`, JSON.stringify({
      message: error.message,
      name: error.name,
      http_code: error.http_code,
      error: error.error,
      stack: error.stack?.split('\n')[0]
    }, null, 2));

    // 🔄 Retry on ANY error — network problems show up as many different error types
    if (retryCount < MAX_RETRIES) {
      const backoffTime = Math.pow(2, retryCount) * 3000; // 3s, 6s, 12s, 24s, 48s
      console.warn(`⏳ Waiting ${backoffTime / 1000}s before retry ${retryCount + 1}/${MAX_RETRIES}...`);

      await new Promise(res => setTimeout(res, backoffTime));
      return uploadToCloudinary(buffer, folder, mimetype, retryCount + 1);
    }

    // All retries exhausted
    console.error(`[Cloudinary] 💀 All ${MAX_RETRIES} retries exhausted for ${mimetype} (${fileSizeInKB} KB)`);
    throw new Error(`Cloudinary upload failed after ${MAX_RETRIES} retries. Please check your internet connection and try again.`);

  } finally {
    // Always clean up the temp file
    try { fs.unlinkSync(tempFilePath); } catch (_) { /* ignore */ }
  }
};

export default cloudinary;