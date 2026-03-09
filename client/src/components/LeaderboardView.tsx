import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Users, Coins, Star, Loader2 } from 'lucide-react';
import { api } from '../api';

interface LeaderboardUser {
    id: string;
    username: string;
    goldBalance?: string;
    maxBalance?: number;
    count?: number;
    weeklyMiningCount?: number;
}

export const LeaderboardView: React.FC<{ profile: any }> = ({ profile }) => {
    const [type, setType] = useState<'GOLD' | 'MAX' | 'REFERRAL' | 'AD'>('GOLD');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ topUsers: LeaderboardUser[], userRank: number }>({ topUsers: [], userRank: 0 });
    const [displayCount, setDisplayCount] = useState(5);

    useEffect(() => {
        setLoading(true);
        api.getLeaderboard(type)
            .then(res => {
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
        if (type === 'MAX') return `${user.maxBalance?.toFixed(2)} $MAX`;
        if (type === 'REFERRAL') return `${user.count} Referrals`;
        return `${user.weeklyMiningCount} Minings`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col h-full bg-slate-950 rounded-t-[32px] overflow-hidden border-t border-white/5 shadow-2xl"
        >
            {/* Header / Tabs */}
            <div className="p-4 pt-6 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-rose-500/20 rounded-xl">
                        <Trophy className="w-6 h-6 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Global Ranking</h2>
                </div>

                <div className="flex p-1 bg-slate-800/50 rounded-2xl gap-1">
                    {[
                        { id: 'GOLD', icon: Star, label: 'Gold' },
                        { id: 'MAX', icon: Coins, label: 'MAX' },
                        { id: 'REFERRAL', icon: Users, label: 'Friends' },
                        { id: 'AD', icon: Trophy, label: 'Miners' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setType(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 ${type === tab.id
                                ? 'bg-white text-slate-900 shadow-lg scale-100'
                                : 'text-slate-400 scale-95 opacity-60 hover:opacity-100'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
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
                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${user.id === profile?.id
                                        ? 'bg-rose-500/10 border-rose-500/30'
                                        : 'bg-white/5 border-white/5'
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
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[360px] bg-indigo-600 p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/20 z-[60]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-black italic">
                            #{data.userRank}
                        </div>
                        <div>
                            <div className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none">Your Rank</div>
                            <div className="text-xs font-black text-white italic uppercase tracking-tighter">
                                {profile?.telegramUsername || 'Anonymous Miner'}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-white italic">
                            {type === 'GOLD' ? Math.floor(Number(profile.goldBalance)).toLocaleString() :
                                type === 'MAX' ? Number(profile.maxBalance).toFixed(2) :
                                    type === 'AD' ? profile.weeklyMiningCount || 0 :
                                        profile.referralCount || 0}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
