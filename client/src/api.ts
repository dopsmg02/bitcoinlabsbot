const isProd = import.meta.env.PROD;
const API_URL = isProd ? '/api' : (import.meta.env.VITE_API_URL || 'http://3.236.147.88:3000/api');

class Api {
    private token: string | null = localStorage.getItem('jwt');

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('jwt', token);
    }

    getToken() {
        return this.token;
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const headers: any = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || response.statusText);
            }
            return data;
        } catch (e: any) {
            console.error(`API Error on ${endpoint}:`, e.message);
            throw e;
        }
    }

    async login(initDataRaw: string, referrerId?: string) {
        const res = await this.request('/auth/telegram', {
            method: 'POST',
            body: JSON.stringify({ initDataRaw, referrerId })
        });
        if (res.token) this.setToken(res.token);
        return res;
    }

    async getProfile() {
        return this.request('/user/profile');
    }

    async getReferrals() {
        return this.request('/user/referrals');
    }

    async getPlans() {
        return this.request('/investment/plans');
    }

    async invest(planId: string, amount: number) {
        return this.request('/investment/invest', {
            method: 'POST',
            body: JSON.stringify({ planId, amount })
        });
    }

    async getMyInvestments() {
        return this.request('/investment/my-investments');
    }

    async getTransactionHistory() {
        return this.request('/user/history');
    }

    async getAnnouncements(all = false) {
        return this.request(`/announcement${all ? '?all=true' : ''}`);
    }

    async spinLuckyWheel() {
        return this.request('/investment/lucky-spin', {
            method: 'POST'
        });
    }

    async requestWithdrawal(amount: number, walletAddress: string) {
        return this.request('/investment/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount, walletAddress })
        });
    }

    // --- ADMIN API ENDPOINTS ---

    async getAdminStats() {
        return this.request('/admin/stats');
    }

    async getAdminUsers(page = 1, limit = 50, search = '') {
        const query = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) query.append('search', search);
        return this.request(`/admin/users?${query.toString()}`);
    }

    async adminAdjustBalance(userId: string, amount: number, reason?: string) {
        return this.request(`/admin/users/${userId}/adjust`, {
            method: 'POST',
            body: JSON.stringify({ amount, reason })
        });
    }

    async adminGrantTickets(userId: string, amount: number) {
        return this.request(`/admin/users/${userId}/tickets`, {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
    }

    async adminToggleBan(userId: string, isBanned: boolean) {
        return this.request(`/admin/users/${userId}/ban`, {
            method: 'POST',
            body: JSON.stringify({ isBanned })
        });
    }

    // --- WITHDRAWAL MANAGEMENT ---

    async getAdminWithdrawals(status?: string) {
        const query = new URLSearchParams();
        if (status) query.append('status', status);
        return this.request(`/admin/withdrawals?${query.toString()}`);
    }

    async adminUpdateWithdrawalStatus(withdrawalId: string, status: 'COMPLETED' | 'REJECTED') {
        return this.request(`/admin/withdrawals/${withdrawalId}/status`, {
            method: 'POST',
            body: JSON.stringify({ status })
        });
    }
}

export const api = new Api();
