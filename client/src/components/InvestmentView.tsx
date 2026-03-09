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
            className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-4 noise-filter"
        >
            <div className="mb-8">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Investment <span className="text-mint">Vault</span></h2>
                <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mt-1.5">Capital deployment interface</p>
            </div>

            {/* Plans List */}
            <div className="space-y-4 mb-10">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative p-6 rounded-[32px] border-2 transition-all cursor-pointer overflow-hidden group
              ${selectedPlan?.id === plan.id ? 'bg-mint/5 border-mint shadow-[0_0_40px_rgba(0,255,157,0.1)]' : 'bg-zinc-950 border-white/5 hover:border-white/10'}
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
                            <div className="flex items-center gap-5">
                                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                    {getPlanIcon(plan.name)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{plan.name} Pool</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-mint font-black text-[10px] uppercase tracking-widest">+{plan.dailyRoiPercent}% Daily</span>
                                        <span className="text-white/20 text-[9px] uppercase font-black tracking-[0.2em]">• {plan.durationDays} Days</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white/20 text-[8px] uppercase font-black tracking-widest mb-1.5">Min Entry</p>
                                <p className="text-white font-black text-lg tracking-tighter">${Number(plan.minAmount).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Expansion for selected plan */}
                        {selectedPlan?.id === plan.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-6 pt-6 border-t border-white/10 space-y-4"
                            >
                                <div className="flex flex-col gap-3">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">Stake Amount (USD)</label>
                                    <input
                                        type="number"
                                        value={investAmount}
                                        onChange={(e) => setInvestAmount(e.target.value)}
                                        min={plan.minAmount}
                                        max={plan.maxAmount}
                                        className="bg-black border-2 border-white/10 rounded-2xl p-5 text-white text-lg font-black focus:border-mint transition-all outline-none"
                                    />
                                </div>

                                <div className="bg-mint/5 p-5 rounded-3xl border border-mint/10">
                                    <div className="flex justify-between text-[9px] font-black uppercase text-mint/60 tracking-[0.3em] mb-4">
                                        <span>Daily Projection</span>
                                        <span>Total Maturity</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-2xl font-black text-white italic tracking-tighter">
                                            +${(Number(investAmount) * Number(plan.dailyRoiPercent) / 100).toFixed(2)}
                                        </span>
                                        <span className="text-mint font-black text-3xl italic tracking-tighter leading-none">
                                            +${(Number(investAmount) * (1 + (Number(plan.dailyRoiPercent) * plan.durationDays / 100))).toFixed(0)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onInvest(plan.id, Number(investAmount))}
                                    disabled={isActionLoading || !investAmount || Number(investAmount) < Number(plan.minAmount)}
                                    className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {isActionLoading ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} strokeWidth={3} />}
                                    Deploy Capital
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
                        <div key={inv.id} className="bg-zinc-950 rounded-[32px] border border-white/5 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4">
                                <CheckCircle2 size={18} className="text-mint opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex justify-between items-end relative z-10">
                                <div>
                                    <p className="text-mint font-black text-[9px] uppercase tracking-[0.3em] mb-2">{inv.planName} Matrix</p>
                                    <h4 className="text-3xl font-black text-white italic tracking-tighter leading-none">${Number(inv.amount).toLocaleString()}</h4>
                                    <p className="text-white/20 text-[8px] uppercase font-bold mt-4 tracking-widest">Maturity: {new Date(inv.endDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-mint font-black text-2xl tracking-tighter leading-none">+${Number(inv.totalEarned).toFixed(2)}</p>
                                    <p className="text-white/20 text-[8px] uppercase font-black tracking-widest mt-1">Accumulated</p>
                                </div>
                            </div>
                            {/* Progress bar to end date */}
                            <div className="mt-6 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '45%' }} // TODO: Calculate actual progress
                                    className="h-full bg-mint shadow-[0_0_15px_rgba(0,255,157,0.3)]"
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
