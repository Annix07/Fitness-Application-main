import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import dietRoutes from './routes/dietRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MacroPace MySQL Backend API is running smoothly.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`MacroPace Backend Server running at http://localhost:${PORT}`);
});
