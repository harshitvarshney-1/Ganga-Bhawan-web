const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
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

// File Upload Configuration for Barcode Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'barcodes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
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

// Razorpay instance - using environment variables with test key fallback
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_S70rhaDygxgF40';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET'; // Replace with actual secret

// Warn if using placeholder secret
if (RAZORPAY_KEY_SECRET === 'YOUR_RAZORPAY_KEY_SECRET') {
  console.warn('⚠️  WARNING: Using placeholder Razorpay key secret. Please set RAZORPAY_KEY_SECRET in .env file for payment verification to work.');
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// 1. Create Order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, month, monthIndex } = req.body;

    // Validate input
    if (!amount || !month || monthIndex === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: amount, month, monthIndex' 
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

    // Check if Razorpay is properly configured
    if (RAZORPAY_KEY_SECRET === 'YOUR_RAZORPAY_KEY_SECRET') {
      return res.status(500).json({ 
        success: false,
        error: 'Razorpay is not configured. Please set RAZORPAY_KEY_SECRET in environment variables.' 
      });
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        month: month,
        userId: userId
      }
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (rzpError) {
      console.error('Razorpay order creation error:', rzpError);
      return res.status(500).json({ 
        success: false,
        error: rzpError.error?.description || 'Failed to create Razorpay order. Please check your Razorpay configuration.' 
      });
    }
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to create order. Please try again.' 
    });
  }
});

// 2. Verify Payment
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      month,
      monthIndex,
      amount
    } = req.body;

    // Signature verification
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment verified - Save to database
      const userId = req.user.userId || req.user.id;
      const payment = new Payment({
        userId: userId,
        month: month,
        monthIndex: monthIndex,
        amount: amount,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'success',
        paymentDate: new Date()
      });

      await payment.save();

      res.json({
        success: true,
        message: 'Payment verified and saved',
        payment
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// 3. Get Payment History
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

// 4. Submit Payment with Barcode Image (Manual Payment)
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
      barcodeImage: `uploads/barcodes/${req.file.filename}`,
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

// 4. Create Order with QR Code for UPI/Scan & Pay
router.post('/create-qr-order', auth, async (req, res) => {
  try {
    const { amount, month, monthIndex } = req.body;

    // Validate input
    if (!amount || !month || monthIndex === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: amount, month, monthIndex' 
      });
    }

    // Check if Razorpay is properly configured
    if (RAZORPAY_KEY_SECRET === 'YOUR_RAZORPAY_KEY_SECRET') {
      return res.status(500).json({ 
        success: false,
        error: 'Razorpay is not configured. Please set RAZORPAY_KEY_SECRET in environment variables.' 
      });
    }

    // First create an order
    const orderOptions = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${req.user.userId || req.user.id}`,
      notes: {
        month: month,
        userId: req.user.userId || req.user.id,
        monthIndex: monthIndex
      }
    };

    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
    } catch (rzpError) {
      console.error('Razorpay order creation error:', rzpError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create Razorpay order. Please check your Razorpay configuration.' 
      });
    }
    
    // Create a pending payment record
    const userId = req.user.userId || req.user.id;
    try {
      const pendingPayment = new Payment({
        userId: userId,
        month: month,
        monthIndex: monthIndex,
        amount: amount,
        razorpayOrderId: order.id,
        status: 'pending',
        paymentDate: new Date()
      });

      await pendingPayment.save();
    } catch (dbError) {
      console.error('Database error saving payment:', dbError);
      // Continue even if DB save fails, order is created
    }
    
    // Generate UPI QR code string
    // Format: upi://pay?pa=<UPI_ID>&pn=<Payee Name>&am=<Amount>&cu=<Currency>&tn=<Transaction Note>&tr=<Transaction Reference>
    // Note: For now, we'll use a simple approach - you can configure UPI ID later
    const upiId = process.env.RAZORPAY_UPI_ID || 'merchant@razorpay';
    
    // Create UPI payment link
    const qrCodeString = `upi://pay?pa=${upiId}&pn=PG%20Rent&am=${order.amount}&cu=INR&tn=Rent%20for%20${encodeURIComponent(month)}%20${new Date().getFullYear()}&tr=${order.id}`;
    
    // Generate QR code image URL
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeString)}`;
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      qrCode: qrCodeString,
      qrCodeImage: qrCodeImageUrl,
      message: 'QR code generated successfully. Scan with any UPI app.'
    });

  } catch (error) {
    console.error('QR Order creation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to create QR order. Please try again.' 
    });
  }
});

// 5. Check Payment Status (for polling)
router.get('/check-status/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get userId from token
    const userId = req.user.userId || req.user.id;
    
    // Check in database first
    const payment = await Payment.findOne({ razorpayOrderId: orderId, userId: userId });
    
    if (payment && payment.status === 'success') {
      return res.json({
        success: true,
        status: 'success',
        payment
      });
    }
    
    // If not in DB, check with Razorpay API
    try {
      const order = await razorpay.orders.fetch(orderId);
      const payments = await razorpay.orders.fetchPayments(orderId);
      
      if (payments.items && payments.items.length > 0) {
        const razorpayPayment = payments.items[0];
        
        if (razorpayPayment.status === 'captured' || razorpayPayment.status === 'authorized') {
          // Update payment in database
          if (payment) {
            payment.status = 'success';
            payment.razorpayPaymentId = razorpayPayment.id;
            await payment.save();
          } else {
            // Create new payment record
            const newPayment = new Payment({
              userId: userId,
              month: payment?.month || 'Unknown',
              monthIndex: payment?.monthIndex || 0,
              amount: razorpayPayment.amount / 100,
              razorpayOrderId: orderId,
              razorpayPaymentId: razorpayPayment.id,
              status: 'success',
              paymentDate: new Date(razorpayPayment.created_at * 1000)
            });
            await newPayment.save();
          }
          
          return res.json({
            success: true,
            status: 'success',
            payment: payment || newPayment
          });
        }
      }
      
      res.json({
        success: true,
        status: payment?.status || 'pending'
      });
    } catch (rzpError) {
      res.json({
        success: true,
        status: payment?.status || 'pending'
      });
    }
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// 6. Razorpay Webhook Handler (for automatic payment detection)
// Note: This endpoint should be configured in Razorpay dashboard
// For webhook to work, you need to set up webhook URL in Razorpay dashboard
router.post('/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(webhookBody)
      .digest('hex');
    
    if (webhookSignature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const event = req.body;
    
    // Handle payment.captured event
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentData = event.payload?.payment?.entity || event.payload?.payment;
      const orderId = paymentData?.order_id;
      
      if (orderId) {
        // Find pending payment by order ID
        const payment = await Payment.findOne({ razorpayOrderId: orderId, status: 'pending' });
        
        if (payment) {
          payment.status = 'success';
          payment.razorpayPaymentId = paymentData.id;
          payment.paymentDate = new Date(paymentData.created_at * 1000);
          await payment.save();
          
          console.log(`✅ Payment verified via webhook: ${orderId}`);
        }
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;