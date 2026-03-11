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

// CORS configuration
const corsOptions = {
  origin: currentConfig.clientUrl || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads if still needed
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/tmp', express.static('/tmp'));


// Database Connection
connectDB();

// API Routes
app.use('/api', routes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running with ES Modules!' });
});

// Start Server
if (process.env.NODE_ENV !== 'test') { // Adjust based on your testing setup
  app.listen(currentConfig.port, () => {
    console.log(`🚀 Server running on port ${currentConfig.port} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

export default app;
