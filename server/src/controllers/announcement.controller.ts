import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const getAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
        const { all } = req.query;
        const where: any = {};

        // If not 'all=true', only fetch active ones
        if (all !== 'true') {
            where.active = true;
        }

        const announcements = await prisma.announcement.findMany({
            where,
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
        const { text } = req.body;
        const announcement = await prisma.announcement.create({
            data: { text, active: true }
        });
        res.status(201).json({ success: true, data: announcement });
    } catch (error: any) {
        console.error('Create Announcement Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const updateAnnouncement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { active, text } = req.body;

        const data: any = {};
        if (active !== undefined) data.active = active;
        if (text !== undefined) data.text = text;

        await prisma.announcement.update({
            where: { id },
            data
        });
        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Update Announcement Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
