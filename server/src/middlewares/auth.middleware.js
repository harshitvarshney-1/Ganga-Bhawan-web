import jwt from 'jsonwebtoken';
import { currentConfig } from '../config/env.js';

export const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : null;

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    if (!currentConfig.jwtSecret) {
      console.error('❌ JWT_SECRET is missing in environment variables!');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const decoded = jwt.verify(token, currentConfig.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};
