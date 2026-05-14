import express from 'express';
import cors from 'cors';
import path from 'path';
import compression from 'compression';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { currentConfig } from './config/env.js';
import { connectDB } from './infra/mongodb.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. PERFORMANCE: Enable compression to reduce response size
app.use(compression());

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  currentConfig.clientUrl,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // 1. Allow if no origin (like mobile apps)
    if (!origin) return callback(null, true);

    // 2. Normalize URLs (remove trailing slashes) for comparison
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(o => {
      if (!o) return false;
      const normalizedAllowed = o.replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed || normalizedOrigin.startsWith(normalizedAllowed);
    });

    if (isAllowed) {
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
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB on startup:', err.message);
});

// 2. Health Check & Keep-Alive Ping
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// API Routes
app.use('/api', routes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Ganga Bhawan API is running (Optimized)' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(currentConfig.port, () => {
    console.log(`🚀 Server running on port ${currentConfig.port} in ${process.env.NODE_ENV || 'development'} mode`);
    
    // 3. Keep-Alive Mechanism (Self-Ping)
    // Runs every 14 minutes to prevent Render/Railway free-tier sleep
    if (process.env.NODE_ENV === 'production') {
      const SELF_URL = process.env.SERVER_URL || `http://localhost:${currentConfig.port}`;
      setInterval(async () => {
        try {
          console.log('Self-pinging to keep server alive...');
          await axios.get(`${SELF_URL}/ping`);
        } catch (err) {
          console.error('Self-ping failed:', err.message);
        }
      }, 14 * 60 * 1000); // 14 minutes
    }
  });
}

export default app;
