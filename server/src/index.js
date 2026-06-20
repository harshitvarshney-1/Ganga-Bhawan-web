import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import compression from 'compression';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { currentConfig } from './config/env.js';
import { connectDB } from './infra/mongodb.js';
import routes from './routes/index.js';
import { verifyEmailConnection } from './utils/email.util.js';
import { sanitizeError } from './utils/error.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS Configuration with Origin Whitelist
const allowedOrigins = [
  currentConfig.clientUrl,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization, Origin');
    res.header('Access-Control-Max-Age', '3600');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'");
  next();
});

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cookie security settings for CSRF protection
app.use((req, res, next) => {
  // Set secure cookie defaults
  res.cookie = function(name, val, options) {
    options = options || {};
    // Production: Use secure, HttpOnly, SameSite=Strict
    if (process.env.NODE_ENV === 'production') {
      options.secure = true; // HTTPS only
      options.httpOnly = true; // Not accessible via JavaScript
      options.sameSite = 'strict'; // CSRF protection
    } else {
      // Development: Allow localhost without HTTPS
      options.httpOnly = true;
      options.sameSite = 'lax';
    }
    return Object.getPrototypeOf(res).cookie.call(this, name, val, options);
  };
  next();
});

connectDB().then(() => {
  // Verify Email connection after DB is up
  verifyEmailConnection();
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});

app.get('/ping', (req, res) => res.status(200).send('pong'));
app.use('/api', routes);
app.get('/', (req, res) => res.json({ message: 'API is Live' }));

// Global error handler - sanitizes sensitive information
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  const sanitizedMessage = sanitizeError(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: sanitizedMessage });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(currentConfig.port, () => {
    console.log(`🚀 Port: ${currentConfig.port}`);
    if (process.env.NODE_ENV === 'production' && currentConfig.serverUrl) {
      setInterval(() => axios.get(`${currentConfig.serverUrl}/ping`).catch(() => {}), 14 * 60 * 1000);
    }
  });
}

export default app;
