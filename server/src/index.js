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

app.use(compression());

// --- ULTIMATE CORS FIX ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  currentConfig.clientUrl
].filter(Boolean).map(o => o.replace(/\/$/, ''));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
  
  if (allowedOrigins.includes(normalizedOrigin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// We still keep the middleware as a secondary layer
app.use(cors({
  origin: true, // Reflect request origin
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});

app.get('/ping', (req, res) => res.status(200).send('pong'));
app.use('/api', routes);
app.get('/', (req, res) => res.json({ message: 'Ganga Bhawan API Live' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(currentConfig.port, () => {
    console.log(`🚀 Server on port ${currentConfig.port}`);
    if (process.env.NODE_ENV === 'production') {
      setInterval(() => axios.get(`${currentConfig.serverUrl}/ping`).catch(() => {}), 14 * 60 * 1000);
    }
  });
}

export default app;
