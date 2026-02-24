
import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Logo from '../components/Logo';
import NotificationMenu from '../components/NotificationMenu';
import { INITIAL_CATEGORIES } from '../constants';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../../auth/auth.storage';
import { ROUTE_PATHS } from '../../../router/paths';
import '../styles/agent-dashboard.css';

interface Sale {
  id: string;
  biller: string;
  customer: string;
  amount: number;
  commission: number;
  time: string;
  icon: string;
  token?: string;
  units?: string;
}

interface FloatHistory {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: string;
}

const INITIAL_SALES: Sale[] = [
  { id: 'S-10293', biller: 'ZESA Electricity', customer: '0771 223 994', amount: 20.00, commission: 0.50, time: '2 mins ago', icon: 'bolt', token: '1922-3884-1002-3394-1102', units: '45.2 kWh' },
  { id: 'S-10292', biller: 'Econet Airtime', customer: '0772 445 112', amount: 5.00, commission: 0.25, time: '15 mins ago', icon: 'cell_tower' },
  { id: 'S-10291', biller: 'ZINWA Water', customer: 'ZW-991-001', amount: 35.00, commission: 0.88, time: '1 hour ago', icon: 'water_drop' },
];

const FLOAT_HISTORY: FloatHistory[] = [
  { id: 'FL-9920', date: 'May 23, 2024', amount: 500.00, method: 'EcoCash', status: 'Approved' },
  { id: 'FL-9918', date: 'May 20, 2024', amount: 200.00, method: 'Visa Card', status: 'Approved' },
  { id: 'FL-9912', date: 'May 15, 2024', amount: 1000.00, method: 'Bank Transfer', status: 'Approved' },
];

