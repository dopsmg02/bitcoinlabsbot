import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Hardcode super admin for absolute fallback safety
        if (userId === '742625427') {
            return next();
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, isBanned: true }
        });

        if (!user || user.isBanned) {
            return res.status(401).json({ error: 'Unauthorized or banned' });
        }

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            return next();
        }

        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    } catch (error) {
        console.error('Admin Middleware Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Hardcode super admin
        if (userId === '742625427') {
            return next();
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (user && user.role === 'SUPER_ADMIN') {
            return next();
        }

        return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    } catch (error) {
        console.error('Super Admin Middleware Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
