import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

export const requireNotBanned = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isBanned: true, fraudScore: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Auto-ban logic: Disabled for early sybil growth. Only flag/warn.
        if (!(user as any).isBanned && user.fraudScore >= 5) {
            console.warn(`[ANTI-CHEAT RELAXED] User ${userId} flagged with high fraud score (${user.fraudScore}). Sybil allowed for now.`);
            // Removed: prisma.user.update isBanned: true
            // Removed: res.status(403)
        }

        if ((user as any).isBanned) {
            return res.status(403).json({ error: 'Account suspended.' });
        }

        next();
    } catch (error) {
        console.error('Anti-Cheat Middleware Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
