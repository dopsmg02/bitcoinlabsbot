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
            className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-1"
        >
            {/* Balance Card (Premium Glassmorphism) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/40 to-purple-600/40 backdrop-blur-3xl rounded-[32px] border border-white/20 p-6 mb-6 shadow-2xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-[80px] rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-[80px] rounded-full" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-white/60 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Available Balance</p>
                            <h1 className="text-4xl font-black text-white italic tracking-tighter">
                                ${Number(profile?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h1>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                            <Wallet className="text-white w-6 h-6" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                            <p className="text-white/40 text-[8px] uppercase font-black tracking-widest mb-1">Total Profits</p>
                            <p className="text-emerald-400 font-black text-lg">${totalEarned.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                            <p className="text-white/40 text-[8px] uppercase font-black tracking-widest mb-1">Active Stake</p>
                            <p className="text-indigo-300 font-black text-lg">${activeInvestmentTotal.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => onNavigate('WALLET')}
                    className="bg-white text-slate-900 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <ArrowDownLeft size={16} />
                    Deposit
                </button>
                <button
                    onClick={() => onNavigate('WALLET')}
                    className="bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <ArrowUpRight size={16} />
                    Withdraw
                </button>
            </div>

            {/* Stats Summary */}
            <h3 className="text-white/80 font-black uppercase tracking-[0.15em] text-[10px] ml-2 mb-3">Investment Summary</h3>
            <div className="bg-slate-900/40 backdrop-blur-md rounded-[28px] border border-white/5 p-4 mb-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/20 p-2 rounded-xl">
                                <TrendingUp className="text-amber-500 w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase leading-none">Daily Yield</p>
                                <p className="text-[9px] text-white/40 mt-1 uppercase font-bold">Estimated profit</p>
                            </div>
                        </div>
                        <p className="text-emerald-400 font-black italic tracking-tighter text-lg">
                            +${myInvestments.reduce((acc, inv) => acc + (inv.status === 'ACTIVE' ? Number(inv.dailyRoi) : 0), 0).toFixed(2)}
                        </p>
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-500/20 p-2 rounded-xl">
                                <History className="text-indigo-400 w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white uppercase leading-none">Total Deposits</p>
                                <p className="text-[9px] text-white/40 mt-1 uppercase font-bold">All time</p>
                            </div>
                        </div>
                        <p className="text-white font-black italic tracking-tighter text-lg">
                            ${Number(profile?.totalDeposit || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bonus Lucky Wheel Card */}
            <div className="bg-gradient-to-r from-rose-600 to-orange-600 rounded-[28px] p-5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-full w-1/2 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
                    <Star className="text-white w-full h-full p-4 rotate-12" />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-white font-black text-xl italic uppercase tracking-tighter mb-1">Lucky Wheel</h4>
                            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[70%]">
                                Spin and win cash prizes! You have <span className="text-white bg-black/20 px-2 py-0.5 rounded-lg">{profile?.luckySpinTickets || 0}</span> tickets.
                            </p>
                        </div>
                        <div className="bg-white/20 px-3 py-1.5 rounded-2xl flex items-center gap-2">
                            <Star size={12} className="text-amber-300 fill-amber-300" />
                            <span className="text-[12px] font-black text-white">{profile?.luckySpinTickets || 0}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWheel(true)}
                        className="mt-4 bg-white text-rose-600 px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                        Play Now
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

                            <h2 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tighter mt-4">Lucky <span className="text-rose-500">Wheel</span></h2>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-10">Fortune favors the bold</p>

                            {/* Wheel Visual */}
                            <div className="relative mb-10">
                                <motion.div
                                    animate={isSpinning ? { rotate: 360 * 5 } : { rotate: 0 }}
                                    transition={isSpinning ? { duration: 3, ease: "easeOut" } : { duration: 0 }}
                                    className="w-48 h-48 rounded-full border-[8px] border-white/5 relative bg-gradient-to-br from-slate-800 to-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center"
                                >
                                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/10 animate-spin-slow" />
                                    <Star className={`w-12 h-12 text-rose-500 ${isSpinning ? 'animate-pulse' : ''}`} fill="currentColor" />
                                </motion.div>
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-6 bg-rose-500 clip-path-triangle z-10" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
                            </div>

                            <div className="w-full space-y-4">
                                {spinResult ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl text-center"
                                    >
                                        <p className="text-emerald-400 font-black uppercase text-xs tracking-widest">{spinResult.message}</p>
                                    </motion.div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Cost: 1 Ticket</p>
                                    </div>
                                )}

                                <button
                                    disabled={isSpinning || profile?.luckySpinTickets < 1}
                                    onClick={handleSpin}
                                    className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all flex items-center justify-center gap-3
                                        ${profile?.luckySpinTickets >= 1 ? 'bg-white text-slate-900 active:scale-95' : 'bg-slate-800 text-white/20 cursor-not-allowed'}
                                    `}
                                >
                                    {isSpinning ? <Loader2 className="animate-spin" /> : 'SPIN NOW'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
