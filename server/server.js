import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import ConnectDB from './db/mongodb.js';
import router from './routes/index.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

ConnectDB();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Add path for temporary storage if needed (though we use memory)
app.use('/tmp', express.static('/tmp'));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend is running!' });
});
app.use('/api', router);

// Start Server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
