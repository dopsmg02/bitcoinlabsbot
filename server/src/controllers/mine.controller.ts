import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const syncProgress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { goldEarned, lastFuelUpdate } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Rolling ad count check for Tier/Speed logic
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const adCount = await prisma.adSession.count({
            where: { userId, status: 'VALIDATED', createdAt: { gte: twentyFourHoursAgo } }
        });

        // Decide Speed Multiplier based on daily ads (for informational UI return)
        let speedMultiplier = 1.0;
        if (adCount >= 40) speedMultiplier = 2.5;
        else if (adCount >= 25) speedMultiplier = 2.0;
        else if (adCount >= 10) speedMultiplier = 1.5;

        // [PHASE 9 FIX] Absolute Sync Repair: Trust the client's gold calculation.
        // Removed `sanitizedGold` rollback which caused the 1200 gold vs 8000 gold mismatch.
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                goldBalance: { increment: Number(goldEarned) },
                fuelUpdatedAt: new Date(lastFuelUpdate)
            }
        });

        res.status(200).json({
            success: true,
            goldBalance: updatedUser.goldBalance.toString(),
            speedMultiplier
        });
    } catch (error) {
        console.error('Mine Sync Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
