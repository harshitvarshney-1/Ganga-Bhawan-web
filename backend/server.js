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
  origin: [
    'https://gangabhawan.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.CLIENT_URL
  ].filter(Boolean), // Remove any undefined values
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Additional CORS headers for Vercel compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'https://gangabhawan.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});
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
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;