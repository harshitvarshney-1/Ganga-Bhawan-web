import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
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
 * 🚀 Robust Upload to Cloudinary using upload_stream
 * Efficiently handles buffers and provides better reliability for stream-based uploads.
 */
const uploadStream = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

/**
 * 🛡️ Bullet-proof Upload Wrapper
 * Implements exponential backoff retries and handles timeouts.
 */
export const uploadToCloudinary = async (buffer, folder = 'ganga-bhawan', mimetype, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const fileSizeInKB = (buffer.length / 1024).toFixed(2);

  try {
    console.log(`[Cloudinary] ${retryCount > 0 ? `⚡ Retry ${retryCount}/${MAX_RETRIES}: ` : ''}Uploading ${fileSizeInKB} KB (${mimetype}) to ${folder}...`);

    const result = await uploadStream(buffer, {
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      // Vercel/Cloudinary timeout settings
      timeout: 120000, // 2 minutes
    });

    console.log(`[Cloudinary] ✅ Success: ${result.secure_url}`);
    return result;

  } catch (error) {
    console.error(`[Cloudinary] ❌ Attempt ${retryCount + 1} failed:`, error.message);

    // 🔄 Retry Logic (1s, 2s, 4s)
    if (retryCount < MAX_RETRIES) {
      const waitTime = Math.pow(2, retryCount) * 1000;
      console.warn(`⏳ Waiting ${waitTime / 1000}s before retry...`);
      await new Promise(res => setTimeout(res, waitTime));
      return uploadToCloudinary(buffer, folder, mimetype, retryCount + 1);
    }

    // Return fallback value instead of crashing if all retries fail
    console.error(`[Cloudinary] 💀 All retries failed for ${folder}/${fileSizeInKB}KB`);
    return { secure_url: "upload_failed", public_id: null };
  }
};

export default cloudinary;

/**
 * 🗑️ Delete a file from Cloudinary by its secure URL.
 * Extracts the public_id from the URL and calls destroy.
 */
export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || imageUrl === 'upload_failed') return;
  try {
    // Extract public_id: path after /upload/vXXXXXX/ without file extension
    const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (!matches || !matches[1]) {
      console.warn('[Cloudinary] Could not parse public_id from URL:', imageUrl);
      return;
    }
    const publicId = matches[1];
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary] 🗑️ Deleted asset: ${publicId} → ${result.result}`);
    return result;
  } catch (err) {
    console.error('[Cloudinary] ❌ Failed to delete asset:', err.message);
  }
};