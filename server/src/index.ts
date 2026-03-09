import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set in production!');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10kb' }));

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import announcementRoutes from './routes/announcement.routes';
import investmentRoutes from './routes/investment.routes';
import paymentRoutes from './routes/payment.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'HYIP Mini App API is running.' });
});

// Telegram Bot Service (For /start and welcome)
import { botService } from './services/bot.service';
botService.init();

// Background Workers (Investment ROI & Payouts)
import { startRoiDistributionWorker } from './services/roi.worker';
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_WORKERS === 'true') {
    startRoiDistributionWorker();
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
