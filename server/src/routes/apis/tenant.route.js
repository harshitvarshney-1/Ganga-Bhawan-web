import express from 'express';
import { upload } from '../../infra/cloudinary.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { getTenantProfile } from '../../controllers/tenant/profile.controller.js';
import { updateTenantProfile } from '../../controllers/tenant/updateProfile.controller.js';

const router = express.Router();

router.get('/profile', authMiddleware, getTenantProfile);
router.put('/profile', authMiddleware, upload.single('profilePicture'), updateTenantProfile);

export default router;
