import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Users, Coins, Star, Loader2 } from 'lucide-react';
import { api } from '../api';

interface LeaderboardUser {
    id: string;
    username: string;
    goldBalance?: string;
    btclBalance?: number;
    count?: number;
    weeklyMiningCount?: number;
}

export const LeaderboardView: React.FC<{ profile: any }> = ({ profile }) => {
    const [type, setType] = useState<'GOLD' | 'BTCL' | 'REFERRAL' | 'AD'>('GOLD');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ topUsers: LeaderboardUser[], userRank: number }>({ topUsers: [], userRank: 0 });
    const [displayCount, setDisplayCount] = useState(5);

    useEffect(() => {
        setLoading(true);
        api.getLeaderboard(type)
            .then((res: any) => {
                if (res.success) setData({ topUsers: res.topUsers, userRank: res.userRank });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [type]);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />;
        if (index === 1) return <Medal className="w-5 h-5 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" />;
        if (index === 2) return <Medal className="w-5 h-5 text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" />;
        return <span className="text-xs font-black text-slate-500">{index + 1}</span>;
    };

    const formatValue = (user: LeaderboardUser) => {
        if (type === 'GOLD') return `${Number(user.goldBalance).toLocaleString()} GOLD`;
        if (type === 'BTCL') return `${user.btclBalance?.toFixed(2)} $BTCL`;
        if (type === 'REFERRAL') return `${user.count} Referrals`;
        return `${user.weeklyMiningCount} Activities`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col h-full bg-obsidian rounded-t-[40px] overflow-hidden border-t-2 border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] noise-filter"
        >
            {/* Header / Tabs */}
            <div className="p-6 pt-10 bg-zinc-950 border-b border-white/5">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-mint/5 rounded-2xl border border-mint/10">
                        <Trophy className="w-6 h-6 text-mint" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Global Ranking</h2>
                        <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mt-2">Verified network performance</p>
                    </div>
                </div>

                <div className="flex p-1.5 bg-black/40 rounded-[22px] gap-1.5 border border-white/5">
                    {[
                        { id: 'GOLD', icon: Star, label: 'Gold' },
                        { id: 'BTCL', icon: Coins, label: 'BTCL' },
                        { id: 'REFERRAL', icon: Users, label: 'Friends' },
                        { id: 'AD', icon: Trophy, label: 'Investors' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setType(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] transition-all duration-300 ${type === tab.id
                                ? 'bg-white text-black shadow-2xl scale-100'
                                : 'text-white/30 scale-95 hover:text-white/60'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-40">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 opacity-30">
                        <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Loading Rankings...</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                            {data.topUsers.slice(0, displayCount).map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={`flex items-center gap-4 p-4 rounded-[28px] border-2 transition-all ${user.id === profile?.id
                                        ? 'bg-mint/5 border-mint/20'
                                        : 'bg-zinc-950 border-white/5'
                                        }`}
                                >
                                    <div className="w-8 flex justify-center">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black text-white italic uppercase">{user.username}</div>
                                        <div className="text-[9px] font-bold text-slate-400 tracking-wider">
                                            {formatValue(user)}
                                        </div>
                                    </div>
                                    {index < 3 && (
                                        <div className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${index === 0 ? 'bg-amber-400/20 text-amber-400' :
                                            index === 1 ? 'bg-slate-300/20 text-slate-300' :
                                                'bg-amber-700/20 text-amber-700'
                                            }`}>
                                            Elite
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {data.topUsers.length > displayCount && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setDisplayCount(prev => prev + 10)}
                                className="w-full py-4 mt-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:bg-white/10 transition-colors"
                            >
                                Expand Ranking View
                            </motion.button>
                        )}

                        {displayCount > 5 && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setDisplayCount(5)}
                                className="w-full py-2 mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-400 transition-colors"
                            >
                                Show Less
                            </motion.button>
                        )}
                    </div>
                )}
            </div>

            {/* User Personal Rank Bar */}
            {!loading && (
                <div className="fixed bottom-28 left-8 right-8 bg-white p-6 rounded-[32px] shadow-[0_20px_60px_rgba(255,255,255,0.1)] flex items-center justify-between border-4 border-white z-[60]">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-black italic shadow-xl">
                            #{data.userRank}
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">My Performance</div>
                            <div className="text-md font-black text-black italic uppercase tracking-tighter leading-none">
                                {profile?.telegramUsername
                                    ? (profile.telegramUsername.startsWith('@') ? profile.telegramUsername : `@${profile.telegramUsername}`)
                                    : (profile?.id ? `Investor_${String(profile.id).substring(0, 4)}` : 'Anonymous Investor')}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black text-black italic tracking-tighter leading-none">
                            {type === 'GOLD' ? Math.floor(Number(profile.goldBalance)).toLocaleString() :
                                type === 'BTCL' ? Number(profile.btclBalance).toFixed(2) :
                                    type === 'AD' ? profile.weeklyMiningCount || 0 :
                                        profile.referralCount || 0}
                        </div>
                        <p className="text-[8px] text-black/20 font-black uppercase tracking-widest mt-1">{type}</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
