import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { validateInitData } from '../utils/telegramAuth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'test_bot_token';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

// Simple Welcome Bonus for HYIP
const WELCOME_BONUS = 0.50; // $0.50 welcome bonus

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
        try { tgUser = JSON.parse(userStr); } catch {
            res.status(400).json({ error: 'Malformed user data in initData' });
            return;
        }

        if (!tgUser.id || typeof tgUser.id !== 'number' || tgUser.id <= 0 || !Number.isInteger(tgUser.id)) {
            res.status(400).json({ error: 'Invalid Telegram user ID' });
            return;
        }

        const userIdStr = String(tgUser.id);
        const isPremium = tgUser.is_premium === true;

        const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
            || req.socket.remoteAddress
            || 'unknown';

        let user = await prisma.user.findUnique({
            where: { id: userIdStr }
        });

        const isNewUser = !user;

        if (user) {
            const updateData: any = {
                lastLoginIp: clientIp,
                isPremium: isPremium
            };
            
            // Referral linking for existing users who didn't have a referrer before
            if (!user.referrerId && referrerId && typeof referrerId === 'string' && referrerId !== userIdStr) {
                const referrerExists = await prisma.user.findUnique({ where: { id: referrerId } });
                if (referrerExists) {
                    updateData.referrerId = referrerId;
                }
            }
            
            user = await prisma.user.update({
                where: { id: userIdStr },
                data: updateData
            });
        } else {
            // Create New User
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
                    balance: WELCOME_BONUS,
                    referrerId: validReferrerId,
                    lastLoginIp: clientIp,
                    transactions: {
                        create: {
                            type: 'BONUS_BOUNTY',
                            amount: WELCOME_BONUS,
                            description: 'Welcome Bonus for joining!'
                        }
                    }
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
                role: user.role,
                telegramUsername: user.telegramUsername,
                isPremium: user.isPremium,
                balance: user.balance.toString(),
                totalDeposit: user.totalDeposit.toString(),
                isNew: isNewUser
            },
            isNewUser
        });

    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
