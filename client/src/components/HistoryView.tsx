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
            className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-1"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Record <span className="text-indigo-400">Ledger</span></h2>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time transaction log</p>
                </div>
                <button onClick={refreshAll} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:text-white transition-colors active:rotate-180 duration-500">
                    <RefreshCcw size={18} />
                </button>
            </div>

            <div className="space-y-3 pb-10">
                {history.length > 0 ? (
                    history.map((tx) => (
                        <div key={tx.id} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-4 flex justify-between items-center group hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                                    {getIcon(tx.type)}
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{getLabel(tx.type)}</h4>
                                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1.5">{new Date(tx.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-black italic tracking-tighter ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                    {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)}
                                </p>
                                <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em]">{tx.type.includes('WITHDRAW') ? 'DEBIT' : 'CREDIT'}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-slate-900/10 border-2 border-dashed border-white/5 rounded-[40px]">
                        <History className="text-white/5 w-16 h-16 mx-auto mb-4" />
                        <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">No records found in the ledger</p>
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
