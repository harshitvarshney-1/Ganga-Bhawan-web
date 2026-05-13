import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { currentConfig } from './config/env.js';
import { connectDB } from './infra/mongodb.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://gangabhawan.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Origin:', origin);
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Explicitly handle preflight for all routes
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static uploads if still needed
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Database Connection
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB on startup:', err.message);
});

// API Routes
app.use('/api', routes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running with ES Modules!' });
});

// Global error handler — ensures CORS headers are always present even on errors
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server (only when not on Vercel serverless)
if (process.env.NODE_ENV !== 'test') {
  app.listen(currentConfig.port, () => {
    console.log(`🚀 Server running on port ${currentConfig.port} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

export default app;
