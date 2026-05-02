import cloudinary from '../../infra/cloudinary.js';
import { currentConfig } from '../../config/env.js';

/**
 * POST /api/cloudinary/sign
 * Generates a signed upload signature for the frontend to upload directly to Cloudinary.
 * This bypasses the backend for file transfer, eliminating Vercel timeout issues.
 */
export const getCloudinarySignature = (req, res) => {
  try {
    const { folder, fileType } = req.body;
    
    // Security: Validate file type before signing
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (fileType && !allowedTypes.includes(fileType)) {
      console.warn(`[Cloudinary Sign] ⚠️ Blocked signing request for invalid type: ${fileType}`);
      return res.status(400).json({ error: 'Invalid file type. Only JPG, PNG and WebP are allowed.' });
    }

    if (!currentConfig.cloudinary.apiSecret) {
      console.error('[Cloudinary Sign] ❌ CLOUDINARY_API_SECRET is missing in environment variables!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Only sign essential parameters to avoid signature mismatches
    const paramsToSign = {
      timestamp,
      folder: folder || 'ganga-bhawan',
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      currentConfig.cloudinary.apiSecret
    );

    console.log(`[Cloudinary Sign] ✅ Generated signature for folder: ${paramsToSign.folder}`);

    res.json({
      signature,
      timestamp,
      cloudName: currentConfig.cloudinary.cloudName,
      apiKey: currentConfig.cloudinary.apiKey,
      folder: paramsToSign.folder,
    });
  } catch (error) {
    console.error('[Cloudinary Sign] Error:', error.message);
    res.status(500).json({ error: 'Failed to generate upload signature' });
  }
};
