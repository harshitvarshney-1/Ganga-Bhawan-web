import express from 'express';
import { registerUser } from '../../controllers/auth/register.controller.js';
import { loginUser } from '../../controllers/auth/login.controller.js';
import { logoutUser } from '../../controllers/auth/logout.controller.js';

const router = express.Router();

// No multer needed — files are uploaded directly to Cloudinary from frontend
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;
