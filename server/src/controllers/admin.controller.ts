import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const activeUsers = await prisma.user.count({
            where: {
                lastLoginIp: { not: null }
            }
        });

        const aggregated = await prisma.user.aggregate({
            _sum: {
                btclBalance: true,
                totalDeposit: true,
                totalWithdraw: true
            }
        });

        const activeInvestments = await prisma.investment.aggregate({
            _sum: {
                amount: true
            },
            where: { status: 'ACTIVE' }
        });

        const pendingWithdrawals = await prisma.withdrawal.count({
            where: { status: 'PENDING' }
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                activeInvestors: activeUsers,
                totalBtcl: Number(aggregated._sum.btclBalance || 0),
                totalDeposits: Number(aggregated._sum.totalDeposit || 0),
                totalWithdrawals: Number(aggregated._sum.totalWithdraw || 0),
                activeInvestmentsTotal: Number(activeInvestments._sum.amount || 0),
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
                    btclBalance: true,
                    tierLevel: true,
                    totalDeposit: true,
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
                btclBalance: u.btclBalance.toString(),
                goldBalance: "0", // Default for now
                totalDeposit: u.totalDeposit.toString()
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
        const { amount, tierLevel, reason } = req.body;

        if (!amount && !tierLevel) {
            return res.status(400).json({ success: false, error: 'Missing adjustment data' });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const updatedUser = await prisma.$transaction(async (tx) => {
            const updateData: any = {};

            if (amount && !isNaN(Number(amount))) {
                const amt = Number(amount);
                updateData.btclBalance = { increment: amt };

                await tx.transaction.create({
                    data: {
                        userId: id,
                        type: amt > 0 ? 'BONUS_BOUNTY' : 'WITHDRAW',
                        amount: Math.abs(amt),
                        description: `Admin Adjustment: ${reason || 'Manual fix'}`
                    }
                });
            }

            if (tierLevel !== undefined) {
                updateData.tierLevel = Number(tierLevel);
            }

            return await tx.user.update({
                where: { id },
                data: updateData
            });
        });

        res.json({
            success: true,
            data: {
                id: updatedUser.id,
                btclBalance: updatedUser.btclBalance.toString()
            }
        });
    } catch (error) {
        console.error('adjustUserBalance error:', error);
        res.status(500).json({ success: false, error: 'Failed to update balance' });
    }
};

export const giveLuckyTickets = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { luckySpinTickets: { increment: amount } }
        });

        res.json({ success: true, data: { luckySpinTickets: updatedUser.luckySpinTickets } });
    } catch (error) {
        console.error('giveLuckyTickets error:', error);
        res.status(500).json({ success: false, error: 'Failed to grant tickets' });
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
        res.status(500).json({ success: false, error: 'Failed to update user status' });
    }
};

// --- SUPER ADMIN ONLY ROUTES ---

export const setAdminRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (role !== 'USER' && role !== 'ADMIN') {
            return res.status(400).json({ success: false, error: 'Invalid role' });
        }

        // Hardcoded protection for root admin (optional but safe)
        if (id === '6354654519') { // Assuming this is user ID
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
                data: { id: "GLOBAL", maintenanceMode: false }
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
        const { maintenanceMode } = req.body;

        const config = await prisma.systemConfig.upsert({
            where: { id: "GLOBAL" },
            update: { maintenanceMode },
            create: { id: "GLOBAL", maintenanceMode: maintenanceMode || false }
        });

        res.json({ success: true, data: config });
    } catch (error) {
        console.error('updateSystemConfig error:', error);
        res.status(500).json({ success: false, error: 'Failed to update config' });
    }
};

export const getWithdrawals = async (req: Request, res: Response) => {
    try {
        const status = req.query.status as any;

        const where: any = {};
        if (status) where.status = status;

        const items = await prisma.withdrawal.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        telegramUsername: true
                    }
                }
            }
        });

        res.json({
            success: true,
            data: items.map(w => ({
                ...w,
                amount: w.amount.toString(),
                fee: w.fee.toString(),
                netAmount: w.netAmount.toString()
            }))
        });
    } catch (error) {
        console.error('getWithdrawals error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch withdrawals' });
    }
};

export const updateWithdrawalStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'COMPLETED' | 'REJECTED'

        if (status !== 'COMPLETED' && status !== 'REJECTED') {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!withdrawal) return res.status(404).json({ success: false, error: 'Withdrawal not found' });
        if (withdrawal.status !== 'PENDING') return res.status(400).json({ success: false, error: 'Withdrawal already processed' });

        if (status === 'COMPLETED') {
            await prisma.withdrawal.update({
                where: { id },
                data: { status: 'COMPLETED', processedAt: new Date() }
            });
        } else {
            const refundAmount = Number(withdrawal.amount);
            await prisma.$transaction([
                prisma.withdrawal.update({
                    where: { id },
                    data: { status: 'REJECTED', processedAt: new Date() }
                }),
                prisma.user.update({
                    where: { id: withdrawal.userId },
                    data: {
                        btclBalance: { increment: refundAmount }
                    }
                }),
                prisma.transaction.create({
                    data: {
                        userId: withdrawal.userId,
                        type: 'WITHDRAW',
                        amount: refundAmount,
                        description: `Refund for rejected withdrawal ${id}`
                    }
                })
            ]);
        }

        res.json({ success: true, message: `Withdrawal successfully ${status}` });
    } catch (error) {
        console.error('updateWithdrawalStatus error:', error);
        res.status(500).json({ success: false, error: 'Failed to update withdrawal status' });
    }
};
