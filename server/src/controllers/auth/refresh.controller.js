import jwt from 'jsonwebtoken';
import { currentConfig } from '../../config/env.js';

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found. Please login again.' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, currentConfig.jwtSecret);
    } catch (error) {
      return res.status(401).json({ error: 'Refresh token expired. Please login again.' });
    }

    // Verify it's a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
        type: 'access'
      },
      currentConfig.jwtSecret,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      token: newAccessToken
    });

  } catch (error) {
    console.error('Token Refresh Error:', error);
    res.status(500).json({ error: 'Server error during token refresh' });
  }
};
