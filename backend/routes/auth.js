const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

// File Upload Configuration
// File Upload Configuration (Memory storage for Vercel)
const storage = multer.memoryStorage();


const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images and PDFs only!');
    }
  }
});

// REGISTER TENANT
router.post('/register', upload.fields([
  { name: 'aadhaarFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      fullName, email, password, mobileNumber,
      fatherName, fatherPhone, motherName, motherPhone,
      dateOfBirth, gender, permanentAddress, aadhaarNumber
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !mobileNumber || !aadhaarNumber) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { aadhaarNumber }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email or Aadhaar number already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      mobileNumber,
      fatherName,
      fatherPhone,
      motherName,
      motherPhone,
      dateOfBirth,
      gender,
      permanentAddress,
      aadhaarNumber,
      aadhaarFile: req.files['aadhaarFile']?.[0] ? `data:${req.files['aadhaarFile'][0].mimetype};base64,${req.files['aadhaarFile'][0].buffer.toString('base64')}` : null,
      aadhaarFileData: req.files['aadhaarFile']?.[0] ? {
        data: req.files['aadhaarFile'][0].buffer,
        contentType: req.files['aadhaarFile'][0].mimetype,
        filename: req.files['aadhaarFile'][0].originalname
      } : null,
      role: 'tenant',

      isApproved: false
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.'
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// LOGIN (Both Tenant and Admin)
router.post('/login', async (req, res) => {
  try {
    const { email, password, loginType } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for role-loginType mismatch
    if (loginType === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Please use Tenant Login.' });
    }

    if (loginType === 'tenant' && user.role === 'admin') {
      return res.status(403).json({ error: 'Access denied. Please use Admin Login.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Check if tenant is approved
    if (user.role === 'tenant' && !user.isApproved) {
      return res.status(403).json({
        error: 'Your account is pending admin approval'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
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
});

module.exports = router;