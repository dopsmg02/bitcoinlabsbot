import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Crown, Gem, CheckCircle2, Loader2, Sparkles, TrendingUp } from 'lucide-react';

interface InvestmentViewProps {
    plans: any[];
    myInvestments: any[];
    isActionLoading: boolean;
    onInvest: (planId: string, amount: number) => Promise<boolean>;
}

export const InvestmentView: React.FC<InvestmentViewProps> = ({ plans, myInvestments, isActionLoading, onInvest }) => {
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [investAmount, setInvestAmount] = useState<string>('');

    const getPlanIcon = (name: string) => {
        if (name.toLowerCase().includes('silver')) return <Shield className="w-8 h-8 text-slate-300" />;
        if (name.toLowerCase().includes('gold')) return <Zap className="w-8 h-8 text-amber-400" />;
        if (name.toLowerCase().includes('vip')) return <Crown className="w-8 h-8 text-indigo-400" />;
        return <Gem className="w-8 h-8 text-rose-400" />;
    };

    const activeInvestments = myInvestments.filter(inv => inv.status === 'ACTIVE');

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-1"
        >
            <div className="mb-6">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">VIP <span className="text-indigo-400">Pools</span></h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Select an investment plan below</p>
            </div>

            {/* Plans List */}
            <div className="space-y-4 mb-10">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative p-5 rounded-[32px] border-2 transition-all cursor-pointer overflow-hidden group
              ${selectedPlan?.id === plan.id ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.2)]' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}
            `}
                        onClick={() => {
                            setSelectedPlan(plan);
                            setInvestAmount(plan.minAmount);
                        }}
                    >
                        {/* Animated Background Pattern for selected plan */}
                        {selectedPlan?.id === plan.id && (
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <Sparkles className="w-full h-full text-indigo-400 animate-pulse" />
                            </div>
                        )}

                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                    {getPlanIcon(plan.name)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">{plan.name} Pool</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-emerald-400 font-black text-xs">+{plan.dailyRoiPercent}% Daily</span>
                                        <span className="text-white/20 text-[10px] uppercase font-black tracking-widest">• {plan.durationDays} Days</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white/40 text-[8px] uppercase font-black tracking-widest mb-1">Entry</p>
                                <p className="text-white font-black text-sm">${Number(plan.minAmount).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Expansion for selected plan */}
                        {selectedPlan?.id === plan.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-6 pt-6 border-t border-white/10 space-y-4"
                            >
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Investment Amount ($)</label>
                                    <input
                                        type="number"
                                        value={investAmount}
                                        onChange={(e) => setInvestAmount(e.target.value)}
                                        min={plan.minAmount}
                                        max={plan.maxAmount}
                                        className="bg-black/60 border border-white/10 rounded-2xl p-4 text-white font-black focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>

                                <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-indigo-300 tracking-widest">
                                        <span>Expected ROI</span>
                                        <span>Total Return</span>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-xl font-black text-white italic tracking-tighter">
                                            ${(Number(investAmount) * Number(plan.dailyRoiPercent) / 100).toFixed(2)} / Day
                                        </span>
                                        <span className="text-emerald-400 font-black text-xl italic tracking-tighter">
                                            ${(Number(investAmount) * (1 + (Number(plan.dailyRoiPercent) * plan.durationDays / 100))).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onInvest(plan.id, Number(investAmount))}
                                    disabled={isActionLoading || !investAmount || Number(investAmount) < Number(plan.minAmount)}
                                    className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-white/5 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isActionLoading ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={16} />}
                                    Confirm Stake
                                </button>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Active Stakes */}
            <div className="mb-4">
                <h3 className="text-white/80 font-black uppercase tracking-[0.15em] text-[10px] ml-2">My Active Stakes</h3>
            </div>

            {activeInvestments.length > 0 ? (
                <div className="space-y-3 pb-10">
                    {activeInvestments.map((inv) => (
                        <div key={inv.id} className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3">
                                <CheckCircle2 size={16} className="text-emerald-500 opacity-50" />
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-1">{inv.planName} Pool</p>
                                    <h4 className="text-2xl font-black text-white italic tracking-tighter">${Number(inv.amount).toLocaleString()}</h4>
                                    <p className="text-white/30 text-[9px] uppercase font-bold mt-2">Ends: {new Date(inv.endDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-400 font-black text-lgLeading-none">+${Number(inv.totalEarned).toFixed(2)}</p>
                                    <p className="text-white/30 text-[8px] uppercase font-black tracking-widest">Earned So Far</p>
                                </div>
                            </div>
                            {/* Progress bar to end date */}
                            <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '45%' }} // TODO: Calculate actual progress
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[32px] p-12 text-center">
                    <Sparkles className="text-white/10 w-12 h-12 mx-auto mb-4" />
                    <p className="text-white/30 font-black uppercase tracking-widest text-xs">No active investments found</p>
                </div>
            )}
        </motion.div>
    );
};
