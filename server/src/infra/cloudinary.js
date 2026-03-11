import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { currentConfig } from '../config/env.js';

cloudinary.config({
  cloud_name: currentConfig.cloudinary.cloudName,
  api_key: currentConfig.cloudinary.apiKey,
  api_secret: currentConfig.cloudinary.apiSecret
});

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/;
    // We only check mimetype to make it simple and robust
    const mimetype = fileTypes.test(file.mimetype);
    // Extract extension or just rely on mimetype
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images and PDFs only!'));
    }
  }
});

export const uploadToCloudinary = (buffer, folder = 'ganga-bhawan') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export default cloudinary;
