import { Telegraf, Markup } from 'telegraf';
import { prisma } from '../prisma/client';
import { calculateLoyaltyTier } from '../utils/tlt';

export class BotService {
    private bot: Telegraf;

    constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            console.error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
            throw new Error('Missing TELEGRAM_BOT_TOKEN');
        }
        this.bot = new Telegraf(token);
    }

    public async init() {
        // Handle /start command
        this.bot.start(async (ctx) => {
            try {
                const tgId = ctx.from.id.toString();
                const startParam = ctx.payload; // This is the 'start' parameter (e.g. 742625427)
                const username = ctx.from.username || ctx.from.first_name || 'Partner';

                console.log(`[BOT] User ${tgId} (${username}) started bot with param: ${startParam || 'NONE'}`);

                // 1. Check if user already exists
                let user = await prisma.user.findUnique({
                    where: { id: tgId }
                });

                const isPremium = ctx.from.is_premium || false;
                const { welcomeBonus, tierName } = calculateLoyaltyTier(tgId, isPremium);

                if (!user) {
                    // Referral linkage
                    let validReferrerId: string | null = null;
                    if (startParam && startParam !== tgId) {
                        const referrerExists = await prisma.user.findUnique({ where: { id: startParam } });
                        if (referrerExists) {
                            validReferrerId = startParam;
                        }
                    }

                    // 3. Create user from Bot API
                    user = await prisma.user.create({
                        data: {
                            id: tgId,
                            telegramUsername: ctx.from.username ? `@${ctx.from.username}` : null,
                            isPremium: isPremium,
                            btclBalance: welcomeBonus,
                            tierLevel: 1,
                            referrerId: validReferrerId,
                            transactions: {
                                create: {
                                    type: 'BONUS_BOUNTY',
                                    amount: welcomeBonus,
                                    description: `Welcome Bonus for ${tierName} tier`
                                }
                            }
                        }
                    });

                    console.log(`[BOT] User ${tgId} registered with $${welcomeBonus} bonus.`);
                } else {
                    // Late Binding Logic
                    if (!user.referrerId && startParam && startParam !== tgId) {
                        const referrerExists = await prisma.user.findUnique({ where: { id: startParam } });
                        if (referrerExists) {
                            await prisma.user.update({
                                where: { id: tgId },
                                data: { referrerId: startParam }
                            });
                            console.log(`[BOT] Late Binding: User ${tgId} linked to referrer ${startParam}`);
                        }
                    }
                }

                // 5. Send Welcome Message with Mini App Button
                const webAppUrl = (process.env.FRONTEND_URL || 'https://bitcoinlabsbot.vercel.app').trim();
                const logoUrl = `${webAppUrl}/logo.png`;

                await ctx.replyWithPhoto(
                    logoUrl,
                    {
                        caption:
                            `<b>WELCOME TO BITCOIN LABS, ${username.toUpperCase()}!</b>\n\n` +
                            `🎖 <b>ACCOUNT TIER:</b> ${tierName.toUpperCase()}\n` +
                            `💰 <b>STARTING BONUS:</b> $${welcomeBonus.toFixed(2)} USDT\n\n` +
                            `<i>Bitcoin Labs is your premier destination for institutional-grade crypto investments. Start your journey today.</i>`,
                        parse_mode: 'HTML',
                        ...Markup.inlineKeyboard([
                            [Markup.button.webApp('🚀 OPEN DASHBOARD', webAppUrl)]
                        ])
                    }
                ).catch((err) => {
                    console.error('[BOT PHOTO ERROR]', err.message);
                    // Fallback if image fails
                    ctx.reply(
                        `<b>WELCOME TO BITCOIN LABS, ${username.toUpperCase()}!</b>\n\n` +
                        `🎖 <b>ACCOUNT TIER:</b> ${tierName.toUpperCase()}\n` +
                        `💰 <b>STARTING BONUS:</b> $${welcomeBonus.toFixed(2)} USDT\n\n` +
                        `<a href="${webAppUrl}">🚀 OPEN DASHBOARD</a>`,
                        { parse_mode: 'HTML' }
                    );
                });

            } catch (error) {
                console.error('[BOT ERROR]', error);
            }
        });

        // Launch the bot
        this.bot.launch().then(() => {
            console.log('[BOT] Telegram Bot Service is online!');
        }).catch((err) => {
            console.error('[BOT] Failed to launch:', err);
        });

        // Enable graceful stop
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}

export const botService = new BotService();
