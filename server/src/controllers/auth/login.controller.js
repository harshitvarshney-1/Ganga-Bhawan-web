import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model.js';
import { currentConfig } from '../../config/env.js';

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
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (user.role === 'tenant' && !user.isApproved) {
      return res.status(403).json({
        error: 'Your account is pending admin approval'
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email
      },
      currentConfig.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
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
