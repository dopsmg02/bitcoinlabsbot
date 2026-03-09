import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Link, Copy, Check, ChevronDown, ChevronUp, Star, Award, TrendingUp } from 'lucide-react';

interface ReferralViewProps {
    profile: any;
    onNotify?: (type: any, msg: string) => void;
}

export const ReferralView: React.FC<ReferralViewProps> = ({ profile, onNotify }) => {
    const [copied, setCopied] = useState(false);
    const [expandedLevel, setExpandedLevel] = useState<number | null>(1);

    const inviteLink = `https://t.me/your_bot_name?start=${profile?.id}`;

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        if (onNotify) onNotify('success', 'Referral link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const levels = [
        { level: 1, bonus: '10%', title: 'Direct Partners' },
        { level: 2, bonus: '5%', title: 'Level 2' },
        { level: 3, bonus: '3%', title: 'Level 3' },
        { level: 4, bonus: '1%', title: 'Level 4' },
        { level: 5, bonus: '1%', title: 'Level 5' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-1"
        >
            <div className="mb-6">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Affiliate <span className="text-indigo-400">Network</span></h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Multi-level referral system</p>
            </div>

            {/* Referral Link Card */}
            <div className="bg-gradient-to-br from-indigo-700 to-blue-900 p-8 rounded-[40px] shadow-2xl mb-8 relative overflow-hidden border border-white/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[100px] rounded-full" />
                <div className="relative z-10 text-center">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">Build Your Empire</h3>
                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-8 opacity-80">Earn up to 20% total commission from 5 levels</p>

                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between mb-6">
                        <p className="text-white font-mono text-[10px] truncate max-w-[70%]">{inviteLink}</p>
                        <button onClick={copyLink} className="text-white p-2 hover:bg-white/10 rounded-xl transition-colors">
                            {copied ? <Check className="text-emerald-400" size={18} /> : <Copy size={18} />}
                        </button>
                    </div>

                    <button onClick={copyLink} className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <Link size={16} />
                        {copied ? 'Link Copied!' : 'Copy Partner Link'}
                    </button>
                </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 p-4 text-center">
                    <p className="text-white/40 text-[8px] uppercase font-black tracking-widest mb-1">Total Network</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter leading-none mt-1">{profile?.referralCount || 0}</p>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 p-4 text-center">
                    <p className="text-emerald-400/60 text-[8px] uppercase font-black tracking-widest mb-1">Commision Earned</p>
                    <p className="text-2xl font-black text-emerald-400 italic tracking-tighter leading-none mt-1">${Number(profile?.totalReferralBonus || 0).toLocaleString()}</p>
                </div>
            </div>

            {/* Level Breakdown */}
            <div className="space-y-3 pb-10">
                {levels.map((tier) => (
                    <div key={tier.level} className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-[28px] overflow-hidden">
                        <button
                            onClick={() => setExpandedLevel(expandedLevel === tier.level ? null : tier.level)}
                            className="w-full p-5 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 text-sm italic">
                                    L{tier.level}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-black uppercase text-xs tracking-tight">{tier.title}</h4>
                                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-1">Status: Active</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase">
                                    {tier.bonus} Bonus
                                </div>
                                {expandedLevel === tier.level ? <ChevronUp className="text-white/20" /> : <ChevronDown className="text-white/20" />}
                            </div>
                        </button>

                        <AnimatePresence>
                            {expandedLevel === tier.level && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-white/5 px-5 py-4 bg-black/20"
                                >
                                    <p className="text-white/30 text-[10px] font-bold uppercase text-center italic py-4">
                                        No active partners found at this level yet.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
