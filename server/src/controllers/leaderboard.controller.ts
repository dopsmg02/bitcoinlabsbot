import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

const leaderboardCache: Record<string, { data: any[], timestamp: number }> = {};
const CACHE_TTL = 30000; // 30 seconds

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { type = 'GOLD' } = req.query as { type: string };

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const now = Date.now();
        let topUsers: any[] = [];
        let userRank = 0;

        // 1. Get Top Users (Cached)
        if (leaderboardCache[type] && (now - leaderboardCache[type].timestamp < CACHE_TTL)) {
            topUsers = leaderboardCache[type].data;
        } else {
            if (type === 'GOLD') {
                topUsers = await prisma.user.findMany({
                    where: { isBanned: false },
                    orderBy: { goldBalance: 'desc' },
                    take: 50,
                    select: { id: true, telegramUsername: true, goldBalance: true }
                });
            } else if (type === 'MAX') {
                topUsers = await prisma.user.findMany({
                    where: { isBanned: false },
                    orderBy: { maxBalance: 'desc' },
                    take: 50,
                    select: { id: true, telegramUsername: true, maxBalance: true }
                });
            } else if (type === 'REFERRAL') {
                topUsers = await prisma.user.findMany({
                    where: { isBanned: false },
                    orderBy: { referralCount: 'desc' },
                    take: 50,
                    select: { id: true, telegramUsername: true, referralCount: true }
                });
            } else if (type === 'AD') {
                topUsers = await prisma.user.findMany({
                    where: { isBanned: false },
                    orderBy: { weeklyMiningCount: 'desc' },
                    take: 50,
                    select: { id: true, telegramUsername: true, weeklyMiningCount: true }
                });
            }

            leaderboardCache[type] = { data: topUsers, timestamp: now };
        }

        // 2. Get User Rank (Real-time but indexed)
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        if (currentUser) {
            if (type === 'GOLD') {
                const betterUsers = await prisma.user.count({
                    where: { goldBalance: { gt: currentUser.goldBalance }, isBanned: false }
                });
                userRank = betterUsers + 1;
            } else if (type === 'MAX') {
                const betterUsers = await prisma.user.count({
                    where: { maxBalance: { gt: currentUser.maxBalance }, isBanned: false }
                });
                userRank = betterUsers + 1;
            } else if (type === 'REFERRAL') {
                const betterUsers = await prisma.user.count({
                    where: { referralCount: { gt: currentUser.referralCount }, isBanned: false }
                });
                userRank = betterUsers + 1;
            } else if (type === 'AD') {
                const betterUsers = await prisma.user.count({
                    where: { weeklyMiningCount: { gt: currentUser.weeklyMiningCount }, isBanned: false }
                });
                userRank = betterUsers + 1;
            }
        }

        const formatUser = (u: any) => {
            let username = u.telegramUsername || `Miner_${u.id.substring(0, 4)}`;
            if (u.telegramUsername && !username.startsWith('@')) {
                username = `@${username}`;
            }
            return {
                id: u.id,
                username,
                goldBalance: u.goldBalance ? u.goldBalance.toString() : undefined,
                maxBalance: u.maxBalance ? Number(u.maxBalance) : undefined,
                referralCount: u.referralCount,
                weeklyMiningCount: u.weeklyMiningCount
            };
        };

        res.status(200).json({
            success: true,
            topUsers: topUsers.map(formatUser),
            userRank
        });

    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
