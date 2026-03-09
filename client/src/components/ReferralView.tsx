import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface ReferralViewProps {
    profile: any;
    onNotify?: (type: 'success' | 'error' | 'info', msg: string) => void;
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
            className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-4 noise-filter"
        >
            <div className="mb-8">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Affiliate <span className="text-mint">Engine</span></h2>
                <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mt-1.5">Network expansion protocol</p>
            </div>

            {/* Referral Link Card (High Contrast Tech) */}
            <div className="bg-white text-black p-10 rounded-[40px] shadow-2xl mb-8 relative overflow-hidden border-4 border-white">
                <div className="absolute top-0 right-0 w-32 h-full bg-mint skew-x-[-15deg] translate-x-12 opacity-5 pointer-events-none" />

                <div className="relative z-10 text-center">
                    <h3 className="text-3xl font-black text-black italic tracking-tighter uppercase mb-2 leading-none">Global Extension</h3>
                    <p className="text-black/40 text-[9px] font-black uppercase tracking-[0.2em] mb-10">Commission matrix: 5-Tier Level Deep</p>

                    <div className="bg-black/5 rounded-2xl p-5 border border-black/10 flex items-center justify-between mb-8">
                        <p className="text-black font-mono text-[11px] font-bold truncate max-w-[75%]">{inviteLink}</p>
                        <button onClick={copyLink} className="text-black p-2 hover:bg-black/10 rounded-xl transition-colors">
                            {copied ? <Check className="text-mint" size={20} strokeWidth={3} /> : <Copy size={20} strokeWidth={3} />}
                        </button>
                    </div>

                    <button onClick={copyLink} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                        <Link size={18} strokeWidth={3} />
                        {copied ? 'Link Synchronized' : 'Generate Partner Link'}
                    </button>
                </div>
            </div>

            {/* Rewards Grid (Obsidian) */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-zinc-950 rounded-[32px] border border-white/5 p-6 text-center">
                    <p className="text-white/20 text-[8px] uppercase font-black tracking-widest mb-2">Network Size</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{profile?.referralCount || 0}</p>
                </div>
                <div className="bg-zinc-950 rounded-[32px] border border-white/5 p-6 text-center">
                    <p className="text-mint/40 text-[8px] uppercase font-black tracking-widest mb-2">Generated Yield</p>
                    <p className="text-3xl font-black text-mint italic tracking-tighter leading-none">${Number(profile?.totalReferralBonus || 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="space-y-4 pb-12">
                {levels.map((tier) => (
                    <div key={tier.level} className="bg-zinc-950 border border-white/5 rounded-[32px] overflow-hidden">
                        <button
                            onClick={() => setExpandedLevel(expandedLevel === tier.level ? null : tier.level)}
                            className="w-full p-6 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-white text-sm italic border border-white/10">
                                    {tier.level}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-black uppercase text-[11px] tracking-widest">{tier.title}</h4>
                                    <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.2em] mt-1.5">Authorization: Level {tier.level}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="bg-mint/5 px-4 py-2 rounded-full border border-mint/10 text-mint font-black text-[10px] uppercase tracking-widest">
                                    {tier.bonus}
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
                                    <p className="text-white/10 text-[9px] font-black uppercase text-center tracking-[0.4em] py-8">
                                        Data stream empty
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
