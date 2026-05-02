import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { BASE_URL } from './config';

/**
 * Upload a single file directly to Cloudinary (bypasses backend completely).
 * This avoids Vercel's serverless function timeouts.
 * 
 * @param {File} file - The file to upload
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export const uploadToCloudinaryDirect = async (file, folder) => {
  // Step 1: Get signature from our backend
  const signRes = await axios.post(`${BASE_URL}/api/cloudinary/sign`, { folder });
  const { signature, timestamp, cloudName, apiKey, folder: signedFolder } = signRes.data;

  // Step 2: Compress image before upload (if it's an image)
  const compressionOptions = { 
    maxSizeMB: 0.8, 
    maxWidthOrHeight: 1920, 
    useWebWorker: true 
  };
  
  let uploadFile = file;
  if (file.type.startsWith('image/')) {
    try {
      uploadFile = await imageCompression(file, compressionOptions);
    } catch (error) {
      console.warn('[Cloudinary Upload] Compression failed, uploading original:', error);
    }
  }

  // Step 3: Upload directly to Cloudinary
  const formData = new FormData();
  formData.append('file', uploadFile);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', signedFolder);
  formData.append('resource_type', 'auto');

  const cloudRes = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    formData,
    { 
      timeout: 300000 // 5 min timeout for slow networks
    }
  );

  return cloudRes.data.secure_url;
};
