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
  try {
    // Step 1: Get signature from our backend
    console.log(`[Cloudinary] Getting signature for folder: ${folder}...`);
    const signRes = await axios.post(`${BASE_URL}/api/cloudinary/sign`, { folder });
    const { signature, timestamp, cloudName, apiKey, folder: signedFolder } = signRes.data;

    if (!signature || !cloudName) {
      throw new Error('Invalid signature response from server');
    }

    // Step 2: Compress image before upload (if it's an image)
    const compressionOptions = { 
      maxSizeMB: 0.8, 
      maxWidthOrHeight: 1920, 
      useWebWorker: true 
    };
    
    let uploadFile = file;
    if (file.type.startsWith('image/')) {
      try {
        console.log(`[Cloudinary] Compressing image: ${file.name}...`);
        uploadFile = await imageCompression(file, compressionOptions);
      } catch (error) {
        console.warn('[Cloudinary] Compression failed, using original:', error);
      }
    }

    // Step 3: Upload directly to Cloudinary
    const formData = new FormData();
    // Important: Cloudinary needs the file, api_key, timestamp, and signature
    // We also include 'folder' because we included it in the signature
    formData.append('file', uploadFile, file.name); // Add file name for consistency
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', signedFolder);

    console.log(`[Cloudinary] Uploading to https://api.cloudinary.com/v1_1/${cloudName}/image/upload ...`);
    
    const cloudRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      { 
        timeout: 300000 // 5 min timeout
      }
    );

    return cloudRes.data.secure_url;
  } catch (error) {
    console.error('[Cloudinary] Upload Error:', error.response?.data || error.message);
    throw error;
  }
};
