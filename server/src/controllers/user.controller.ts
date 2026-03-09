import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const profile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                telegramUsername: true,
                role: true,
                btclBalance: true,
                tierLevel: true,
                totalDeposit: true,
                totalWithdraw: true,
                totalReferralBonus: true,
                luckySpinTickets: true,
                createdAt: true,
                investments: {
                    where: { status: 'ACTIVE' },
                    select: { amount: true }
                }
            }
        });

        if (!profile) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const activeInvestmentTotal = profile.investments.reduce((acc, inv) => acc + Number(inv.amount), 0);

        res.status(200).json({
            success: true,
            data: {
                id: profile.id,
                telegramUsername: profile.telegramUsername,
                role: profile.role,
                btclBalance: profile.btclBalance.toString(),
                goldBalance: "0",
                tierLevel: profile.tierLevel,
                totalDeposit: profile.totalDeposit.toString(),
                totalWithdraw: profile.totalWithdraw.toString(),
                totalReferralBonus: profile.totalReferralBonus.toString(),
                activeInvestmentTotal: activeInvestmentTotal.toString(),
                luckySpinTickets: profile.luckySpinTickets,
                joinedAt: profile.createdAt
            }
        });
    } catch (error) {
        console.error('Profile Fetch Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getReferrals = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // 5-Level Referral Logic (Salvaged from original)
        const level1Users = await prisma.user.findMany({
            where: { referrerId: userId },
            select: { id: true, telegramUsername: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });

        const usersByLevel: any[][] = [level1Users, [], [], [], []];
        for (let i = 0; i < 4; i++) {
            const parentIds = usersByLevel[i].map((u: any) => u.id);
            if (parentIds.length === 0) break;
            usersByLevel[i + 1] = await prisma.user.findMany({
                where: { referrerId: { in: parentIds } },
                select: { id: true, telegramUsername: true, createdAt: true },
                orderBy: { createdAt: 'desc' }
            });
        }

        const formatUser = (u: any) => ({
            username: u.telegramUsername ? `${u.telegramUsername}` : `User_${String(u.id).substring(0, 4)}`,
            joinedAt: u.createdAt
        });

        res.status(200).json({
            success: true,
            data: {
                level1: usersByLevel[0].map(formatUser),
                level2: usersByLevel[1].map(formatUser),
                level3: usersByLevel[2].map(formatUser),
                level4: usersByLevel[3].map(formatUser),
                level5: usersByLevel[4].map(formatUser),
                stats: {
                    totalLevel1: usersByLevel[0].length,
                    totalLevel2: usersByLevel[1].length,
                    totalLevel3: usersByLevel[2].length,
                    totalLevel4: usersByLevel[3].length,
                    totalLevel5: usersByLevel[4].length,
                    totalNetwork: usersByLevel.reduce((acc, lvl) => acc + lvl.length, 0)
                }
            }
        });
    } catch (error) {
        console.error('Referral Fetch Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.status(200).json({
            success: true,
            data: transactions.map(tx => ({
                ...tx,
                amount: tx.amount.toString()
            }))
        });
    } catch (error) {
        console.error('Transaction Fetch Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
