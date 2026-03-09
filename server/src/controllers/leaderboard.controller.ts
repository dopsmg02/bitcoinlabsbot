import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { type = 'GOLD' } = req.query;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        let topUsers: any[] = [];
        let userRank = 0;

        if (type === 'GOLD') {
            topUsers = await prisma.user.findMany({
                where: { isBanned: false },
                orderBy: { goldBalance: 'desc' },
                take: 50,
                select: {
                    id: true,
                    telegramUsername: true,
                    goldBalance: true,
                }
            });

            // Find user rank
            const betterUsers = await prisma.user.count({
                where: {
                    goldBalance: { gt: (await prisma.user.findUnique({ where: { id: userId } }))?.goldBalance || 0 },
                    isBanned: false
                }
            });
            userRank = betterUsers + 1;

        } else if (type === 'MAX') {
            topUsers = await prisma.user.findMany({
                where: { isBanned: false },
                orderBy: { maxBalance: 'desc' },
                take: 50,
                select: {
                    id: true,
                    telegramUsername: true,
                    maxBalance: true,
                }
            });

            // Find user rank
            const betterUsers = await prisma.user.count({
                where: {
                    maxBalance: { gt: (await prisma.user.findUnique({ where: { id: userId } }))?.maxBalance || 0 },
                    isBanned: false
                }
            });
            userRank = betterUsers + 1;

        } else if (type === 'REFERRAL') {
            const result: any[] = await prisma.$queryRaw`
                SELECT "referrerId", COUNT(*) as count
                FROM "User"
                WHERE "referrerId" IS NOT NULL
                GROUP BY "referrerId"
                ORDER BY count DESC
                LIMIT 50
            `;

            const topIds = result.map(r => r.referrerId);
            const users = await prisma.user.findMany({
                where: { id: { in: topIds } },
                select: { id: true, telegramUsername: true }
            });

            topUsers = result.map(r => {
                const user = users.find(u => u.id === r.referrerId);
                return {
                    id: r.referrerId,
                    telegramUsername: user?.telegramUsername,
                    count: Number(r.count)
                };
            }).sort((a, b) => b.count - a.count);

            const userRefCount = await prisma.user.count({ where: { referrerId: userId } });
            const betterResult: any[] = await prisma.$queryRaw`
                SELECT "referrerId", COUNT(*) as count
                FROM "User"
                WHERE "referrerId" IS NOT NULL
                GROUP BY "referrerId"
                HAVING COUNT(*) > ${userRefCount}
            `;
            userRank = betterResult.length + 1;

        } else if (type === 'AD') {
            topUsers = await prisma.user.findMany({
                where: { isBanned: false },
                orderBy: { weeklyMiningCount: 'desc' },
                take: 50,
                select: {
                    id: true,
                    telegramUsername: true,
                    weeklyMiningCount: true,
                }
            });

            // Find user rank
            const betterUsers = await prisma.user.count({
                where: {
                    weeklyMiningCount: { gt: (await prisma.user.findUnique({ where: { id: userId } }))?.weeklyMiningCount || 0 },
                    isBanned: false
                }
            });
            userRank = betterUsers + 1;
        }

        const formatUser = (u: any) => {
            let username = u.telegramUsername || `Miner_${u.id.substring(0, 4)}`;
            if (u.telegramUsername && !username.startsWith('@')) {
                username = `@${username}`;
            }
            return {
                ...u,
                username,
                goldBalance: u.goldBalance ? u.goldBalance.toString() : undefined,
                maxBalance: u.maxBalance ? Number(u.maxBalance) : undefined,
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
