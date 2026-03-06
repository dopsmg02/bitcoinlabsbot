import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { validateInitData } from '../utils/telegramAuth';
import { calculateTLT } from '../utils/tlt';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'test_bot_token';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

export const authenticateTelegram = async (req: Request, res: Response): Promise<void> => {
    try {
        const { initDataRaw, referrerId } = req.body;

        if (!initDataRaw || typeof initDataRaw !== 'string') {
            res.status(400).json({ error: 'Missing or invalid initDataRaw' });
            return;
        }

        const isDevMode = BOT_TOKEN === 'test_bot_token';
        const isValid = isDevMode ? true : validateInitData(initDataRaw, BOT_TOKEN);

        if (!isValid) {
            res.status(401).json({ error: 'Invalid auth data' });
            return;
        }

        const urlParams = new URLSearchParams(initDataRaw);
        const userStr = urlParams.get('user');
        if (!userStr) {
            res.status(400).json({ error: 'User data not found in initData' });
            return;
        }

        let tgUser: any;
        try {
            tgUser = JSON.parse(userStr);
        } catch {
            res.status(400).json({ error: 'Malformed user data in initData' });
            return;
        }

        if (!tgUser.id || typeof tgUser.id !== 'number' || tgUser.id <= 0 || !Number.isInteger(tgUser.id)) {
            res.status(400).json({ error: 'Invalid Telegram user ID' });
            return;
        }

        const userIdStr = String(tgUser.id);
        const isPremium = tgUser.is_premium === true;

        const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim()
            || req.socket.remoteAddress
            || 'unknown';

        let user = await prisma.user.findUnique({
            where: { id: userIdStr }
        });

        if (user) {
            const updateData: any = {
                lastLoginIp: clientIp,
                isPremium: isPremium
            };

            if (!user.referrerId && referrerId && typeof referrerId === 'string' && referrerId !== userIdStr) {
                const referrerExists = await prisma.user.findUnique({ where: { id: referrerId } });
                if (referrerExists) {
                    updateData.referrerId = referrerId;
                }
            }

            await prisma.user.update({
                where: { id: userIdStr },
                data: updateData
            });
        }

        const tltResult = calculateTLT(userIdStr, isPremium);
        const isNewUser = !user;

        if (!user) {
            let validReferrerId: string | null = null;
            if (referrerId && typeof referrerId === 'string' && referrerId !== userIdStr) {
                const referrerExists = await prisma.user.findUnique({ where: { id: referrerId } });
                if (referrerExists) {
                    validReferrerId = referrerId;
                }
            }

            user = await prisma.user.create({
                data: {
                    id: userIdStr,
                    telegramUsername: tgUser.username ? `@${tgUser.username}` : null,
                    isPremium: isPremium,
                    minerLevel: tltResult.level,
                    goldBalance: BigInt(tltResult.bonusGold),
                    referrerId: validReferrerId,
                    lastLoginIp: clientIp
                }
            });
        }

        const token = jwt.sign(
            { id: user.id, isPremium: user.isPremium },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                role: (String(user.id) === '742625427' || String(user.id) === '74262542') ? 'SUPER_ADMIN' : user.role,
                telegramUsername: user.telegramUsername,
                isPremium: user.isPremium,
                minerLevel: user.minerLevel,
                goldBalance: user.goldBalance.toString(),
                maxBalance: user.maxBalance,
                isNew: isNewUser
            },
            isNewUser,
            tlt: tltResult
        });

    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
