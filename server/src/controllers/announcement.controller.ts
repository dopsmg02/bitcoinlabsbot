import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const getAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: announcements
        });
    } catch (error) {
        console.error('Announcements Fetch Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Admin endpoints for later integration
export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { text, type } = req.body;
        const announcement = await prisma.announcement.create({
            data: { text, type, active: true }
        });
        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const toggleAnnouncement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { active } = req.body;
        await prisma.announcement.update({
            where: { id },
            data: { active }
        });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
