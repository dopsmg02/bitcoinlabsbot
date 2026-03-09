import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, History, ArrowUpRight, ArrowDownLeft, Star, X, Loader2 } from 'lucide-react';

interface DashboardViewProps {
    profile: any;
    myInvestments: any[];
    onNavigate: (tab: any) => void;
    onSpinWheel: () => Promise<any>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ profile, myInvestments, onNavigate, onSpinWheel }) => {
    const [showWheel, setShowWheel] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState<any>(null);

    const activeInvestmentTotal = myInvestments
        .filter(inv => inv.status === 'ACTIVE')
        .reduce((acc, inv) => acc + Number(inv.amount), 0);

    const totalEarned = myInvestments.reduce((acc, inv) => acc + Number(inv.totalEarned), 0);

    const handleSpin = async () => {
        if (isSpinning || profile?.luckySpinTickets < 1) return;
        setIsSpinning(true);
        setSpinResult(null);

        // Artificial delay for "suspense"
        const result = await onSpinWheel();

        setTimeout(() => {
            setIsSpinning(false);
            if (result) setSpinResult(result);
        }, 3000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-4 noise-filter"
        >
            {/* Balance Card (Refined Tech Style) */}
            <div className="relative overflow-hidden bg-zinc-950 rounded-[32px] border-2 border-white/10 p-8 mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-mint/5 blur-[60px] rounded-full" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-white/30 text-[10px] uppercase font-light tracking-[0.3em] mb-2">Portfolio Balance</p>
                            <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none">
                                ${Number(profile?.btclBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h1>
                        </div>
                        <div className="bg-mint/10 p-3 rounded-2xl border border-mint/20">
                            <Wallet className="text-mint w-6 h-6" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-10">
                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                            <p className="text-white/20 text-[8px] uppercase font-black tracking-widest mb-1">Net Profits</p>
                            <p className="text-mint font-black text-xl tracking-tighter">${totalEarned.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                            <p className="text-white/20 text-[8px] uppercase font-black tracking-widest mb-1">Active Stake</p>
                            <p className="text-white font-black text-xl tracking-tighter">${activeInvestmentTotal.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                    onClick={() => onNavigate('WALLET')}
                    className="bg-white text-black py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.15em] shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <ArrowDownLeft size={16} strokeWidth={3} />
                    Deposit
                </button>
                <button
                    onClick={() => onNavigate('WALLET')}
                    className="bg-transparent border-2 border-white/10 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.15em] flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <ArrowUpRight size={16} strokeWidth={3} />
                    Withdraw
                </button>
            </div>

            {/* Stats Summary */}
            <h3 className="text-white/30 font-black uppercase tracking-[0.25em] text-[10px] ml-2 mb-4">Market Analytics</h3>
            <div className="bg-zinc-950 rounded-[28px] border border-white/5 p-6 mb-8">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-mint/5 p-2.5 rounded-xl border border-mint/10">
                                <TrendingUp className="text-mint w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Daily Yield</p>
                                <p className="text-[8px] text-white/20 mt-1.5 uppercase font-bold tracking-widest">Projected</p>
                            </div>
                        </div>
                        <p className="text-mint font-black italic tracking-tighter text-2xl">
                            +${myInvestments.reduce((acc, inv) => acc + (inv.status === 'ACTIVE' ? Number(inv.dailyRoi) : 0), 0).toFixed(2)}
                        </p>
                    </div>

                    <div className="h-px bg-white/[0.03] w-full" />

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                                <History className="text-white/40 w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Capital Flow</p>
                                <p className="text-[8px] text-white/20 mt-1.5 uppercase font-bold tracking-widest">Historical</p>
                            </div>
                        </div>
                        <p className="text-white font-black italic tracking-tighter text-2xl">
                            ${Number(profile?.totalDeposit || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bonus Lucky Wheel Card (Refined) */}
            <div className="bg-white text-black rounded-[32px] p-6 shadow-2xl relative overflow-hidden group border-2 border-white">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-mint skew-x-[-20deg] translate-x-12 opacity-10 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="text-black font-black text-2xl italic uppercase tracking-tighter mb-1">Fortune Lab</h4>
                            <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                Stake tickets to unlock rewards.
                            </p>
                        </div>
                        <div className="bg-black/5 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-black/10">
                            <Star size={14} className="text-black fill-black" />
                            <span className="text-[14px] font-black text-black">{profile?.luckySpinTickets || 0}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWheel(true)}
                        className="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                    >
                        Initialize Spin
                    </button>
                </div>
            </div>

            {/* Lucky Wheel Modal */}
            <AnimatePresence>
                {showWheel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-[40px] p-8 w-full max-w-sm flex flex-col items-center relative shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-orange-500" />

                            <button onClick={() => setShowWheel(false)} className="absolute top-6 right-6 text-white/40 hover:text-white">
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black italic uppercase text-white mb-2 tracking-tighter mt-4">Fortune <span className="text-mint">Vault</span></h2>
                            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-12">Probability synchronized</p>

                            {/* Wheel Visual (Refined) */}
                            <div className="relative mb-14">
                                <motion.div
                                    animate={isSpinning ? { rotate: 360 * 8 } : { rotate: 0 }}
                                    transition={isSpinning ? { duration: 4, ease: [0.45, 0.05, 0.55, 0.95] } : { duration: 0 }}
                                    className="w-56 h-56 rounded-full border-[10px] border-white/5 relative bg-zinc-950 shadow-[0_0_60px_rgba(0,255,157,0.05)] flex items-center justify-center overflow-hidden"
                                >
                                    <div className="absolute inset-0 rounded-full border border-mint/20 animate-pulse" />
                                    <div className="absolute inset-[30%] bg-mint/5 rounded-full blur-2xl" />
                                    <Star className={`w-14 h-14 text-mint ${isSpinning ? 'animate-pulse' : ''}`} fill="currentColor" />
                                </motion.div>
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-8 bg-mint clip-path-triangle z-10 shadow-[0_4px_20px_rgba(0,255,157,0.5)]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
                            </div>

                            <div className="w-full space-y-4">
                                {spinResult ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-mint/5 border border-mint/20 p-5 rounded-2xl text-center"
                                    >
                                        <p className="text-mint font-black uppercase text-[10px] tracking-widest">{spinResult.message}</p>
                                    </motion.div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mb-6">Unit Cost: 1.0 Ticket</p>
                                    </div>
                                )}

                                <button
                                    disabled={isSpinning || profile?.luckySpinTickets < 1}
                                    onClick={handleSpin}
                                    className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] shadow-2xl transition-all flex items-center justify-center gap-3
                                        ${profile?.luckySpinTickets >= 1 ? 'bg-mint text-black active:scale-95 shadow-mint/20' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}
                                    `}
                                >
                                    {isSpinning ? <Loader2 className="animate-spin" /> : 'Execute Sequence'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