export function AgentDashboardPage() {
  const navigate = useNavigate();
  const agentName = 'Tinashe Chando';
  const onLogout = () => {
    clearAuthSession();
    navigate(ROUTE_PATHS.loginAgent, { replace: true });
  };
  const onAddFloat = () => setActiveTab('float');
  const onBulkSale = () => {
    setActiveTab('sell');
    setSellStep('select');
  };
  const [activeTab, setActiveTab] = useState<'overview' | 'sell' | 'commissions' | 'schedule' | 'float' | 'settings'>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [floatBalance, setFloatBalance] = useState(452.10);
  const [commissionBalance, setCommissionBalance] = useState(24.40);
  const [recentSales, setRecentSales] = useState<Sale[]>(INITIAL_SALES);
  
  // Sale Logic
  const [sellStep, setSellStep] = useState<'select' | 'details' | 'confirm' | 'success'>('select');
  const [sellForm, setSellForm] = useState({ billerId: '', billerName: '', customerRef: '', amount: '', catId: 'util' });
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payout Logic
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  // Settings Logic
  const [settingsConfig, setSettingsConfig] = useState({
    lowFloatAlerts: true,
    dailyEarningsSms: false
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  // Fulfillment Interaction Logic
  const [fulfillmentStatus, setFulfillmentStatus] = useState<string | null>(null);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: 'home' },
    { id: 'sell', label: 'Make a Sale', icon: 'point_of_sale' },
    { id: 'commissions', label: 'Earnings Analysis', icon: 'payments' },
    { id: 'schedule', label: 'Commission Schedule', icon: 'table_chart' },
    { id: 'float', label: 'Float Wallet', icon: 'account_balance_wallet' },
    { id: 'settings', label: 'Shop Profile', icon: 'settings' },
  ] as const;

  const handleAgentTabChange = (
    tab: 'overview' | 'sell' | 'commissions' | 'schedule' | 'float' | 'settings',
  ) => {
    setActiveTab(tab);
    setSellStep('select');
    setIsMobileNavOpen(false);
  };

  const billers = [
    { id: 'zesa', name: 'ZESA Electricity', icon: 'bolt', color: 'bg-orange-50 text-orange-600', catId: 'util' },
    { id: 'econet', name: 'Econet Airtime', icon: 'cell_tower', color: 'bg-red-50 text-red-600', catId: 'air' },
    { id: 'netone', name: 'NetOne Airtime', icon: 'signal_cellular_alt', color: 'bg-orange-50 text-orange-600', catId: 'air' },
    { id: 'telone', name: 'TelOne Internet', icon: 'wifi', color: 'bg-indigo-50 text-indigo-600', catId: 'net' },
  ];

  const getCommissionRate = (catId: string) => INITIAL_CATEGORIES.find(c => c.id === catId)?.agentRate || 2.0;

  const handleProcess = () => {
    const amt = parseFloat(sellForm.amount) || 0;
    if (amt > floatBalance) return alert("Insufficient Float!");
    setIsProcessing(true);
    
    // Simulate API delay
    setTimeout(() => {
      const comm = amt * (getCommissionRate(sellForm.catId) / 100);
      const isUtility = sellForm.catId === 'util';
      
      const newSale: Sale = {
        id: `S-${Math.floor(Math.random() * 90000)}`,
        biller: sellForm.billerName,
        customer: sellForm.customerRef,
        amount: amt,
        commission: comm,
        time: 'Just now',
        icon: billers.find(b => b.id === sellForm.billerId)?.icon || 'payments',
        token: isUtility ? `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        units: isUtility ? `${(amt * 2.2).toFixed(1)} kWh` : undefined
      };
      
      setFloatBalance(prev => prev - amt);
      setCommissionBalance(prev => prev + comm);
      setRecentSales([newSale, ...recentSales]);
      setLastSale(newSale);
      setIsProcessing(false);
      setSellStep('success');
    }, 1500);
  };

  const handleRequestPayout = () => {
    if (commissionBalance <= 0) return;
    setIsRequestingPayout(true);
    setTimeout(() => {
      setIsRequestingPayout(false);
      setPayoutRequested(true);
      setCommissionBalance(0);
      setTimeout(() => setPayoutRequested(false), 5000);
    }, 2000);
  };

  const handleFulfillAction = (type: string) => {
    setFulfillmentStatus(`Processing ${type}...`);
    setTimeout(() => {
      setFulfillmentStatus(`${type} Sent Successfully!`);
      setTimeout(() => setFulfillmentStatus(null), 3000);
    }, 1500);
  };

  const toggleSetting = (key: keyof typeof settingsConfig) => {
    setSettingsConfig(prev => {
      const newVal = !prev[key];
      // Show feedback immediately
      const label = key === 'dailyEarningsSms' ? 'Daily SMS report' : 'Low float alerts';
      setUpdateFeedback(`${label} ${newVal ? 'enabled' : 'disabled'}`);
      setTimeout(() => setUpdateFeedback(null), 3000);
      return { ...prev, [key]: newVal };
    });
  };

  const handleUpdateProfile = () => {
    setIsUpdatingProfile(true);
    setTimeout(() => {
      setIsUpdatingProfile(false);
      setUpdateFeedback('Shop profile updated successfully!');
      setTimeout(() => setUpdateFeedback(null), 4000);
    }, 1500);
  };

  const renderCommissions = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-accent-green p-10 rounded-[3rem] text-dark-text relative overflow-hidden shadow-2xl">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #131118 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
             <div className="relative z-10 flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-dark-text/40 mb-2">Unpaid Earnings</p>
                   <h3 className="text-5xl font-black tracking-tighter">${(commissionBalance || 0).toFixed(2)}</h3>
                   <button 
                     onClick={handleRequestPayout}
                     disabled={isRequestingPayout || payoutRequested || commissionBalance <= 0}
                     className={`mt-8 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 ${
                        payoutRequested ? 'bg-white text-accent-green border border-accent-green' : 'bg-dark-text text-white'
                     }`}
                   >
                     {isRequestingPayout ? (
                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                     ) : payoutRequested ? (
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                     ) : null}
                     {isRequestingPayout ? 'Processing...' : payoutRequested ? 'Payout Success' : 'Request Payout'}
                   </button>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center border border-white/30 backdrop-blur-md">
                   <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                </div>
             </div>
          </div>
          
          <div className="bg-white p-10 rounded-[3rem] border border-neutral-light shadow-sm flex flex-col justify-center gap-6">
             <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Earning Breakdown</h4>
             <div className="space-y-4">
                {INITIAL_CATEGORIES.map(cat => {
                  const rate = Number(cat.agentRate) || 0;
                  return (
                    <div key={cat.id} className="flex items-center justify-between">
                       <span className="text-xs font-bold text-neutral-text">{cat.label}</span>
                       <div className="flex items-center gap-4 flex-1 mx-4">
                          <div className="h-1.5 bg-neutral-light flex-1 rounded-full overflow-hidden">
                             <div style={{ width: `${Math.min(100, rate * 10)}%` }} className="bg-accent-green h-full"></div>
                          </div>
                       </div>
                       <span className="text-xs font-black text-dark-text">{rate.toFixed(1)}%</span>
                    </div>
                  );
                })}
             </div>
          </div>
       </div>

       <div className="bg-white rounded-[3rem] border border-neutral-light shadow-sm overflow-hidden">
          <div className="p-8 border-b border-neutral-light flex items-center justify-between bg-[#f8fafc]">
             <h4 className="text-lg font-black text-dark-text tracking-tight">Commission Ledger</h4>
             <button className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-sm">download</span> Export Ledger
             </button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-neutral-light/10">
                   <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Time</th>
                      <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Service</th>
                      <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Sale Amount</th>
                      <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">My Cut</th>
                      <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                   {recentSales.map(sale => (
                      <tr key={sale.id} className="hover:bg-[#f8fafc] transition-colors">
                         <td className="px-8 py-5 text-xs font-bold text-neutral-text">{sale.time}</td>
                         <td className="px-8 py-5">
                            <p className="text-sm font-black text-dark-text">{sale.biller}</p>
                            <p className="text-[10px] font-bold text-neutral-text uppercase">{sale.customer}</p>
                         </td>
                         <td className="px-8 py-5 text-right font-bold text-neutral-text">${(Number(sale.amount) || 0).toFixed(2)}</td>
                         <td className="px-8 py-5 text-right font-black text-accent-green">+${(Number(sale.commission) || 0).toFixed(2)}</td>
                         <td className="px-8 py-5 text-center">
                            <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase tracking-widest">Accrued</span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-12 rounded-[4rem] border border-neutral-light shadow-sm text-center space-y-4">
           <h3 className="text-3xl font-black text-dark-text tracking-tight">Your Earning Potential</h3>
           <p className="text-neutral-text font-medium">Earn attractive commissions on every utility, airtime and fee payment you process.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_CATEGORIES.map((cat) => (
            <div key={cat.id} className="bg-white p-10 rounded-[3.5rem] border border-neutral-light shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-background-light flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                </div>
                <div>
                   <h4 className="text-lg font-black text-dark-text">{cat.label}</h4>
                   <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Instant Settlement</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-neutral-text uppercase tracking-widest mb-1">Your Commission</p>
                 <p className="text-3xl font-black text-accent-green tracking-tighter">{cat.agentRate}%</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1e293b] p-12 rounded-[4rem] text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          <div className="relative z-10 space-y-4 max-w-xl">
             <h3 className="text-2xl font-black tracking-tight">Maximize Your Earnings</h3>
             <p className="text-slate-400 text-sm leading-relaxed">
               Did you know you can increase your daily payout by reaching <span className="text-accent-green font-bold">Elite Agent</span> status? Process more than 100 transactions monthly to unlock premium rates.
             </p>
          </div>
          <button className="relative z-10 bg-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
             View Achievements
          </button>
        </div>
      </div>
    </div>
  );

  const renderFloat = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="bg-[#1e293b] p-12 rounded-[4rem] text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          <div className="relative z-10">
             <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Active Float Balance</p>
             <h3 className="text-6xl font-black tracking-tighter">${(floatBalance || 0).toFixed(2)}</h3>
             <p className="text-xs font-bold text-accent-green mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">bolt</span>
                Ready for instant sales
             </p>
          </div>
          <button 
             onClick={onAddFloat}
             className="relative z-10 bg-primary px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
          >
             <span className="material-symbols-outlined text-lg">add_circle</span>
             Replenish Float
          </button>
       </div>

       <div className="bg-white rounded-[3rem] border border-neutral-light shadow-sm overflow-hidden">
          <div className="p-8 border-b border-neutral-light flex items-center justify-between">
             <h4 className="text-lg font-black text-dark-text tracking-tight">Float History</h4>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-neutral-light/10">
                   <tr>
                      <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Date</th>
                      <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Reference</th>
                      <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">Method</th>
                      <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Amount</th>
                      <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                   {FLOAT_HISTORY.map(f => (
                      <tr key={f.id} className="hover:bg-[#f8fafc] transition-colors">
                         <td className="px-10 py-6 text-sm font-bold text-dark-text">{f.date}</td>
                         <td className="px-10 py-6 text-xs font-mono font-bold text-primary">{f.id}</td>
                         <td className="px-10 py-6 text-sm text-neutral-text font-medium">{f.method}</td>
                         <td className="px-10 py-6 text-right font-black text-dark-text">${(Number(f.amount) || 0).toFixed(2)}</td>
                         <td className="px-10 py-6 text-center">
                            <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase tracking-widest">{f.status}</span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl space-y-10 animate-in fade-in duration-500 relative">
      {updateFeedback && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10">
           <div className="bg-dark-text text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-white/10">
              <span className="material-symbols-outlined text-accent-green">check_circle</span>
              <span className="text-sm font-bold tracking-tight">{updateFeedback}</span>
           </div>
        </div>
      )}

      <section className="bg-white p-12 rounded-[4rem] border border-neutral-light shadow-sm space-y-10">
         <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest border-b border-neutral-light pb-2">Business Information</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-neutral-text uppercase">Shop Name</label>
               <input type="text" defaultValue="TC General Store" className="w-full bg-[#f8fafc] border-none rounded-2xl p-4 text-sm font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-neutral-text uppercase">Location</label>
               <input type="text" defaultValue="Harare CBD" className="w-full bg-[#f8fafc] border-none rounded-2xl p-4 text-sm font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-neutral-text uppercase">Agent Owner</label>
               <input type="text" defaultValue={agentName} className="w-full bg-[#f8fafc] border-none rounded-2xl p-4 text-sm font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-neutral-text uppercase">Mobile Number</label>
               <input type="tel" defaultValue="+263 771 223 994" className="w-full bg-[#f8fafc] border-none rounded-2xl p-4 text-sm font-bold" />
            </div>
         </div>
      </section>

      <section className="bg-white p-12 rounded-[4rem] border border-neutral-light shadow-sm space-y-10">
         <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest border-b border-neutral-light pb-2">Preferences</h4>
         <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-3xl group transition-all">
               <div>
                  <p className="text-sm font-bold text-dark-text">Low Float Alerts</p>
                  <p className="text-[10px] text-neutral-text font-medium">Notify when float falls below $50.</p>
               </div>
               <button 
                 onClick={() => toggleSetting('lowFloatAlerts')}
                 className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settingsConfig.lowFloatAlerts ? 'bg-primary' : 'bg-neutral-light'}`}
               >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settingsConfig.lowFloatAlerts ? 'right-1' : 'left-1'}`}></div>
               </button>
            </div>
            <div className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-3xl group transition-all">
               <div>
                  <p className="text-sm font-bold text-dark-text">Daily Earnings SMS</p>
                  <p className="text-[10px] text-neutral-text font-medium">Receive a summary of today's commissions.</p>
               </div>
               <button 
                 onClick={() => toggleSetting('dailyEarningsSms')}
                 className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settingsConfig.dailyEarningsSms ? 'bg-primary' : 'bg-neutral-light'}`}
               >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settingsConfig.dailyEarningsSms ? 'right-1' : 'left-1'}`}></div>
               </button>
            </div>
         </div>
      </section>

      <div className="flex justify-end pt-4">
         <button 
           onClick={handleUpdateProfile}
           disabled={isUpdatingProfile}
           className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
         >
            {isUpdatingProfile && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
            {isUpdatingProfile ? 'Updating Shop...' : 'Update Shop Profile'}
         </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light font-display text-dark-text flex">
      <aside className="hidden md:flex w-64 bg-white border-r border-neutral-light flex-col h-screen shrink-0 sticky top-0">
        <div className="p-8"><Logo className="h-9" /></div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleAgentTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-neutral-text hover:bg-neutral-light'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 mt-auto"><button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50"><span className="material-symbols-outlined">logout</span>Exit</button></div>
      </aside>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-[120] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/35"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close navigation"
          />
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-neutral-light rounded-b-[2rem] shadow-2xl p-5 pt-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-light">
              <Logo className="h-8" />
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-9 h-9 rounded-xl bg-neutral-light text-neutral-text flex items-center justify-center"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <nav className="pt-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAgentTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === item.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-neutral-text hover:bg-neutral-light'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 mt-2"
              >
                <span className="material-symbols-outlined">logout</span>
                Exit
              </button>
            </nav>
          </div>
        </div>
      ) : null}

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between sticky top-0 bg-background-light/80 backdrop-blur-md z-10 py-2">
           <div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen((prev) => !prev)}
                className="md:hidden mb-3 w-10 h-10 rounded-xl bg-white border border-neutral-light text-neutral-text flex items-center justify-center shadow-sm"
                aria-label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
              >
                <span className="material-symbols-outlined">
                  {isMobileNavOpen ? 'close' : 'menu'}
                </span>
              </button>
              <h2 className="text-3xl font-black tracking-tight">
                {activeTab === 'overview' ? 'Agent Overview' : 
                 activeTab === 'sell' ? 'Sales Console' : 
                 activeTab === 'commissions' ? 'Earnings Analysis' : 
                 activeTab === 'schedule' ? 'Commission Schedule' : 
                 activeTab === 'float' ? 'Float Wallet' : 'Shop Profile'}
              </h2>
              <p className="text-neutral-text font-medium mt-1">Partner Agent: {agentName}</p>
           </div>
           <div className="flex items-center gap-6">
              {onBulkSale && (
                <button 
                  onClick={onBulkSale}
                  className="bg-accent-green text-dark-text px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-accent-green/10"
                >
                  <span className="material-symbols-outlined text-lg">batch_prediction</span>
                  BULK SALE
                </button>
              )}
              <div className="text-right hidden md:block">
                 <p className="text-[10px] font-black text-neutral-text/50 uppercase tracking-widest">AVAILABLE FLOAT</p>
                 <p className="text-lg font-black text-primary tracking-tighter">${(floatBalance || 0).toFixed(2)}</p>
              </div>
              <NotificationMenu onReplenishFloat={onAddFloat} />
           </div>
        </div>

        <div className="pb-12">
          {activeTab === 'overview' && (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <StatCard label="Total Sales Today" value={`$${(recentSales.reduce((a, b) => a + (Number(b.amount) || 0), 0) || 0).toFixed(2)}`} change="+12.4% vs ytd" icon="shopping_cart" iconBg="bg-blue-100" iconColor="text-blue-600" chartPath="M0 25 L 50 10 L 100 20" strokeColor="#3b82f6" />
                   <StatCard label="Today's Earnings" value={`$${(recentSales.reduce((a, b) => a + (Number(b.commission) || 0), 0) || 0).toFixed(2)}`} change="Instant Accrual" icon="monetization_on" iconBg="bg-accent-green/10" iconColor="text-accent-green" chartPath="M0 20 Q 50 5, 100 15" strokeColor="#a3e635" />
                </div>
                
                {/* Recent Sales Table Snippet */}
                <div className="bg-white rounded-[3rem] border border-neutral-light shadow-sm overflow-hidden">
                   <div className="p-8 border-b border-neutral-light flex items-center justify-between">
                      <h4 className="text-lg font-black tracking-tight">Recent Sales Activity</h4>
                      <button onClick={() => setActiveTab('sell')} className="text-xs font-black text-primary uppercase tracking-widest hover:underline">New Sale</button>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-neutral-light/5">
                            <tr>
                               <th className="px-8 py-4 text-[9px] font-black text-neutral-text uppercase tracking-widest">Time</th>
                               <th className="px-8 py-4 text-[9px] font-black text-neutral-text uppercase tracking-widest">Customer</th>
                               <th className="px-8 py-4 text-[9px] font-black text-neutral-text uppercase tracking-widest">Service</th>
                               <th className="px-8 py-4 text-[9px] font-black text-neutral-text uppercase tracking-widest text-right">Amount</th>
                               <th className="px-8 py-4 text-[9px] font-black text-neutral-text uppercase tracking-widest text-right">Comm.</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-neutral-light">
                            {recentSales.slice(0, 3).map(sale => (
                               <tr key={sale.id}>
                                  <td className="px-8 py-5 text-xs font-bold text-neutral-text">{sale.time}</td>
                                  <td className="px-8 py-5 text-sm font-bold text-dark-text">{sale.customer}</td>
                                  <td className="px-8 py-5 text-xs font-bold text-neutral-text">{sale.biller}</td>
                                  <td className="px-8 py-5 text-right font-black text-dark-text">${(Number(sale.amount) || 0).toFixed(2)}</td>
                                  <td className="px-8 py-5 text-right font-black text-accent-green">+${(Number(sale.commission) || 0).toFixed(2)}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
          )}
          
          {activeTab === 'sell' && sellStep === 'select' && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4">
                {billers.map(b => (
                   <button key={b.id} onClick={() => { setSellForm({...sellForm, billerId: b.id, billerName: b.name, catId: b.catId}); setSellStep('details'); }} className="bg-white p-10 rounded-[3rem] border border-neutral-light hover:border-primary hover:shadow-2xl transition-all group flex flex-col items-center gap-4">
                      <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-transform group-hover:scale-110 ${b.color}`}><span className="material-symbols-outlined text-4xl">{b.icon}</span></div>
                      <h4 className="text-sm font-black text-dark-text">{b.name}</h4>
                      <p className="text-[10px] font-black text-accent-green uppercase tracking-widest">Earn {getCommissionRate(b.catId)}%</p>
                   </button>
                ))}
             </div>
          )}

          {activeTab === 'sell' && sellStep === 'details' && (
             <div className="max-w-2xl mx-auto bg-white p-16 rounded-[4rem] border border-neutral-light shadow-sm space-y-10 animate-in zoom-in-95">
                <div className="text-center space-y-2">
                   <h3 className="text-3xl font-black text-dark-text tracking-tight">Confirm Authorization</h3>
                   <p className="text-neutral-text font-medium">Verify customer information before authorizing float deduction.</p>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Customer Reference / Mobile</label>
                      <input type="text" placeholder="e.g. 0771***567" onChange={e => setSellForm({...sellForm, customerRef: e.target.value})} className="w-full bg-[#f8fafc] border-none rounded-2xl p-4 font-bold text-sm" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Amount to Deduct ($)</label>
                      <input type="number" placeholder="0.00" onChange={e => setSellForm({...sellForm, amount: e.target.value})} className="w-full bg-[#f8fafc] border-none rounded-2xl p-6 text-2xl font-black text-primary text-center" />
                   </div>
                </div>
                <div className="p-6 bg-accent-green/10 rounded-3xl border border-accent-green/20 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Estimated Commission</p>
                      <p className="text-xl font-black text-accent-green">+${( (parseFloat(sellForm.amount) || 0) * (getCommissionRate(sellForm.catId)/100)).toFixed(2)}</p>
                   </div>
                   <span className="material-symbols-outlined text-accent-green text-3xl">savings</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setSellStep('select')} className="py-4 rounded-2xl border border-neutral-light font-black text-[10px] uppercase">Cancel</button>
                   <button onClick={handleProcess} disabled={isProcessing} className="py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">{isProcessing ? 'Authorizing...' : 'Confirm Sale'}</button>
                </div>
             </div>
          )}

          {activeTab === 'sell' && sellStep === 'success' && (
             <div className="max-w-2xl mx-auto animate-in zoom-in duration-500 pb-20">
                <div className="bg-white rounded-[4rem] shadow-2xl border border-neutral-light overflow-hidden">
                   {/* Receipt Header */}
                   <div className="bg-primary/5 p-12 text-center border-b border-dashed border-neutral-light relative">
                      {/* Scalloped edge visual */}
                      <div className="absolute -bottom-2 left-0 w-full flex justify-around opacity-10">
                         {[...Array(20)].map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-dark-text"></div>)}
                      </div>
                      
                      <div className="w-20 h-20 bg-accent-green text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                         <span className="material-symbols-outlined text-4xl font-black">check</span>
                      </div>
                      <h3 className="text-3xl font-black text-dark-text tracking-tight">Payment Successful</h3>
                      <p className="text-neutral-text font-bold text-xs uppercase tracking-[0.2em] mt-2">Authorization ID: {lastSale?.id}</p>
                   </div>

                   {/* Fulfillment Block (Token) */}
                   {lastSale?.token && (
                      <div className="p-10 bg-slate-50 text-center space-y-4">
                         <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Voucher Token</p>
                         <div className="bg-white border-2 border-primary/20 rounded-3xl p-8 shadow-inner">
                            <p className="text-3xl md:text-4xl font-black text-dark-text tracking-tighter font-mono">{lastSale.token}</p>
                         </div>
                         <div className="flex justify-center gap-4">
                            <div className="px-4 py-2 bg-white rounded-full border border-neutral-light text-[10px] font-black text-neutral-text uppercase">Units: {lastSale.units}</div>
                            <div className="px-4 py-2 bg-white rounded-full border border-neutral-light text-[10px] font-black text-neutral-text uppercase">Biller: ZESA</div>
                         </div>
                      </div>
                   )}

                   {/* Receipt Details */}
                   <div className="p-12 space-y-8 relative">
                      {fulfillmentStatus && (
                         <div className="absolute top-0 left-0 w-full flex justify-center -translate-y-6">
                            <div className="bg-dark-text text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/10 animate-in slide-in-from-bottom-2">
                               {fulfillmentStatus}
                            </div>
                         </div>
                      )}
                      
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-text font-bold uppercase tracking-widest text-[10px]">Merchant</span>
                            <span className="text-dark-text font-black">{agentName}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-text font-bold uppercase tracking-widest text-[10px]">Customer Ref</span>
                            <span className="text-dark-text font-black">{lastSale?.customer}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-text font-bold uppercase tracking-widest text-[10px]">Date / Time</span>
                            <span className="text-dark-text font-black">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                         <div className="pt-4 border-t border-neutral-light flex justify-between items-center">
                            <span className="text-dark-text font-black uppercase tracking-widest text-xs">Total Amount Paid</span>
                            <span className="text-3xl font-black text-primary tracking-tighter">${(Number(lastSale?.amount) || 0).toFixed(2)}</span>
                         </div>
                      </div>

                      {/* Post-Sale Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                         <button 
                           onClick={() => handleFulfillAction('Thermal Receipt')}
                           className="flex flex-col items-center justify-center p-6 bg-background-light rounded-[2rem] hover:bg-neutral-light transition-all gap-2 group"
                         >
                            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">print</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Thermal Print</span>
                         </button>
                         <button 
                           onClick={() => handleFulfillAction('WhatsApp Message')}
                           className="flex flex-col items-center justify-center p-6 bg-background-light rounded-[2rem] hover:bg-neutral-light transition-all gap-2 group"
                         >
                            <span className="material-symbols-outlined text-green-600 group-hover:scale-110 transition-transform">share</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                         </button>
                         <button 
                           onClick={() => handleFulfillAction('SMS Confirmation')}
                           className="flex flex-col items-center justify-center p-6 bg-background-light rounded-[2rem] hover:bg-neutral-light transition-all gap-2 group"
                         >
                            <span className="material-symbols-outlined text-blue-600 group-hover:scale-110 transition-transform">sms</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Send SMS</span>
                         </button>
                      </div>

                      <div className="pt-8 flex flex-col gap-4">
                         <button 
                            onClick={() => setSellStep('select')}
                            className="w-full bg-dark-text text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3"
                         >
                            <span className="material-symbols-outlined">add_circle</span>
                            New Transaction
                         </button>
                         <button 
                            onClick={() => setActiveTab('overview')}
                            className="w-full py-4 text-neutral-text font-black text-[10px] uppercase tracking-widest hover:text-dark-text transition-colors"
                         >
                            Return to Dashboard
                         </button>
                      </div>
                   </div>
                </div>
                
                {/* Security footer for receipt */}
                <div className="mt-8 flex items-center justify-center gap-3 opacity-30">
                   <Logo className="h-5 grayscale" />
                   <div className="w-1 h-1 rounded-full bg-dark-text"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest">Blockchain Verified Receipt</span>
                </div>
             </div>
          )}

          {activeTab === 'commissions' && renderCommissions()}
          {activeTab === 'schedule' && renderSchedule()}
          {activeTab === 'float' && renderFloat()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  );
}


