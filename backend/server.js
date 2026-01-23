const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const paymentRoutes = require('./routes/payment');

const app = express();

// CORS + body parsing FIRST (before any routes) so /api/payments etc. get CORS headers
// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || '*', // Allow specific origin or all
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tenant', require('./routes/tenant'));
app.use('/api/admin', require('./routes/admin'));

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});