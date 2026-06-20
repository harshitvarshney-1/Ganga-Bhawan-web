import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser } from '../../controllers/auth/register.controller.js';
import { loginUser } from '../../controllers/auth/login.controller.js';
import { logoutUser } from '../../controllers/auth/logout.controller.js';
import { refreshAccessToken } from '../../controllers/auth/refresh.controller.js';

const router = express.Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test', // Skip rate limiting in tests
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many accounts created from this IP. Please try again after 1 hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);

export default router;
