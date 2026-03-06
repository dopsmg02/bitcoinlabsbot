import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const activeMiners = await prisma.user.count({
            where: {
                lastLoginIp: { not: null }
            }
        });

        // Use raw query for bigInt sum safely
        const aggregated = await prisma.user.aggregate({
            _sum: {
                maxBalance: true
            }
        });

        const totalMax = aggregated._sum.maxBalance || 0;

        // Count pending withdrawals
        const pendingWithdrawals = await prisma.withdrawal.count({
            where: { status: 'PENDING' }
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                activeMiners,
                totalMax: Number(totalMax),
                pendingWithdrawals
            }
        });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = req.query.search as string;

        const skip = (page - 1) * limit;

        let whereClause: any = {};
        if (search) {
            whereClause = {
                OR: [
                    { id: { contains: search } },
                    { telegramUsername: { contains: search, mode: 'insensitive' } }
                ]
            };
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    telegramUsername: true,
                    role: true,
                    minerLevel: true,
                    maxBalance: true,
                    goldBalance: true,
                    isBanned: true,
                    createdAt: true
                }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            data: users.map(u => ({
                ...u,
                goldBalance: u.goldBalance.toString() // Convert BigInt for JSON
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('getUsers error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
};

export const adjustUserBalance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { type, amount } = req.body; // type: 'GOLD' | 'MAX', amount: number (can be negative)

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ success: false, error: 'Invalid amount' });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        let updateData: any = {};
        if (type === 'GOLD') {
            const newBalance = user.goldBalance + BigInt(amount);
            updateData.goldBalance = newBalance < 0n ? 0n : newBalance;
        } else if (type === 'MAX') {
            const currentAmount = Number(user.maxBalance);
            const newBalance = currentAmount + Number(amount);
            updateData.maxBalance = newBalance < 0 ? 0 : newBalance;
        } else {
            return res.status(400).json({ success: false, error: 'Invalid type' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            data: {
                id: updatedUser.id,
                goldBalance: updatedUser.goldBalance.toString(),
                maxBalance: Number(updatedUser.maxBalance)
            }
        });
    } catch (error) {
        console.error('adjustUserBalance error:', error);
        res.status(500).json({ success: false, error: 'Failed to update balance' });
    }
};

export const setUserLevel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { level } = req.body;

        if (typeof level !== 'number' || level < 1 || level > 10) {
            return res.status(400).json({ success: false, error: 'Invalid level (must be 1-10)' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { minerLevel: level }
        });

        res.json({ success: true, data: { level: updatedUser.minerLevel } });
    } catch (error) {
        console.error('setUserLevel error:', error);
        res.status(500).json({ success: false, error: 'Failed to update level' });
    }
};

export const toggleShadowBan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isBanned } = req.body;

        if (typeof isBanned !== 'boolean') {
            return res.status(400).json({ success: false, error: 'isBanned must be boolean' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { isBanned }
        });

        res.json({ success: true, data: { isBanned: updatedUser.isBanned } });
    } catch (error) {
        console.error('toggleShadowBan error:', error);
        res.status(500).json({ success: false, error: 'Failed to update shadow ban config' });
    }
};

// --- SUPER ADMIN ONLY ROUTES ---

export const setAdminRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // 'PLAYER' | 'ADMIN'

        if (role !== 'PLAYER' && role !== 'ADMIN') {
            return res.status(400).json({ success: false, error: 'Invalid role' });
        }

        if (id === '742625427') {
            return res.status(403).json({ success: false, error: 'Cannot modify SUPER_ADMIN' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role }
        });

        res.json({ success: true, data: { role: updatedUser.role } });
    } catch (error) {
        console.error('setAdminRole error:', error);
        res.status(500).json({ success: false, error: 'Failed to update role' });
    }
};

export const getSystemConfig = async (req: Request, res: Response) => {
    try {
        let config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
        if (!config) {
            config = await prisma.systemConfig.create({
                data: { id: "GLOBAL", maintenanceMode: false, goldToMaxRate: 1250 }
            });
        }
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('getSystemConfig error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch config' });
    }
};

export const updateSystemConfig = async (req: Request, res: Response) => {
    try {
        const { maintenanceMode, goldToMaxRate } = req.body;

        let updateData: any = {};
        if (typeof maintenanceMode === 'boolean') updateData.maintenanceMode = maintenanceMode;
        if (goldToMaxRate && !isNaN(goldToMaxRate)) updateData.goldToMaxRate = Number(goldToMaxRate);

        const config = await prisma.systemConfig.upsert({
            where: { id: "GLOBAL" },
            update: updateData,
            create: { id: "GLOBAL", ...updateData, maintenanceMode: maintenanceMode || false, goldToMaxRate: goldToMaxRate || 1250 }
        });

        res.json({ success: true, data: config });
    } catch (error) {
        console.error('updateSystemConfig error:', error);
        res.status(500).json({ success: false, error: 'Failed to update config' });
    }
};
