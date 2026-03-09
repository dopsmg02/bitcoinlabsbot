import React from 'react';
import { motion } from 'framer-motion';
import { History, ArrowUpRight, ArrowDownLeft, TrendingUp, Gift, UserPlus, RefreshCcw } from 'lucide-react';

interface HistoryViewProps {
    history: any[];
    refreshAll: () => Promise<void>;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, refreshAll }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'DEPOSIT': return <ArrowDownLeft className="text-blue-400" size={18} />;
            case 'WITHDRAW': return <ArrowUpRight className="text-rose-400" size={18} />;
            case 'INVESTMENT': return <TrendingUp className="text-amber-400" size={18} />;
            case 'ROI_DAILY': return <SparklesIcon className="text-emerald-400" size={18} />;
            case 'BONUS_BOUNTY': return <Gift className="text-purple-400" size={18} />;
            case 'REFERRAL_LEVEL_1':
            case 'REFERRAL_LEVEL_2':
            case 'REFERRAL_LEVEL_3':
            case 'REFERRAL_LEVEL_4':
            case 'REFERRAL_LEVEL_5': return <UserPlus className="text-indigo-400" size={18} />;
            default: return <RefreshCcw size={18} />;
        }
    };

    const getLabel = (type: string) => {
        return type.replace(/_/g, ' ');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-4 noise-filter"
        >
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Record <span className="text-mint">Ledger</span></h2>
                    <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mt-1.5">Verified transaction protocol</p>
                </div>
                <button onClick={refreshAll} className="p-4 bg-zinc-950 rounded-2xl border-2 border-white/5 text-white/20 hover:text-mint hover:border-mint/20 transition-all active:rotate-180 duration-500 shadow-xl">
                    <RefreshCcw size={20} strokeWidth={3} />
                </button>
            </div>

            <div className="space-y-4 pb-12">
                {history.length > 0 ? (
                    history.map((tx) => (
                        <div key={tx.id} className="bg-zinc-950 border-2 border-white/5 rounded-[32px] p-5 flex justify-between items-center group transition-all hover:border-white/10 shadow-2xl">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center border-2 border-white/5 shadow-inner group-hover:scale-105 transition-transform">
                                    {getIcon(tx.type)}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">{getLabel(tx.type)}</h4>
                                    <p className="text-[8px] text-white/10 font-bold uppercase tracking-[0.2em] mt-2 italic">{new Date(tx.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-xl font-black italic tracking-tighter leading-none ${tx.amount > 0 ? 'text-mint' : 'text-white'}`}>
                                    {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)}
                                </p>
                                <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.3em] mt-1.5">{tx.type.includes('WITHDRAW') ? 'DEBIT' : 'CREDIT'}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-24 bg-zinc-950 border-2 border-dashed border-white/5 rounded-[44px]">
                        <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-8">
                            <History className="text-white/5 w-10 h-10" />
                        </div>
                        <p className="text-white/20 font-black uppercase tracking-[0.5em] text-[10px]">Data Stream Clear</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const SparklesIcon = ({ className, size }: { className?: string, size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);
