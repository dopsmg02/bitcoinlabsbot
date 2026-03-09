import React, { useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { Wallet, ArrowDownLeft, ArrowUpRight, Copy, Check, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';

interface WalletViewProps {
    profile: any;
    onNotify?: (type: 'success' | 'error' | 'info', msg: string) => void;
    onWithdraw: (amount: number, address: string) => Promise<boolean>;
    onDeposit: (amount: number) => Promise<boolean>;
}

export const WalletView: React.FC<WalletViewProps> = ({ profile, onNotify, onWithdraw, onDeposit }) => {
    const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleWithdraw = async () => {
        if (!withdrawAmount || !withdrawAddress) return;
        setIsLoading(true);
        const success = await onWithdraw(Number(withdrawAmount), withdrawAddress);
        if (success) {
            setWithdrawAmount('');
            setWithdrawAddress('');
        }
        setIsLoading(false);
    };

    const handleDeposit = async () => {
        if (!depositAmount || Number(depositAmount) < 10) {
            if (onNotify) onNotify('error', 'Minimum deposit is $10');
            return;
        }
        setIsLoading(true);
        const success = await onDeposit(Number(depositAmount));
        if (success) {
            setDepositAmount('');
        }
        setIsLoading(false);
    };

    return (
        <framerMotion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-4 noise-filter"
        >
            <div className="mb-8">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Financial <span className="text-mint">Vault</span></h2>
                <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mt-1.5">Capital management protocol</p>
            </div>

            {/* Toggle (Tabs Design) */}
            <div className="flex bg-black/40 p-1.5 rounded-[28px] mb-10 border border-white/5 gap-1.5">
                <button
                    onClick={() => setActiveTab('DEPOSIT')}
                    className={`flex-1 py-4 rounded-[22px] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all
            ${activeTab === 'DEPOSIT' ? 'bg-white text-black shadow-2xl scale-100' : 'text-white/20 hover:text-white/40 scale-95'}
          `}
                >
                    <ArrowDownLeft size={18} strokeWidth={3} />
                    Deposit
                </button>
                <button
                    onClick={() => setActiveTab('WITHDRAW')}
                    className={`flex-1 py-4 rounded-[22px] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all
            ${activeTab === 'WITHDRAW' ? 'bg-white text-black shadow-2xl scale-100' : 'text-white/20 hover:text-white/40 scale-95'}
          `}
                >
                    <ArrowUpRight size={18} strokeWidth={3} />
                    Withdraw
                </button>
            </div>

            {activeTab === 'DEPOSIT' ? (
                <div className="space-y-6">
                    <div className="bg-zinc-950 border-2 border-white/5 rounded-[40px] p-8 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                            <ShieldCheck size={80} className="text-mint" />
                        </div>

                        <div className="relative z-10">
                            <div className="bg-mint/5 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-8 border-2 border-mint/10 shadow-[0_0_30px_rgba(0,255,157,0.05)]">
                                <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025" alt="USDT" className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2 leading-none">USDT BEP20</h3>
                            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] leading-relaxed px-4">
                                Min deposit: $10.00 • Instant Sync
                            </p>

                            <div className="mt-12 bg-black/40 p-8 rounded-[32px] border border-white/5 shadow-inner">
                                <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.4em] mb-6">Initialize Gateway</p>

                                {/* Deposit Amount Input */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                        <span className="text-white/40 font-black italic">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Amount (Min $10)"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        className="w-full bg-zinc-950/80 border-2 border-white/5 rounded-2xl py-5 pl-12 pr-5 text-white placeholder:text-white/20 font-black tracking-widest text-sm focus:outline-none focus:border-mint/50 transition-colors"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-2">
                                        <button onClick={() => setDepositAmount('50')} className="bg-white/5 hover:bg-white/10 text-white/40 text-[9px] font-black tracking-[0.2em] px-3 py-1.5 rounded-lg transition-colors">50</button>
                                        <button onClick={() => setDepositAmount('100')} className="bg-white/5 hover:bg-white/10 text-white/40 text-[9px] font-black tracking-[0.2em] px-3 py-1.5 rounded-lg transition-colors">100</button>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-mint text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] shadow-2xl active:scale-95 transition-all shadow-mint/10 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                                    onClick={handleDeposit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin opacity-50" /> : 'Generate Invoice'}
                                </button>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-3 text-[10px] text-mint/40 font-black uppercase tracking-widest">
                                <Check size={16} strokeWidth={3} />
                                Network Fee: ~0.15 USDT
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-[10px] text-indigo-300/60 italic text-center leading-relaxed">
                        * Please ensure you send USDT using the Binance Smart Chain (BEP20) network only. Funds sent via other networks like TRC20 or ERC20 may be lost forever.
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-zinc-950 border-2 border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Liquid Assets</p>
                                    <h3 className="text-4xl font-black text-white italic tracking-tighter leading-none">${Number(profile?.btclBalance || 0).toFixed(2)}</h3>
                                </div>
                                <div className="bg-mint/5 p-4 rounded-2xl border-2 border-mint/10 shadow-[0_0_20px_rgba(0,255,157,0.05)]">
                                    <Wallet className="text-mint w-7 h-7" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Withdrawal Amount ($)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-black focus:border-indigo-500 transition-all outline-none placeholder:text-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Destination BSC Address</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="0x..."
                                            value={withdrawAddress}
                                            onChange={(e) => setWithdrawAddress(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-12 text-white font-black focus:border-indigo-500 transition-all outline-none text-xs placeholder:text-white/10"
                                        />
                                        <button
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 opacity-40 hover:opacity-100 transition-opacity"
                                            onClick={async () => { const text = await navigator.clipboard.readText(); setWithdrawAddress(text); }}
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button
                                        disabled={isLoading || !withdrawAmount || !withdrawAddress.startsWith('0x')}
                                        onClick={handleWithdraw}
                                        className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-20 disabled:grayscale"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                Execute Settlement
                                                <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/40 p-4 rounded-3xl border border-white/5 text-center">
                            <p className="text-white/30 text-[8px] uppercase font-black tracking-widest mb-1">Withdrawal Fee</p>
                            <p className="text-white font-black text-sm">$1.00</p>
                        </div>
                        <div className="bg-slate-900/40 p-4 rounded-3xl border border-white/5 text-center">
                            <p className="text-white/30 text-[8px] uppercase font-black tracking-widest mb-1">Processing</p>
                            <p className="text-white font-black text-sm">~ 1-12 Hours</p>
                        </div>
                    </div>
                </div>
            )}
        </framerMotion.div>
    );
};
