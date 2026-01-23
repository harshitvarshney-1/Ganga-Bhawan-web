const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// File Upload Configuration for Profile Picture
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// GET: Tenant Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE: Tenant Profile
router.put('/profile', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      fullName,
      email,
      mobileNumber,
      fatherName,
      motherName,
      dateOfBirth,
      gender,
      permanentAddress
    } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields (excluding aadhaarNumber, fatherPhone, motherPhone)
    if (fullName) user.fullName = fullName;
    if (email) user.email = email.toLowerCase();
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (fatherName) user.fatherName = fatherName;
    if (motherName) user.motherName = motherName;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (permanentAddress) user.permanentAddress = permanentAddress;

    // Update profile picture if uploaded (permanent - can be updated)
    if (req.file) {
      user.profilePicture = `uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: await User.findById(userId).select('-password')
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
});

module.exports = router;