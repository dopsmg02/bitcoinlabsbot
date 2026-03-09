import React, { useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { Wallet, ArrowDownLeft, ArrowUpRight, Copy, Check, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';

interface WalletViewProps {
    profile: any;
    onNotify?: (type: 'success' | 'error' | 'info', msg: string) => void;
    onWithdraw: (amount: number, address: string) => Promise<boolean>;
}

export const WalletView: React.FC<WalletViewProps> = ({ profile, onNotify, onWithdraw }) => {
    const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
    const [copied, setCopied] = useState(false);
    const [withdrawAddress, setWithdrawAddress] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const copyAddress = (addr: string) => {
        navigator.clipboard.writeText(addr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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

    return (
        <framerMotion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-1"
        >
            <div className="mb-6 px-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Financial <span className="text-indigo-400">Vault</span></h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Manage your funds securely</p>
            </div>

            {/* Toggle */}
            <div className="flex bg-slate-900/40 p-1 rounded-3xl mb-8 border border-white/5">
                <button
                    onClick={() => setActiveTab('DEPOSIT')}
                    className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all
            ${activeTab === 'DEPOSIT' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/40 hover:text-white'}
          `}
                >
                    <ArrowDownLeft size={16} />
                    Deposit
                </button>
                <button
                    onClick={() => setActiveTab('WITHDRAW')}
                    className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all
            ${activeTab === 'WITHDRAW' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/40 hover:text-white'}
          `}
                >
                    <ArrowUpRight size={16} />
                    Withdraw
                </button>
            </div>

            {activeTab === 'DEPOSIT' ? (
                <div className="space-y-6">
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-[40px] p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-20"><ShieldCheck size={64} className="text-indigo-400" /></div>

                        <div className="relative z-10">
                            <div className="bg-indigo-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                                <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025" alt="USDT" className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">USDT BEP20 Deposit</h3>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed px-4">
                                All deposits are processed automatically via Plisio gateway. Min deposit: $10.00
                            </p>

                            <div className="mt-10 bg-black/40 p-5 rounded-3xl border border-white/10">
                                <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-4">Request New Address</p>
                                <button
                                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                                    onClick={() => onNotify?.('info', 'Deposit gateway initializing...')}
                                >
                                    Generate Payment
                                </button>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-emerald-400 font-bold uppercase">
                                <Check size={14} />
                                Network Fee: ~0.15 USDT (BSC)
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-[10px] text-indigo-300/60 italic text-center leading-relaxed">
                        * Please ensure you send USDT using the Binance Smart Chain (BEP20) network only. Funds sent via other networks like TRC20 or ERC20 may be lost forever.
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-[40px] p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Available for Payout</p>
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter">${Number(profile?.balance || 0).toFixed(2)}</h3>
                                </div>
                                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                                    <Wallet className="text-emerald-400" />
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

                                <div className="pt-4">
                                    <button
                                        disabled={isLoading || !withdrawAmount || !withdrawAddress.startsWith('0x')}
                                        onClick={handleWithdraw}
                                        className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-30 disabled:grayscale"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                Submit Payout
                                                <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
