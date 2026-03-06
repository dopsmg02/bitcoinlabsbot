import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const syncMining = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // 1. Fetch User Data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { minerLevel: true, lastSyncAt: true, fuelUpdatedAt: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // 2. Rolling ad count check for Tier/Speed multiplier
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const adCount = await prisma.adSession.count({
            where: { userId, status: 'VALIDATED', createdAt: { gte: twentyFourHoursAgo } }
        });

        let speedMultiplier = 1.0;
        if (adCount >= 40) speedMultiplier = 2.5;
        else if (adCount >= 25) speedMultiplier = 2.0;
        else if (adCount >= 10) speedMultiplier = 1.5;

        // 3. SERVER AUTHORITATIVE TIMER LOGIC
        // Mining window max capacity is 15 minutes (900 seconds) from fuelUpdatedAt
        const FUEL_DURATION_MS = 900 * 1000;
        const fuelUpdatedAtMs = user.fuelUpdatedAt.getTime();
        const miningWindowEndMs = fuelUpdatedAtMs + FUEL_DURATION_MS;

        // The user can only claim gold from the period they haven't synced yet
        // If lastSyncAt is null (brand new user), set it to fuelUpdatedAt to prevent claiming before playing
        const lastSyncMs = user.lastSyncAt ? user.lastSyncAt.getTime() : fuelUpdatedAtMs;
        const nowMs = Date.now();

        // Calculate overlap between the [lastSync, now] claim window and the [fuelUpdate, fuelEnd] mining window
        const claimStartMs = Math.max(lastSyncMs, fuelUpdatedAtMs);
        const claimEndMs = Math.min(nowMs, miningWindowEndMs);

        let goldEarned = 0;
        let newSyncTime = new Date();

        if (claimEndMs > claimStartMs) {
            const earnedSeconds = (claimEndMs - claimStartMs) / 1000;

            const levelConfigs = [
                { level: 1, goldPerHr: 20000 }, { level: 2, goldPerHr: 32000 },
                { level: 3, goldPerHr: 48000 }, { level: 4, goldPerHr: 72000 },
                { level: 5, goldPerHr: 100000 }, { level: 6, goldPerHr: 140000 },
                { level: 7, goldPerHr: 200000 }, { level: 8, goldPerHr: 300000 },
                { level: 9, goldPerHr: 440000 }, { level: 10, goldPerHr: 640000 }
            ];

            const cfg = levelConfigs[user.minerLevel - 1] || levelConfigs[0];
            const goldPerSec = cfg.goldPerHr / 3600;

            goldEarned = earnedSeconds * goldPerSec * speedMultiplier;
        }

        // 4. Update Database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                goldBalance: { increment: BigInt(Math.floor(goldEarned)) },
                lastSyncAt: newSyncTime
            }
        });

        res.status(200).json({
            success: true,
            claimedNow: Math.floor(goldEarned),
            goldBalance: updatedUser.goldBalance.toString(),
            speedMultiplier
        });
    } catch (error) {
        console.error('Mine Sync Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
