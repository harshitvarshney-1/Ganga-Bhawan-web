const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');

const router = express.Router();

// Ensure uploads/barcodes directory exists
const barcodesDir = path.join(__dirname, '..', 'uploads', 'barcodes');
if (!fs.existsSync(barcodesDir)) {
  fs.mkdirSync(barcodesDir, { recursive: true });
  console.log('✅ Created uploads/barcodes directory');
}

// File Upload Configuration for Barcode Images (Memory storage for Vercel)
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

// 1. Get Payment History
router.get('/history', auth, async (req, res) => {
  try {
    // Use userId from JWT token (set in auth middleware)
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }

    const payments = await Payment.find({ userId: userId })
      .sort({ paymentDate: -1 });

    res.json(payments || []);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// 2. Submit Payment with Barcode Image (Manual Payment)
router.post('/submit', auth, upload.single('barcodeImage'), async (req, res) => {
  try {
    const { month, monthIndex, amount } = req.body;

    // Validate input
    if (!month || monthIndex === undefined || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: month, monthIndex, amount'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Barcode image is required'
      });
    }

    // Get userId from token
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not found in token'
      });
    }

    // Check if payment already exists for this month
    const existingPayment = await Payment.findOne({
      userId: userId,
      month: month,
      monthIndex: parseInt(monthIndex),
      status: { $in: ['pending', 'success'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'Payment already submitted for this month'
      });
    }

    // Create pending payment record
    const payment = new Payment({
      userId: userId,
      month: month,
      monthIndex: parseInt(monthIndex),
      amount: parseFloat(amount),
      barcodeImage: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null,
      barcodeImageData: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      } : null,
      status: 'pending',
      paymentDate: new Date()
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment submitted successfully. Waiting for admin approval.',
      payment
    });

  } catch (error) {
    console.error('Payment submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit payment'
    });
  }
});

module.exports = router;