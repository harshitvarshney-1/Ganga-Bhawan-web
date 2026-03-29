import cloudinary from '../../infra/cloudinary.js';
import { currentConfig } from '../../config/env.js';

/**
 * POST /api/cloudinary/sign
 * Generates a signed upload signature for the frontend to upload directly to Cloudinary.
 * This bypasses the backend for file transfer, eliminating Vercel timeout issues.
 */
export const getCloudinarySignature = (req, res) => {
  try {
    const { folder } = req.body;
    const timestamp = Math.round(new Date().getTime() / 1000);

    const params = {
      timestamp,
      folder: folder || 'ganga-bhawan',
      resource_type: 'auto',
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      currentConfig.cloudinary.apiSecret
    );

    res.json({
      signature,
      timestamp,
      cloudName: currentConfig.cloudinary.cloudName,
      apiKey: currentConfig.cloudinary.apiKey,
      folder: params.folder,
    });
  } catch (error) {
    console.error('[Cloudinary Sign] Error:', error.message);
    res.status(500).json({ error: 'Failed to generate upload signature' });
  }
};
