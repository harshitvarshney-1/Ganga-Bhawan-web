import express from 'express';
import cors from 'cors';
import path from 'path';
import compression from 'compression';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { currentConfig } from './config/env.js';
import { connectDB } from './infra/mongodb.js';
import routes from './routes/index.js';
import { verifyEmailConnection } from './utils/email.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- THE "I GIVE UP" CORS FIX (PERMISSIVE MODE) ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Always reflect the origin to allow credentials
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization, Origin');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

connectDB().then(() => {
  // Verify Email connection after DB is up
  verifyEmailConnection();
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});

app.get('/ping', (req, res) => res.status(200).send('pong'));
app.use('/api', routes);
app.get('/', (req, res) => res.json({ message: 'API is Live' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server Error' });
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
