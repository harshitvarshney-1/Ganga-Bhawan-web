import imageCompression from 'browser-image-compression';

// These come from Vite environment variables (set in Vercel dashboard too)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a single file directly to Cloudinary using an UNSIGNED upload preset.
 * This requires NO backend call — 100% client-side.
 * No timeout issues, no backend deployment needed.
 * 
 * Setup (one-time):
 * 1. Go to https://cloudinary.com/console/settings/upload
 * 2. Click "Add upload preset"
 * 3. Set "Signing mode" to UNSIGNED
 * 4. Set the preset name to match VITE_CLOUDINARY_UPLOAD_PRESET
 * 5. Set the folder if desired
 * 6. Save
 * 
 * @param {File} file - The file to upload
 * @param {string} folder - Cloudinary folder name (e.g. 'profile_photos')
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export const uploadToCloudinaryDirect = async (file, folder) => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.'
    );
  }

  // Step 1: Compress image to reduce upload time
  let uploadFile = file;
  if (file.type.startsWith('image/')) {
    try {
      console.log(`[Cloudinary] Compressing: ${file.name} (${(file.size / 1024).toFixed(0)} KB)...`);
      uploadFile = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      console.log(`[Cloudinary] Compressed to: ${(uploadFile.size / 1024).toFixed(0)} KB`);
    } catch (err) {
      console.warn('[Cloudinary] Compression failed, using original:', err);
    }
  }

  // Step 2: Upload directly to Cloudinary (unsigned — no backend needed)
  const formData = new FormData();
  formData.append('file', uploadFile, file.name);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  console.log(`[Cloudinary] Uploading "${file.name}" to folder "${folder}"...`);

  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('[Cloudinary] Upload failed:', data);
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }

  console.log(`[Cloudinary] ✅ Upload success: ${data.secure_url}`);
  return data.secure_url;
};
