import { prisma } from '../prisma/client';

/**
 * ROI Distribution Worker
 * This service runs periodically to distribute daily profits
 * from active investments to user balances.
 */
export const distributeDailyRoi = async () => {
    console.log('[ROI Worker] Starting ROI distribution check...');

    try {
        const now = new Date();
        const activeInvestments = await prisma.investment.findMany({
            where: {
                status: 'ACTIVE',
                endDate: { gte: now },
                // Only fetch those that haven't been processed in at least 23.5 hours
                // giving some buffer for the hourly interval
                lastRoiAt: {
                    lt: new Date(now.getTime() - (23.5 * 60 * 60 * 1000))
                }
            }
        });

        if (activeInvestments.length === 0) {
            console.log('[ROI Worker] No pending ROI distributions found.');
        } else {
            console.log(`[ROI Worker] Found ${activeInvestments.length} pending distributions.`);
        }

        for (const inv of activeInvestments) {
            const roiAmount = Number(inv.dailyRoi);

            try {
                await prisma.$transaction(async (tx) => {
                    // 1. Update User Balance
                    await tx.user.update({
                        where: { id: inv.userId },
                        data: { btclBalance: { increment: roiAmount } }
                    });

                    // 2. Update Investment's total earned and lastRoiAt
                    await tx.investment.update({
                        where: { id: inv.id },
                        data: {
                            totalEarned: { increment: roiAmount },
                            lastRoiAt: now
                        }
                    });

                    // 3. Create Transaction Record
                    await tx.transaction.create({
                        data: {
                            userId: inv.userId,
                            type: 'ROI_DAILY',
                            amount: roiAmount,
                            description: `Daily ROI payout`
                        }
                    });
                });
                console.log(`[ROI Worker] Distributed $${roiAmount} to user ${inv.userId} for investment ${inv.id.substring(0, 8)}`);
            } catch (err) {
                console.error(`[ROI Worker] Transaction failed for inv ${inv.id}:`, err);
            }
        }

        // Auto-complete expired investments
        const expired = await prisma.investment.updateMany({
            where: {
                status: 'ACTIVE',
                endDate: { lt: now }
            },
            data: { status: 'COMPLETED' }
        });

        if (expired.count > 0) {
            console.log(`[ROI Worker] Marked ${expired.count} investments as COMPLETED.`);
        }

        console.log('[ROI Worker] Check finished.');
    } catch (error) {
        console.error('[ROI Worker] Critical error during distribution:', error);
    }
};

/**
 * Start the ROI distribution worker
 */
export const startRoiDistributionWorker = () => {
    console.log('[ROI Worker] Service initialized. Running every 60 minutes.');

    // Initial run
    distributeDailyRoi();

    // Set interval to run every hour
    setInterval(() => {
        distributeDailyRoi();
    }, 60 * 60 * 1000);
};
