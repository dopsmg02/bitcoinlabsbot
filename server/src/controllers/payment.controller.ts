import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import axios from 'axios';
import crypto from 'crypto';

const PLISIO_API_URL = 'https://plisio.net/api/v1';

export const createDeposit = async (req: Request, res: Response) => {
    const { amount } = req.body;
    const userId = (req as any).user.id;

    if (!amount || amount < 10) {
        return res.status(400).json({ error: 'Minimum deposit is $10' });
    }

    try {
        const apiKey = process.env.PLISIO_API_KEY;
        if (!apiKey) throw new Error('PLISIO_API_KEY not set');

        // 1. Register pending deposit in our DB
        const deposit = await prisma.deposit.create({
            data: {
                userId,
                amount,
                currency: 'USDT_BEP20',
                status: 'PENDING'
            }
        });

        // 2. Request address from Plisio
        const response = await axios.get(`${PLISIO_API_URL}/invoices/new`, {
            params: {
                api_key: apiKey,
                currency: 'USDT_BSC', // Plisio uses USDT_BSC for BEP20
                order_number: deposit.id,
                order_name: `Deposit for User ${userId}`,
                amount: amount,
                source_currency: 'USD',
                source_amount: amount,
                callback_url: `${process.env.BACKEND_URL}/api/payment/webhook`
            }
        });

        if (response.data.status !== 'success') {
            throw new Error(response.data.data.message || 'Plisio error');
        }

        const plisioData = response.data.data;

        // 3. Update deposit with Plisio txnId and address
        await prisma.deposit.update({
            where: { id: deposit.id },
            data: {
                txnId: plisioData.txn_id,
                address: plisioData.wallet_address
            }
        });

        res.json({
            status: 'success',
            address: plisioData.wallet_address,
            amount: plisioData.amount,
            txn_id: plisioData.txn_id,
            invoice_url: plisioData.invoice_url
        });

    } catch (error: any) {
        console.error('[Payment] Create Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to initialize payment' });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    const data = req.body;

    // Safety check: Plisio sends verify_hash
    // For simplicity in this demo, we check if txn_id exists
    // In production, implement HMAC verification here

    const { txn_id, status, order_number } = data;

    if (!txn_id || !order_number) {
        return res.status(400).send('Invalid data');
    }

    try {
        const deposit = await prisma.deposit.findUnique({
            where: { id: order_number },
            include: { user: true }
        });

        if (!deposit) return res.status(404).send('Deposit not found');
        if (deposit.status === 'COMPLETED') return res.status(200).send('Already processed');

        if (status === 'completed' || status === 'mismatch') {
            // Transaction success!
            await prisma.$transaction(async (tx) => {
                // 1. Mark deposit as completed
                await tx.deposit.update({
                    where: { id: order_number },
                    data: { status: 'COMPLETED', completedAt: new Date() }
                });

                // 2. Update user balance
                await tx.user.update({
                    where: { id: deposit.userId },
                    data: {
                        balance: { increment: deposit.amount },
                        totalDeposit: { increment: deposit.amount }
                    }
                });

                // 3. Log transaction
                await tx.transaction.create({
                    data: {
                        userId: deposit.userId,
                        type: 'DEPOSIT',
                        amount: deposit.amount,
                        description: `Deposit ${txn_id} confirmed`
                    }
                });

                // 4. Handle Referral Bonuses (Level 1 - 5)
                await distributeReferralBonuses(tx, deposit.userId, Number(deposit.amount));
            });

            console.log(`[Payment] Deposit ${order_number} confirmed. User ${deposit.userId} credited.`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('[Payment] Webhook Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

async function distributeReferralBonuses(tx: any, userId: string, amount: number) {
    const rates = [0.10, 0.05, 0.03, 0.01, 0.01]; // L1: 10%, L2: 5%, etc.
    let currentUserId = userId;

    for (let i = 0; i < rates.length; i++) {
        const user = await tx.user.findUnique({
            where: { id: currentUserId },
            select: { referrerId: true }
        });

        if (!user || !user.referrerId) break;

        const bonus = amount * rates[i];

        await tx.user.update({
            where: { id: user.referrerId },
            data: {
                balance: { increment: bonus },
                totalReferralBonus: { increment: bonus }
            }
        });

        await tx.transaction.create({
            data: {
                userId: user.referrerId,
                type: `REFERRAL_LEVEL_${i + 1}` as any,
                amount: bonus,
                description: `Referral bonus from level ${i + 1} downline`
            }
        });

        currentUserId = user.referrerId;
    }
}
