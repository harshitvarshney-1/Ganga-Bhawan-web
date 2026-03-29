import jwt from 'jsonwebtoken';
import { currentConfig } from '../config/env.js';

<<<<<<<< HEAD:server/src/middlewares/auth.middleware.js
export const authMiddleware = (req, res, next) => {
========
const authMiddleware = (req, res, next) => {
>>>>>>>> avdhesh/chore/refactor-codebase:server/middleware/auth.middleware.js
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
<<<<<<<< HEAD:server/src/middlewares/auth.middleware.js
};
========
}

export default authMiddleware;
>>>>>>>> avdhesh/chore/refactor-codebase:server/middleware/auth.middleware.js
