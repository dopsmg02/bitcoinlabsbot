import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10kb' }));

import authRoutes from '../server/src/routes/auth.routes';
import userRoutes from '../server/src/routes/user.routes';
import adRoutes from '../server/src/routes/ad.routes';
import mineRoutes from '../server/src/routes/mine.routes';
import economyRoutes from '../server/src/routes/economy.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ad', adRoutes);
app.use('/api/mine', mineRoutes);
app.use('/api/economy', economyRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'W2E Miner API is running.' });
});

// Vercel Serverless: export the Express app (do NOT call app.listen)
export default app;
