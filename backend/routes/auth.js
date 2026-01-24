const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
const documentsDir = path.join(uploadsDir, 'documents');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save documents in organized directory
    if (file.fieldname === 'aadhaarDocument') {
      cb(null, documentsDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${uniqueSuffix}-${basename}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // Increased to 10MB for better document handling
    files: 1 // Limit to 1 file per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed!'));
    }
  }
});

// REGISTER TENANT
router.post('/register', upload.fields([
  { name: 'aadhaarDocument', maxCount: 1 }
]), async (req, res) => {
  let uploadedFile = null;
  
  try {
    const { 
      fullName, email, password, mobileNumber, 
      fatherName, fatherPhone, motherName, motherPhone,
      dateOfBirth, gender, permanentAddress, aadhaarNumber 
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !mobileNumber || !fatherName || !fatherPhone || !motherName || !motherPhone || !dateOfBirth || !gender || !permanentAddress || !aadhaarNumber) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    // Check if file is uploaded
    if (!req.files || !req.files['aadhaarDocument'] || req.files['aadhaarDocument'].length === 0) {
      return res.status(400).json({ error: 'Aadhaar document is required' });
    }

    uploadedFile = req.files['aadhaarDocument'][0];

    // Additional file validation
    if (uploadedFile.size === 0) {
      // Clean up empty file
      fs.unlinkSync(uploadedFile.path);
      return res.status(400).json({ error: 'Uploaded file is empty' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { aadhaarNumber }] 
    });
    
    if (existingUser) {
      // Clean up uploaded file if user already exists
      fs.unlinkSync(uploadedFile.path);
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
      aadhaarDocument: req.files['aadhaarDocument']?.[0] ? `uploads/documents/${req.files['aadhaarDocument'][0].filename}` : null,
      role: 'tenant',
      isApproved: false,
      createdAt: new Date(),
      fileMetadata: {
        aadhaarDocument: {
          originalName: req.files['aadhaarDocument']?.[0]?.originalname,
          uploadDate: new Date(),
          size: req.files['aadhaarDocument']?.[0]?.size,
          mimetype: req.files['aadhaarDocument']?.[0]?.mimetype
        }
      }
    });

    await newUser.save();

    res.status(201).json({ 
      success: true,
      message: 'Registration successful! Please wait for admin approval.' 
    });

  } catch (error) {
    console.error('Registration Error:', error);
    
    // Clean up uploaded file if registration fails
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      try {
        fs.unlinkSync(uploadedFile.path);
        console.log('Cleaned up uploaded file due to registration error');
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
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

    // Check if trying to access admin portal
    if (loginType === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
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