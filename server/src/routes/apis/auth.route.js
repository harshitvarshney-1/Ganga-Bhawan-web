import express from 'express';
import { upload } from '../../infra/cloudinary.js';
import { registerUser } from '../../controllers/auth/register.controller.js';
import { loginUser } from '../../controllers/auth/login.controller.js';
import { logoutUser } from '../../controllers/auth/logout.controller.js';

const router = express.Router();

router.post('/register', upload.fields([
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 }
]), registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;
