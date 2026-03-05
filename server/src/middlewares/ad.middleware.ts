import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

/**
 * Gate #4: Enforcement of 14-min cooldown between ads.
 * Gate #2: Enforcement of 50 ads per day.
 * (Calculated via Redis or DB rollout depending on complexity)
 */
export const validateAdRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // 1. Check Redis Cooldown (Gate #4)
        const lastWatch = await redis.get(`ad_cooldown:${userId}`);
        if (lastWatch) {
            const lastWatchTs = parseInt(lastWatch, 10);
            const elapsedSeconds = Math.floor((Date.now() - lastWatchTs) / 1000);
            const remainingCooldown = 840 - elapsedSeconds;

            if (remainingCooldown > 0) {
                res.status(429).json({
                    error: 'Cooldown active',
                    remainingSeconds: remainingCooldown
                });
                return;
            }
        }

        // 2. Check Daily Limit (Gate #2)
        // Rolling 24h count from DB is most accurate for enforcement
        const { prisma } = require('../prisma/client');
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const adCount = await prisma.adSession.count({
            where: { userId, status: 'VALIDATED', createdAt: { gte: twentyFourHoursAgo } }
        });

        if (adCount >= 50) {
            res.status(403).json({
                error: 'Daily limit reached',
                message: 'You have reached the limit of 50 ads per 24 hours.'
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Ad Middleware Error:', error);
        next(); // Fail open for UX, logger will catch it
    }
};
