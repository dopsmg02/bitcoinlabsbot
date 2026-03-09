import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home,
  TrendingUp,
  Users,
  Wallet as WalletIcon,
  History as HistoryIcon,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  Bell
} from 'lucide-react';

import { useHyipEngine } from './hooks/useHyipEngine';
import { DashboardView } from './components/DashboardView';
import { InvestmentView } from './components/InvestmentView';
import { ReferralView } from './components/ReferralView';
import { WalletView } from './components/WalletView';
import { HistoryView } from './components/HistoryView';

type Tab = 'HOME' | 'INVEST' | 'FRIENDS' | 'WALLET' | 'HISTORY' | 'ADMIN';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [showNotification, setShowNotification] = useState<{ type: string, msg: string } | null>(null);

  const notify = (type: 'success' | 'error' | 'info', msg: string) => {
    setShowNotification({ type, msg });
    setTimeout(() => setShowNotification(null), 4000);
  };

  const {
    isInitializing,
    profile,
    plans,
    myInvestments,
    history,
    initError,
    isActionLoading,
    refreshAll,
    invest,
    spinWheel,
    withdraw,
    simulateDevLogin
  } = useHyipEngine(notify);

  // Fake Live Ticker (Premium HYIP Feel)
  const [ticker, setTicker] = useState("System: Welcome to Supreme Investments. Earn up to 2.5% daily!");
  useEffect(() => {
    const messages = [
      "New Deposit: @crypto_whale just staked $1,250 in VIP Gold Pool",
      "Payout Success: @jack_0x withdrawn $450.20 to BEP20 wallet",
      "Announcement: Lucky Wheel multipliers are active for 2 hours!",
      "System: New 5-level referral bonus program is now live",
      "Market Update: USDT BEP20 is the preferred network for fast settlements"
    ];
    let i = 0;
    const interval = setInterval(() => {
      setTicker(messages[i % messages.length]);
      i++;
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  if (initError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
        <div className="bg-rose-500/10 p-6 rounded-[40px] border border-rose-500/20 mb-6 w-full max-w-sm">
          <ShieldCheck className="text-rose-500 w-16 h-16 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Security Block</h1>
          <p className="text-rose-400/80 text-[10px] font-bold uppercase tracking-widest mt-4 leading-relaxed">{initError}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Re-establish Session
        </button>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-500/5 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LayoutDashboard className="text-indigo-500 animate-pulse" size={32} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-black italic uppercase tracking-[0.3em] text-[10px] animate-pulse">Establishing Secure Connection</p>
          <p className="text-white/20 font-bold uppercase tracking-widest text-[8px] mt-2">Loading financial modules...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME': return <DashboardView profile={profile} myInvestments={myInvestments} onNavigate={setActiveTab} onSpinWheel={spinWheel} />;
      case 'INVEST': return <InvestmentView plans={plans} myInvestments={myInvestments} isActionLoading={isActionLoading} onInvest={invest} />;
      case 'FRIENDS': return <ReferralView profile={profile} onNotify={notify} />;
      case 'WALLET': return <WalletView profile={profile} onNotify={notify} onWithdraw={withdraw} />;
      case 'HISTORY': return <HistoryView history={history} refreshAll={refreshAll} />;
      default: return <DashboardView profile={profile} myInvestments={myInvestments} onNavigate={setActiveTab} onSpinWheel={spinWheel} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col relative select-none">

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Header / Ticker */}
      <header className="relative z-30 px-6 pt-8 pb-2">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white italic shadow-[0_8px_20px_rgba(79,70,229,0.3)] border border-white/10">S</div>
            <div className="flex flex-col">
              <span className="font-black text-lg italic tracking-tighter uppercase leading-none">Supreme<span className="text-indigo-400">INV</span></span>
              <span className="text-white/20 text-[7px] font-black uppercase tracking-[0.2em] mt-1">Institutional Grade</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile?.role === 'ADMIN' && (
              <button className="bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-white/5 text-white/40 hover:text-white transition-colors">
                <Settings size={18} />
              </button>
            )}
            <button className="bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-white/5 text-white/40 hover:text-white transition-colors relative">
              <Bell size={18} />
              <div className="absolute top-3 right-3 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950 shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
            </button>
          </div>
        </div>

        {/* Ticker Bar (Glassmorphism) */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-3 overflow-hidden shadow-xl mb-4">
          <div className="flex items-center gap-4 whitespace-nowrap overflow-hidden">
            <TrendingUp size={14} className="text-indigo-400 shrink-0" />
            <div className="animate-marquee inline-block">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-100/60">
                {ticker} • {ticker} • {ticker}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-5 relative z-20 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 flex flex-col min-h-0"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Floating Center Bar) */}
      <div className="fixed bottom-10 left-8 right-8 z-[60]">
        <nav className="bg-slate-900/70 backdrop-blur-3xl border border-white/10 rounded-[40px] p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <NavButton icon={<Home size={22} />} active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} />
          <NavButton icon={<TrendingUp size={22} />} active={activeTab === 'INVEST'} onClick={() => setActiveTab('INVEST')} />
          <NavButton icon={<Users size={22} />} active={activeTab === 'FRIENDS'} onClick={() => setActiveTab('FRIENDS')} />
          <NavButton icon={<WalletIcon size={22} />} active={activeTab === 'WALLET'} onClick={() => setActiveTab('WALLET')} />
          <NavButton icon={<HistoryIcon size={22} />} active={activeTab === 'HISTORY'} onClick={() => setActiveTab('HISTORY')} />
        </nav>
      </div>

      {/* Global Notifications (Toast) */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-32 left-8 right-8 z-[100] p-5 rounded-3xl border shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center gap-4
              ${showNotification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}
            `}
          >
            <div className={`p-2 rounded-xl ${showNotification.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              <ShieldCheck size={20} />
            </div>
            <p className="font-black uppercase text-[10px] tracking-widest leading-none">{showNotification.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev Simulator (ONLY localhost) */}
      {window.location.hostname === 'localhost' && !profile && (
        <div className="fixed top-1/2 left-4 z-[200]">
          <button
            onClick={simulateDevLogin}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-2xl border border-white/20 hover:bg-indigo-500 transition-all uppercase tracking-widest"
          >
            Dev Session Bypass
          </button>
        </div>
      )}
    </div>
  );
}

function NavButton({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative p-5 rounded-[28px] transition-all flex items-center justify-center flex-1
        ${active ? 'bg-white text-slate-900 shadow-[0_8px_30px_rgba(255,255,255,0.2)]' : 'text-slate-400 hover:text-white'}
      `}
    >
      <motion.div
        animate={active ? { scale: 1.1 } : { scale: 1 }}
      >
        {icon}
      </motion.div>
      {active && (
        <motion.div
          layoutId="nav-pill"
          className="absolute -bottom-2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,1)]"
        />
      )}
    </button>
  );
}
