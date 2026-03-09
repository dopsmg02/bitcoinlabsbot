import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

export const requireNotBanned = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isBanned: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isBanned) {
            return res.status(403).json({ error: 'Account suspended.' });
        }

        next();
    } catch (error) {
        console.error('Anti-Cheat Middleware Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
