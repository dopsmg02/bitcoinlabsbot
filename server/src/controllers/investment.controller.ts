import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

export const getPlans = async (req: Request, res: Response): Promise<void> => {
    try {
        const plans = await prisma.plan.findMany({
            where: { active: true },
            orderBy: { minAmount: 'asc' }
        });

        res.status(200).json({
            success: true,
            data: plans.map(p => ({
                ...p,
                minAmount: p.minAmount.toString(),
                maxAmount: p.maxAmount.toString(),
                dailyRoiPercent: p.dailyRoiPercent.toString()
            }))
        });
    } catch (error) {
        console.error('Fetch Plans Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const investInPlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { planId, amount } = req.body;

        if (!userId || !planId || !amount) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan || !plan.active) {
            res.status(404).json({ error: 'Plan not found or inactive' });
            return;
        }

        const amt = Number(amount);
        if (amt < Number(plan.minAmount) || amt > Number(plan.maxAmount)) {
            res.status(400).json({ error: `Amount must be between ${plan.minAmount} and ${plan.maxAmount}` });
            return;
        }

        // Transactional Investment Logic
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user || Number(user.balance) < amt) {
                throw new Error('Insufficient balance');
            }

            // Deduct balance
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: amt } }
            });

            // Create Transaction Record
            await tx.transaction.create({
                data: {
                    userId,
                    type: 'INVESTMENT',
                    amount: amt,
                    description: `Invested in ${plan.name} Plan`
                }
            });

            // Create Investment
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.durationDays);

            const dailyRoiAmount = (amt * Number(plan.dailyRoiPercent)) / 100;

            const investment = await tx.investment.create({
                data: {
                    userId,
                    planId,
                    amount: amt,
                    dailyRoi: dailyRoiAmount,
                    endDate,
                    status: 'ACTIVE'
                }
            });

            return investment;
        });

        res.status(200).json({
            success: true,
            message: 'Investment successful',
            data: result
        });

    } catch (error: any) {
        console.error('Investment Error:', error);
        res.status(400).json({ error: error.message || 'Internal Server Error' });
    }
};

export const getMyInvestments = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const investments = await prisma.investment.findMany({
            where: { userId },
            include: { plan: true },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: investments.map(inv => ({
                ...inv,
                amount: inv.amount.toString(),
                dailyRoi: inv.dailyRoi.toString(),
                totalEarned: inv.totalEarned.toString(),
                planName: inv.plan.name
            }))
        });
    } catch (error) {
        console.error('Fetch My Investments Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const luckySpin = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user || user.luckySpinTickets < 1) {
                throw new Error('No tickets available');
            }

            // Consume ticket
            await tx.user.update({
                where: { id: userId },
                data: { luckySpinTickets: { decrement: 1 } }
            });

            // Randomize Prize (Wait to Earn style)
            // 80% small bonus, 15% medium, 5% jackpot
            const rand = Math.random() * 100;
            let winAmount = 0;
            let message = "";

            if (rand < 5) { // Jackpot
                winAmount = 50.00;
                message = "🔥 JACKPOT! You won $50.00!";
            } else if (rand < 20) { // Medium
                winAmount = 5.00;
                message = "🌟 Big Win! You won $5.00!";
            } else { // Small
                winAmount = 0.50;
                message = "👍 Nice! You won $0.50!";
            }

            // Grant win
            await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: winAmount } }
            });

            await tx.transaction.create({
                data: {
                    userId,
                    type: 'LUCKY_SPIN',
                    amount: winAmount,
                    description: `Won from Lucky Wheel: ${message}`
                }
            });

            return { winAmount, message };
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Spin failed' });
    }
};

export const requestWithdrawal = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { amount, walletAddress } = req.body;

        if (!userId || !amount || !walletAddress) {
            res.status(400).json({ error: 'Missing parameters' });
            return;
        }

        const amt = Number(amount);
        if (amt < 10) {
            res.status(400).json({ error: 'Minimum withdrawal is $10.00' });
            return;
        }

        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user || Number(user.balance) < amt) {
                throw new Error('Insufficient balance');
            }

            // Deduct immediately
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: amt } }
            });

            // Create Pending Withdrawal
            // Fee logic (e.g. 2% or flat $1)
            const fee = 1.00;
            const net = amt - fee;

            await tx.withdrawal.create({
                data: {
                    userId,
                    amount: amt,
                    fee: fee,
                    netAmount: net,
                    walletAddress,
                    status: 'PENDING'
                }
            });

            await tx.transaction.create({
                data: {
                    userId,
                    type: 'WITHDRAW',
                    amount: amt,
                    description: `Withdraw request to ${walletAddress}`
                }
            });
        });

        res.status(200).json({
            success: true,
            message: 'Withdrawal request submitted for review'
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Withdrawal failed' });
    }
};

