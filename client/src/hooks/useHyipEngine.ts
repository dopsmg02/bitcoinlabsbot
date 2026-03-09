import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useHyipEngine(onNotify?: (type: 'success' | 'error' | 'info', message: string) => void) {
    const [isInitializing, setIsInitializing] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [myInvestments, setMyInvestments] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [initError, setInitError] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const init = useCallback(async () => {
        try {
            const tg = (window as any).Telegram?.WebApp;
            const initDataRaw = tg?.initData;
            const referrerId = tg?.initDataUnsafe?.start_param;

            if (!initDataRaw) {
                console.warn("Unauthorized access: Not in Telegram environment.");
                setIsInitializing(false);
                return;
            }

            const loginRes = await api.login(initDataRaw, referrerId);
            if (!loginRes.success) {
                setInitError(loginRes.error || "Login failed");
                return;
            }

            await refreshAll();

            if (tg?.ready) tg.ready();
        } catch (e: any) {
            console.error("Initialization failed:", e);
            setInitError(e.message || "Network Error");
        } finally {
            setIsInitializing(false);
        }
    }, [onNotify]);

    const refreshAll = async () => {
        try {
            const [profRes, plansRes, invRes, histRes] = await Promise.all([
                api.getProfile(),
                api.getPlans(),
                api.getMyInvestments(),
                api.getTransactionHistory()
            ]);

            if (profRes.success) setProfile(profRes.data);
            if (plansRes.success) setPlans(plansRes.data);
            if (invRes.success) setMyInvestments(invRes.data);
            if (histRes.success) setHistory(histRes.data);
        } catch (e) {
            console.error("Refresh Error:", e);
        }
    };

    useEffect(() => {
        init();
    }, [init]);

    const invest = async (planId: string, amount: number) => {
        setIsActionLoading(true);
        try {
            const res = await api.invest(planId, amount);
            if (res.success) {
                if (onNotify) onNotify('success', 'Investment successful!');
                await refreshAll();
                return true;
            }
        } catch (e: any) {
            if (onNotify) onNotify('error', e.message || 'Investment failed');
        } finally {
            setIsActionLoading(false);
        }
        return false;
    };

    const spinWheel = async () => {
        setIsActionLoading(true);
        try {
            const res = await api.spinLuckyWheel();
            if (res.success) {
                if (onNotify) onNotify('success', res.data.message);
                await refreshAll();
                return res.data;
            }
        } catch (e: any) {
            if (onNotify) onNotify('error', e.message || 'Spin failed');
        } finally {
            setIsActionLoading(false);
        }
        return null;
    };

    const deposit = async (amount: number) => {
        setIsActionLoading(true);
        try {
            const res = await api.createDeposit(amount);
            if (res.status === 'success' && res.invoice_url) {
                if (onNotify) onNotify('success', 'Redirecting to payment gateway...');
                window.location.href = res.invoice_url;
                return true;
            }
            throw new Error('Failed to parse invoice response');
        } catch (e: any) {
            if (onNotify) onNotify('error', e.message || 'Deposit initialization failed');
        } finally {
            setIsActionLoading(false);
        }
        return false;
    };

    const withdraw = async (amount: number, address: string) => {
        setIsActionLoading(true);
        try {
            const res = await api.requestWithdrawal(amount, address);
            if (res.success) {
                if (onNotify) onNotify('success', res.message);
                await refreshAll();
                return true;
            }
        } catch (e: any) {
            if (onNotify) onNotify('error', e.message || 'Withdrawal failed');
        } finally {
            setIsActionLoading(false);
        }
        return false;
    };

    /**
     * DEVELOPMENT ONLY: Simulates a login for testing on localhost.
     */
    const simulateDevLogin = async () => {
        if (window.location.hostname !== 'localhost') return;
        try {
            const mockUser = { id: 28491022, username: 'dev_user', is_premium: true };
            const initDataRaw = `user=${JSON.stringify(mockUser)}&auth_date=${Math.floor(Date.now() / 1000)}&hash=dev_bypass`;
            await api.login(initDataRaw);
            await refreshAll();
        } catch (e) {
            console.error("Mock Login Failed:", e);
        }
    };

    return {
        isInitializing,
        profile,
        plans,
        myInvestments,
        history,
        initError,
        isActionLoading,
        refreshAll,
        invest,
        spinWheel,
        deposit,
        withdraw,
        simulateDevLogin
    };
}
