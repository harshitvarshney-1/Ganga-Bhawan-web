const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth.middleware');
const User = require('../models/User');

const router = express.Router();

// File Upload Configuration for Profile Picture
// File Upload Configuration for Profile Picture (Memory storage for Vercel)
const storage = multer.memoryStorage();


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
  
});

// UPDATE: Tenant Profile
router.put('/profile', auth, upload.single('profilePicture'), async (req, res) => {
  
});

module.exports = router;