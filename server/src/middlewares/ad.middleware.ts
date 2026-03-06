import { Request, Response, NextFunction } from 'express';

/**
 * Gate #4: Enforcement of 14-min cooldown between ads.
 * Gate #2: Enforcement of 50 ads per day.
 * [PHASE 11 FIX] Removed Redis dependency — uses DB-only logic (lastAdWatch + AdSession count)
 */
export const validateAdRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { prisma } = require('../prisma/client');

        // 1. Check Cooldown via DB (Gate #4) — uses lastAdWatch field
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { lastAdWatch: true }
        });

        if (user?.lastAdWatch) {
            const elapsedSeconds = Math.floor((Date.now() - user.lastAdWatch.getTime()) / 1000);
            const remainingCooldown = 840 - elapsedSeconds;

            if (remainingCooldown > 0) {
                res.status(429).json({
                    error: 'Cooldown active',
                    remainingSeconds: remainingCooldown
                });
                return;
            }
        }

        // 2. Check Daily Limit (Gate #2) — rolling 24h count from DB
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
