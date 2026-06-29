import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model.js';
import { currentConfig } from '../../config/env.js';
import { writeLog } from '../admin/auditLog.controller.js';

export const loginUser = async (req, res) => {
  try {
    const { email, password, loginType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (loginType === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Please use Tenant Login.' });
    }

    if (loginType === 'tenant' && user.role === 'admin') {
      return res.status(403).json({ error: 'Access denied. Please use Admin Login.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed login
      writeLog({ userId: user._id, action: 'login_failed', req, metadata: { reason: 'invalid_password' } });
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (user.role === 'tenant' && !user.isApproved) {
      return res.status(403).json({
        error: 'Your account is pending admin approval'
      });
    }

    if (user.isDisabled) {
      return res.status(403).json({
        error: 'Your account has been disabled by the admin. Please contact support.'
      });
    }

    // Short-lived access token (15 minutes)
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email,
        type: 'access'
      },
      currentConfig.jwtSecret,
      { expiresIn: '15m' }
    );

    // Long-lived refresh token (1 day) - stored in httpOnly cookie
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        type: 'refresh'
      },
      currentConfig.jwtSecret,
      { expiresIn: '1d' }
    );

    // Set refresh token in httpOnly cookie (secure in production)
    const cookieOptions = {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day in milliseconds
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Log successful login
    writeLog({ userId: user._id, action: 'login_success', req, metadata: { role: user.role } });

    res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        name: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};
