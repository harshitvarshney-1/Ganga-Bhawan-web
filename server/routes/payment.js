const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');

const router = express.Router();

// File Upload Configuration for Barcode Images (Memory storage for Vercel)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images or PDFs only!');
    }
  }
});

module.exports = router;