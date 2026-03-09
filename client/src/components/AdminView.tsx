import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Activity, Settings, Search, Edit3, UserX, UserCheck, ShieldPlus, ArrowLeft, Coins, Gem, ShieldAlert, Loader2, PlayCircle } from 'lucide-react';
import { api } from '../api';

interface AdminViewProps {
    onClose: () => void;
    userRole: string;
    onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onClose, userRole, onNotify }) => {
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'PAYOUTS' | 'SETTINGS' | 'NEWS'>('DASHBOARD');
    const [stats, setStats] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);

    // User State
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(false);

    // Withdrawal State
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);

    // Modal State
    const [editingUser, setEditingUser] = useState<any>(null);
    const [adjustType, setAdjustType] = useState<'GOLD' | 'MAX'>('GOLD');
    const [adjustAmount, setAdjustAmount] = useState('');
    const [newLevel, setNewLevel] = useState('');

    // Announcement Management 
    const [newNewsText, setNewNewsText] = useState('');
    const [newNewsType, setNewNewsType] = useState('INFO');
    const [loadingNews, setLoadingNews] = useState(false);

    useEffect(() => {
        loadStats();
        if (userRole === 'SUPER_ADMIN') {
            loadConfig();
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'USERS') {
            loadUsers(page, searchQuery);
        } else if (activeTab === 'PAYOUTS') {
            loadWithdrawals(page);
        } else if (activeTab === 'SETTINGS') {
            loadConfig();
        } else if (activeTab === 'NEWS') {
            loadNews();
        }
    }, [activeTab, page]);

    const loadStats = async () => {
        try {
            const res = await api.getAdminStats();
            if (res.success) setStats(res.data);
        } catch (e: any) {
            onNotify('error', "Failed to load stats: " + e.message);
        }
    };

    const loadConfig = async () => {
        setLoadingConfig(true);
        try {
            const res = await api.getAdminConfig();
            if (res.success) setConfig(res.data);
        } catch (e: any) {
            onNotify('error', "Failed to load config: " + e.message);
        } finally {
            setLoadingConfig(false);
        }
    };

    const loadUsers = async (pageNum: number, search: string) => {
        setLoadingUsers(true);
        try {
            const res = await api.getAdminUsers(pageNum, 50, search);
            if (res.success) {
                setUsers(res.data);
                setTotalPages(res.meta.totalPages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadWithdrawals = async (pageNum: number) => {
        setLoadingWithdrawals(true);
        try {
            const res = await api.getAdminWithdrawals(pageNum, 50);
            if (res.success) {
                setWithdrawals(res.data);
                setTotalPages(res.meta.totalPages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingWithdrawals(false);
        }
    };

    const handleWithdrawalAction = async (id: string, status: 'COMPLETED' | 'FAILED') => {
        if (!window.confirm(`Are you sure you want to ${status === 'COMPLETED' ? 'APPROVE' : 'REJECT'} this withdrawal?`)) return;
        try {
            await api.adminUpdateWithdrawalStatus(id, status);
            loadWithdrawals(page);
            loadStats();
        } catch (e) {
            onNotify('error', "Failed to update withdrawal status");
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadUsers(1, searchQuery);
    };

    const handleBanToggle = async (user: any) => {
        if (window.confirm(`Are you sure you want to ${user.isBanned ? 'UNBAN' : 'SHADOW BAN'} ${user.telegramUsername || user.id}?`)) {
            try {
                await api.adminToggleBan(user.id, !user.isBanned);
                loadUsers(page, searchQuery);
            } catch (e) {
                onNotify('error', "Failed to toggle ban status");
            }
        }
    };

    const handleRoleChange = async (user: any, newRole: 'PLAYER' | 'ADMIN') => {
        if (userRole !== 'SUPER_ADMIN') return onNotify('error', "Requires Super Admin");
        if (window.confirm(`Set role for ${user.id} to ${newRole}?`)) {
            try {
                await api.adminSetRole(user.id, newRole);
                loadUsers(page, searchQuery);
            } catch (e) {
                onNotify('error', "Failed to change role");
            }
        }
    };

    const handleAdjustBalance = async () => {
        if (!editingUser || !adjustAmount) return;
        try {
            await api.adminAdjustBalance(editingUser.id, adjustType, Number(adjustAmount));
            setEditingUser(null);
            setAdjustAmount('');
            loadUsers(page, searchQuery);
        } catch (e) {
            onNotify('error', "Failed to adjust balance");
        }
    };

    const handleSetLevel = async () => {
        if (!editingUser || !newLevel) return;
        try {
            await api.adminSetLevel(editingUser.id, Number(newLevel));
            setEditingUser(null);
            setNewLevel('');
            loadUsers(page, searchQuery);
        } catch (e) {
            onNotify('error', "Failed to set level");
        }
    };

    const handleConfigUpdate = async (type: 'MAINTENANCE' | 'RATE', value: any) => {
        try {
            if (type === 'MAINTENANCE') {
                await api.adminUpdateConfig({ maintenanceMode: value });
            } else if (type === 'RATE') {
                if (!value || isNaN(value)) return;
                await api.adminUpdateConfig({ goldToMaxRate: Number(value) });
            }
            loadConfig();
            onNotify('success', "Settings updated");
        } catch (e) {
            onNotify('error', "Update failed");
        }
    };
    const loadNews = async () => {
        setLoadingNews(true);
        try {
            const res = await api.getAnnouncements(true);
            if (res.success) setAnnouncements(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingNews(false);
        }
    };

    const handleCreateNews = async () => {
        if (!newNewsText) return;
        try {
            const res = await api.adminCreateAnnouncement(newNewsText, newNewsType);
            if (res.success) {
                onNotify('success', 'Announcement published!');
                setNewNewsText('');
                loadNews();
            }
        } catch (e) {
            onNotify('error', 'Failed to publish');
        }
    };

    const handleToggleNews = async (id: string, currentStatus: boolean) => {
        try {
            const res = await api.adminToggleAnnouncement(id, !currentStatus);
            if (res.success) {
                loadNews();
            }
        } catch (e) {
            onNotify('error', 'Failed to toggle status');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[200] bg-slate-950 flex flex-col font-sans text-white overflow-hidden">

            {/* Admin Header */}
            <div className="bg-slate-900 border-b border-indigo-500/30 p-4 flex items-center justify-between shadow-xl z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield className="text-emerald-500" size={24} />
                        <h1 className="text-xl font-black italic uppercase tracking-tighter">Command <span className="text-indigo-400">Center</span></h1>
                    </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    {userRole}
                </div>
            </div>

            {/* Sub-navigation */}
            <div className="flex bg-slate-900/50 border-b border-white/5">
                {[
                    { id: 'DASHBOARD', icon: Activity, label: 'Overview' },
                    { id: 'USERS', icon: Users, label: 'Mod Panel' },
                    { id: 'PAYOUTS', icon: Coins, label: 'Payouts' },
                    { id: 'NEWS', icon: PlayCircle, label: 'News' },
                    { id: 'SETTINGS', icon: Settings, label: 'God Mode', super: true }
                ].map((tab) => {
                    if (tab.super && userRole !== 'SUPER_ADMIN') return null;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:bg-white/5'}`}>
                            <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-slate-950 to-slate-900">

                {/* DASHBOARD TAB */}
                {activeTab === 'DASHBOARD' && stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                        <div className="bg-slate-900 border border-white/10 p-5 rounded-3xl shadow-lg relative overflow-hidden">
                            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Users</div>
                            <div className="text-3xl font-black text-white">{stats.totalUsers.toLocaleString()}</div>
                            <Users className="absolute bottom-[-10px] right-[-10px] w-20 h-20 text-white/5 z-0" />
                        </div>
                        <div className="bg-slate-900 border border-emerald-500/20 p-5 rounded-3xl shadow-lg">
                            <div className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Miners (24h)</div>
                            <div className="text-3xl font-black text-white">{stats.activeMiners.toLocaleString()}</div>
                        </div>
                        <div className="bg-blue-900/40 border border-blue-500/30 p-5 rounded-3xl shadow-lg">
                            <div className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1">$MAX Circulating</div>
                            <div className="text-3xl font-black text-white">{stats.totalMax.toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                        </div>
                        <div className="bg-amber-900/40 border border-amber-500/30 p-5 rounded-3xl shadow-lg">
                            <div className="text-amber-300 text-[10px] font-black uppercase tracking-widest mb-1">Pending Payouts</div>
                            <div className="text-3xl font-black text-white">{stats.pendingWithdrawals}</div>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'USERS' && (
                    <div className="max-w-6xl mx-auto flex flex-col h-full">
                        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                            <input
                                type="text" placeholder="Search by ID or @username..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <button type="submit" className="bg-indigo-600 px-6 rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:bg-indigo-500"><Search size={16} /> Find</button>
                        </form>

                        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-black">
                                        <tr>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Level</th>
                                            <th className="p-4">Gold & Max</th>
                                            <th className="p-4">Role / Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loadingUsers ? (
                                            <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></td></tr>
                                        ) : users.map(user => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-white">{user.telegramUsername || 'Unknown'}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{user.id}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-white/10 px-2 py-1 rounded font-black text-xs">Lv. {user.minerLevel}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-amber-400 font-bold text-xs flex items-center gap-1"><Coins size={12} /> {Number(user.goldBalance).toLocaleString()}</div>
                                                    <div className="text-sky-400 font-bold text-xs flex items-center gap-1 mt-1"><Gem size={12} /> {user.maxBalance}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        {user.role === 'SUPER_ADMIN' ? <span className="text-[9px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-black border border-red-500/20">SUPER ADMIN</span>
                                                            : user.role === 'ADMIN' ? <span className="text-[9px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded font-black border border-emerald-500/20">MODERATOR</span>
                                                                : <span className="text-[9px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded font-black border border-slate-500/20">PLAYER</span>}

                                                        {user.isBanned && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-black border border-purple-500/20 uppercase">Shadow Banned</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    {user.role !== 'SUPER_ADMIN' && (
                                                        <>
                                                            <button onClick={() => setEditingUser(user)} className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors"><Edit3 size={16} /></button>
                                                            <button title="Toggle Ban" onClick={() => handleBanToggle(user)} className={`p-2 rounded-lg transition-colors ${user.isBanned ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                                                                {user.isBanned ? <UserCheck size={16} /> : <UserX size={16} />}
                                                            </button>
                                                            {userRole === 'SUPER_ADMIN' && user.role === 'PLAYER' && <button title="Make Admin" onClick={() => handleRoleChange(user, 'ADMIN')} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"><ShieldPlus size={16} /></button>}
                                                            {userRole === 'SUPER_ADMIN' && user.role === 'ADMIN' && <button title="Revoke Admin" onClick={() => handleRoleChange(user, 'PLAYER')} className="p-2 bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"><ShieldPlus size={16} /></button>}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-white/5 flex justify-between items-center text-xs">
                                <span className="text-slate-500">Page {page} of {totalPages}</span>
                                <div className="space-x-2">
                                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50">Prev</button>
                                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAYOUTS TAB */}
                {activeTab === 'PAYOUTS' && (
                    <div className="max-w-6xl mx-auto flex flex-col h-full">
                        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-black">
                                        <tr>
                                            <th className="p-4">User & Time</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Destination</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Review</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loadingWithdrawals ? (
                                            <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></td></tr>
                                        ) : withdrawals.length === 0 ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold italic">No withdrawal requests found.</td></tr>
                                        ) : withdrawals.map(w => (
                                            <tr key={w.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-white">{w.user?.telegramUsername || 'Unknown'}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{new Date(w.createdAt).toLocaleString()}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-xl font-black text-white">{Number(w.amount).toLocaleString()} <span className="text-sky-400 text-[10px]">$MAX</span></div>
                                                    <div className="text-[10px] text-slate-500">Fee: {Number(w.fee)}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-1 rounded border border-white/5">{w.walletAddress}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-[9px] px-2 py-0.5 rounded font-black border uppercase
                                                        ${w.status === 'PENDING' ? 'bg-amber-500/20 text-amber-500 border-amber-500/20' :
                                                            w.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' :
                                                                'bg-red-500/20 text-red-500 border-red-500/20'}`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    {w.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => handleWithdrawalAction(w.id, 'COMPLETED')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-black text-[10px] hover:bg-emerald-500 transition-colors uppercase">APPROVE</button>
                                                            <button onClick={() => handleWithdrawalAction(w.id, 'FAILED')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-black text-[10px] hover:bg-red-500 transition-colors uppercase">REJECT</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-white/5 flex justify-between items-center text-xs">
                                <span className="text-slate-500">Page {page} of {totalPages}</span>
                                <div className="space-x-2">
                                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50">Prev</button>
                                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SETTINGS (GOD MODE) */}
                {activeTab === 'SETTINGS' && userRole === 'SUPER_ADMIN' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        {loadingConfig ? (
                            <div className="flex flex-col items-center justify-center p-20">
                                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                                <div className="text-slate-400 font-black uppercase tracking-widest animate-pulse">Retrieving System Core...</div>
                            </div>
                        ) : !config ? (
                            <div className="bg-slate-900 border border-white/10 p-10 rounded-3xl text-center">
                                <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                                <h3 className="text-xl font-black mb-2 uppercase">Configuration Missing</h3>
                                <p className="text-slate-400 text-sm mb-6">Unable to access the Global System Config. This could be a database sync issue.</p>
                                <button onClick={loadConfig} className="bg-indigo-600 px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-indigo-500 transition-all">Retry Link</button>
                            </div>
                        ) : (
                            <div className="bg-slate-900 border border-red-500/30 p-6 rounded-3xl shadow-xl">
                                <h3 className="text-red-400 font-black uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldAlert size={20} /> Macro Economy Control</h3>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                                        <div>
                                            <div className="font-bold text-white mb-1">Maintenance Mode</div>
                                            <div className="text-xs text-slate-400 max-w-xs">Disables mining APIs and app access for all regular players.</div>
                                        </div>
                                        <button onClick={() => handleConfigUpdate('MAINTENANCE', !config.maintenanceMode)}
                                            className={`px-6 py-3 rounded-xl font-black uppercase text-xs transition-colors ${config.maintenanceMode ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                            {config.maintenanceMode ? 'ACTIVE' : 'OFF'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                                        <div>
                                            <div className="font-bold text-white mb-1">Exchange Rate (Gold to $MAX)</div>
                                            <div className="text-xs text-slate-400 max-w-xs">Cost in Gold to acquire 1.0 MAX. Current: {config.goldToMaxRate} G.</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="number" id="rateInput" defaultValue={config.goldToMaxRate} className="w-24 bg-slate-950 border border-white/10 rounded-xl px-3 text-sm text-center" />
                                            <button onClick={() => handleConfigUpdate('RATE', (document.getElementById('rateInput') as HTMLInputElement).value)} className="bg-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-500">SAVE</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {/* NEWS TAB */}
                {activeTab === 'NEWS' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-xl">
                            <h3 className="text-white font-black uppercase mb-4 flex items-center gap-2">Broadcast New Message</h3>
                            <div className="space-y-4">
                                <textarea
                                    value={newNewsText} onChange={e => setNewNewsText(e.target.value)}
                                    placeholder="Enter announcement text for the scrolling ticker..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 min-h-[100px]"
                                />
                                <div className="flex gap-4">
                                    <select value={newNewsType} onChange={e => setNewNewsType(e.target.value)}
                                        className="bg-slate-800 border-none rounded-xl text-xs px-4 font-bold outline-none">
                                        <option value="INFO">INFO (Blue)</option>
                                        <option value="EVENT">EVENT (Rose)</option>
                                        <option value="WARNING">WARNING (Amber)</option>
                                    </select>
                                    <button onClick={handleCreateNews} className="flex-1 bg-indigo-600 py-3 rounded-xl font-black uppercase text-xs hover:bg-indigo-500">Publish to Ticker</button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-4 bg-slate-950/50 border-b border-white/5 font-black uppercase text-[10px] tracking-widest text-slate-400">Manage Active Feed</div>
                            <div className="divide-y divide-white/5">
                                {loadingNews ? <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></div> :
                                    announcements.length === 0 ? <div className="p-8 text-center text-slate-500 text-xs italic">No messages found.</div> :
                                        announcements.map(news => (
                                            <div key={news.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                <div className="flex-1 pr-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${news.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : news.type === 'EVENT' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                                            {news.type}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-mono">{new Date(news.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="text-xs text-white opacity-90">{news.text}</div>
                                                </div>
                                                <button onClick={() => handleToggleNews(news.id, news.active)}
                                                    className={`px-4 py-2 rounded-xl font-black uppercase text-[9px] border ${news.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                    {news.active ? 'Active' : 'Archived'}
                                                </button>
                                            </div>
                                        ))
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Editing Modal */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-black mb-4 uppercase italic">Modify Data</h2>
                            <div className="text-slate-400 text-xs mb-6 break-all">Target: {editingUser.id}</div>

                            <div className="space-y-4 mb-8">
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Adjust Balance (+/-)</label>
                                    <div className="flex gap-2 mb-2">
                                        <select value={adjustType} onChange={e => setAdjustType(e.target.value as any)} className="bg-slate-800 border-none rounded-xl text-xs px-3 font-bold cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="GOLD">Gold</option>
                                            <option value="MAX">$MAX</option>
                                        </select>
                                        <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="e.g. 50000 or -100" className="flex-1 bg-slate-950 px-3 py-2 rounded-xl text-sm border border-white/10 focus:outline-none focus:border-indigo-500" />
                                    </div>
                                    <button onClick={handleAdjustBalance} className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase">Apply Balance</button>
                                </div>

                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Set Miner Level</label>
                                    <div className="flex gap-2">
                                        <input type="number" min="1" max="10" value={newLevel} onChange={e => setNewLevel(e.target.value)} placeholder="1-10" className="w-20 bg-slate-950 px-3 py-2 rounded-xl text-sm border border-white/10 focus:outline-none text-center" />
                                        <button onClick={handleSetLevel} className="flex-1 py-2 bg-amber-600 text-white rounded-xl text-xs font-black uppercase hover:bg-amber-500 transition-colors">Force Level</button>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setEditingUser(null)} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold">CLOSE</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
