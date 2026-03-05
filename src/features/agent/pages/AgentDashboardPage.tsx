
import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../../../components/ui/StatCard';
import { DataTable, type TableColumn } from '../../../components/ui';
import { INITIAL_CATEGORIES } from '../constants';
import { useSearchParams } from 'react-router-dom';
import UserProfile from '../../admin/components/UserProfile';
import { getAuthSession, saveAuthSession } from '../../auth/auth.storage';
import { getCurrentUserProfile } from '../../auth/auth.service';
import type { UserProfileDto } from '../../auth/dto/auth.dto';
import { getAgentWalletBalance, getAgentWalletHistory, type WalletHistoryEntry } from '../services/agent.service';
import Logo from '../../../components/ui/Logo';
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

const INITIAL_SALES: Sale[] = [
  { id: 'S-10293', biller: 'ZESA Electricity', customer: '0771 223 994', amount: 20.00, commission: 0.50, time: '2 mins ago', icon: 'bolt', token: '1922-3884-1002-3394-1102', units: '45.2 kWh' },
  { id: 'S-10292', biller: 'Econet Airtime', customer: '0772 445 112', amount: 5.00, commission: 0.25, time: '15 mins ago', icon: 'cell_tower' },
  { id: 'S-10291', biller: 'ZINWA Water', customer: 'ZW-991-001', amount: 35.00, commission: 0.88, time: '1 hour ago', icon: 'water_drop' },
];

const FALLBACK_FLOAT_HISTORY: WalletHistoryEntry[] = [
  { id: 'FL-9920', date: 'May 23, 2024', amount: 500.00, method: 'EcoCash', status: 'Approved' },
  { id: 'FL-9918', date: 'May 20, 2024', amount: 200.00, method: 'Visa Card', status: 'Approved' },
  { id: 'FL-9912', date: 'May 15, 2024', amount: 1000.00, method: 'Bank Transfer', status: 'Approved' },
];

// Commission Ledger table columns
const commissionColumns: TableColumn<Sale>[] = [
  {
    key: 'time',
    header: 'Time',
    render: (sale) => <span className="text-xs font-bold text-neutral-text">{sale.time}</span>,
  },
  {
    key: 'service',
    header: 'Service',
    render: (sale) => (
      <div>
        <p className="text-sm font-black text-dark-text">{sale.biller}</p>
        <p className="text-[10px] font-bold text-neutral-text uppercase">{sale.customer}</p>
      </div>
    ),
  },
  {
    key: 'saleAmount',
    header: 'Sale Amount',
    align: 'right',
    render: (sale) => <span className="font-bold text-neutral-text">${(Number(sale.amount) || 0).toFixed(2)}</span>,
  },
  {
    key: 'myCut',
    header: 'My Cut',
    align: 'right',
    render: (sale) => <span className="font-black text-accent-green">+${(Number(sale.commission) || 0).toFixed(2)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: () => (
      <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase tracking-widest">Accrued</span>
    ),
  },
];

// Float History table columns
const floatHistoryColumns: TableColumn<WalletHistoryEntry>[] = [
  {
    key: 'date',
    header: 'Date',
    render: (f) => <span className="text-sm font-bold text-dark-text">{String(f.date ?? '—')}</span>,
  },
  {
    key: 'reference',
    header: 'Reference',
    render: (f) => <span className="text-xs font-mono font-bold text-primary">{String(f.id ?? '—')}</span>,
  },
  {
    key: 'method',
    header: 'Method',
    render: (f) => <span className="text-sm text-neutral-text font-medium">{String(f.method ?? '—')}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (f) => <span className="font-black text-dark-text">${(Number(f.amount) || 0).toFixed(2)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (f) => (
      <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase tracking-widest">{String(f.status ?? '—')}</span>
    ),
  },
];

// Recent Sales table columns
const recentSalesColumns: TableColumn<Sale>[] = [
  {
    key: 'time',
    header: 'Time',
    render: (sale) => <span className="text-xs font-bold text-neutral-text">{sale.time}</span>,
  },
  {
    key: 'customer',
    header: 'Customer',
    render: (sale) => <span className="text-sm font-bold text-dark-text">{sale.customer}</span>,
  },
  {
    key: 'service',
    header: 'Service',
    render: (sale) => <span className="text-xs font-bold text-neutral-text">{sale.biller}</span>,
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (sale) => <span className="font-black text-dark-text">${(Number(sale.amount) || 0).toFixed(2)}</span>,
  },
  {
    key: 'commission',
    header: 'Comm.',
    align: 'right',
    render: (sale) => <span className="font-black text-accent-green">+${(Number(sale.commission) || 0).toFixed(2)}</span>,
  },
];

export function AgentDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);
  const agentName = useMemo(() => {
    const first = profile?.firstName ?? '';
    const last = profile?.lastName ?? '';
    return `${first} ${last}`.trim() || profile?.username || 'Agent';
  }, [profile]);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
    setSellStep('select');
  };

  const onAddFloat = () => setTab('float');
  const onBulkSale = () => {
    setTab('sell');
    setSellStep('select');
  };

  const [floatBalance, setFloatBalance] = useState(452.10);
  const [floatLoading, setFloatLoading] = useState(true);
  const [commissionBalance, setCommissionBalance] = useState(24.40);
  const [recentSales, setRecentSales] = useState<Sale[]>(INITIAL_SALES);

  // Float history — null means "not yet fetched"
  const [floatHistory, setFloatHistory] = useState<WalletHistoryEntry[] | null>(null);

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

  useEffect(() => {
    if (profile) return;
    let mounted = true;
    getCurrentUserProfile()
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        if (session) saveAuthSession({ ...session, profile: data });
      })
      .catch(() => { if (mounted) setProfile(null); });
    return () => { mounted = false; };
  }, [profile, session]);

  // Fetch wallet balance on mount
  useEffect(() => {
    let mounted = true;
    getAgentWalletBalance()
      .then((data) => {
        if (mounted) setFloatBalance(data.balance ?? 452.10);
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => { if (mounted) setFloatLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Fetch wallet history when float tab is visited (first visit only)
  useEffect(() => {
    if (activeTab !== 'float' || floatHistory !== null) return;
    let mounted = true;
    getAgentWalletHistory()
      .then((data) => {
        if (mounted) setFloatHistory(data.length > 0 ? data : FALLBACK_FLOAT_HISTORY);
      })
      .catch(() => { if (mounted) setFloatHistory(FALLBACK_FLOAT_HISTORY); });
    return () => { mounted = false; };
  }, [activeTab, floatHistory]);

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
          <div className="bg-accent-green p-10 rounded-xl text-dark-text relative overflow-hidden shadow-2xl">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #131118 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
             <div className="relative z-10 flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-dark-text/40 mb-2">Unpaid Earnings</p>
                   <h3 className="text-5xl font-black tracking-tighter">${(commissionBalance || 0).toFixed(2)}</h3>
                   <button
                     onClick={handleRequestPayout}
                     disabled={isRequestingPayout || payoutRequested || commissionBalance <= 0}
                     className={`mt-8 px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 ${
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
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-md">
                   <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-xl border border-neutral-light shadow-sm flex flex-col justify-center gap-6">
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

       <div className="space-y-2">
          <div className="flex items-center justify-between">
             <h4 className="text-lg font-black text-dark-text tracking-tight">Commission Ledger</h4>
             <button className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-sm">download</span> Export Ledger
             </button>
          </div>
          <DataTable
             columns={commissionColumns}
             data={recentSales}
             rowKey={(sale) => sale.id}
             emptyMessage="No commissions yet"
             emptyIcon="account_balance"
          />
       </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-10 rounded-xl border border-neutral-light shadow-sm text-center space-y-4">
           <h3 className="text-3xl font-black text-dark-text tracking-tight">Your Earning Potential</h3>
           <p className="text-neutral-text font-medium">Earn attractive commissions on every utility, airtime and fee payment you process.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_CATEGORIES.map((cat) => (
            <div key={cat.id} className="bg-white p-8 rounded-xl border border-neutral-light shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-lg bg-background-light flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
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

        <div className="bg-[#1e293b] p-10 rounded-xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          <div className="relative z-10 space-y-4 max-w-xl">
             <h3 className="text-2xl font-black tracking-tight">Maximize Your Earnings</h3>
             <p className="text-slate-400 text-sm leading-relaxed">
               Did you know you can increase your daily payout by reaching <span className="text-accent-green font-bold">Elite Agent</span> status? Process more than 100 transactions monthly to unlock premium rates.
             </p>
          </div>
          <button className="relative z-10 bg-primary text-white px-10 py-4 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
             View Achievements
          </button>
        </div>
      </div>
    </div>
  );

  const renderFloat = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="bg-[#1e293b] p-10 rounded-xl text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          <div className="relative z-10">
             <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Active Float Balance</p>
             {floatLoading ? (
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-2xl animate-spin text-white/50">sync</span>
                 <span className="text-white/50 font-bold text-lg">Loading...</span>
               </div>
             ) : (
               <h3 className="text-6xl font-black tracking-tighter">${(floatBalance || 0).toFixed(2)}</h3>
             )}
             <p className="text-xs font-bold text-accent-green mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">bolt</span>
                Ready for instant sales
             </p>
          </div>
          <button
             onClick={onAddFloat}
             className="relative z-10 bg-primary px-10 py-5 rounded-lg font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
          >
             <span className="material-symbols-outlined text-lg">add_circle</span>
             Replenish Float
          </button>
       </div>

       <div className="space-y-2">
          <h4 className="text-lg font-black text-dark-text tracking-tight">Float History</h4>
          <DataTable
            columns={floatHistoryColumns}
            data={floatHistory ?? []}
            rowKey={(f) => String(f.id)}
            loading={floatHistory === null}
            emptyMessage="No float history"
            emptyIcon="history"
          />
       </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl space-y-10 animate-in fade-in duration-500 relative">
      {updateFeedback && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10">
           <div className="bg-dark-text text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10">
              <span className="material-symbols-outlined text-accent-green">check_circle</span>
              <span className="text-sm font-bold tracking-tight">{updateFeedback}</span>
           </div>
        </div>
      )}

      <section className="bg-white p-8 rounded-xl border border-neutral-light shadow-sm space-y-8">
         <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest border-b border-neutral-light pb-2">Business Information</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-neutral-text uppercase">Shop Name</label>
               <input type="text" defaultValue={profile?.shopName ?? ''} className="portal-input-base w-full rounded-xl px-4 py-3 text-sm font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-neutral-text uppercase">Location</label>
               <input type="text" defaultValue={profile?.shopLocation ?? ''} className="portal-input-base w-full rounded-xl px-4 py-3 text-sm font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-neutral-text uppercase">Agent Owner</label>
               <input type="text" defaultValue={agentName} className="portal-input-base w-full rounded-xl px-4 py-3 text-sm font-bold" />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-neutral-text uppercase">Mobile Number</label>
               <input type="tel" defaultValue={profile?.phoneNumber ?? ''} className="portal-input-base w-full rounded-xl px-4 py-3 text-sm font-bold" />
            </div>
         </div>
      </section>

      <section className="bg-white p-8 rounded-xl border border-neutral-light shadow-sm space-y-8">
         <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest border-b border-neutral-light pb-2">Preferences</h4>
         <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-[#f8fafc] rounded-lg group transition-all">
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
            <div className="flex items-center justify-between p-5 bg-[#f8fafc] rounded-lg group transition-all">
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
           className="bg-primary text-white px-12 py-5 rounded-lg font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
         >
            {isUpdatingProfile && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
            {isUpdatingProfile ? 'Updating Profile...' : 'Update Profile'}
         </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 font-display text-dark-text">
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StatCard
                label="Total Sales Today"
                value={`$${(recentSales.reduce((a, b) => a + (Number(b.amount) || 0), 0) || 0).toFixed(2)}`}
                change="+12.4% vs ytd"
                icon="shopping_cart"
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                chartPath="M0 25 L 50 10 L 100 20"
                strokeColor="#3b82f6"
              />
              <StatCard
                label="Float Balance"
                value={floatLoading ? 'Loading...' : `$${(floatBalance || 0).toFixed(2)}`}
                change="Active Float"
                icon="account_balance_wallet"
                iconBg="bg-primary/10"
                iconColor="text-primary"
                chartPath="M0 20 Q 50 5, 100 15"
                strokeColor="#7e56c2"
              />
           </div>

           {/* Recent Sales Table Snippet */}
           <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <h4 className="text-lg font-black tracking-tight">Recent Sales Activity</h4>
                 <button onClick={() => setTab('sell')} className="text-xs font-black text-primary uppercase tracking-widest hover:underline">New Sale</button>
              </div>
              <DataTable
                 columns={recentSalesColumns}
                 data={recentSales.slice(0, 3)}
                 rowKey={(sale) => sale.id}
                 emptyMessage="No recent sales"
                 emptyIcon="point_of_sale"
              />
              <button
                onClick={() => setTab('float')}
                className="w-full text-xs font-black text-primary uppercase tracking-widest hover:underline py-2"
              >
                View Float Wallet
              </button>
           </div>

           <div className="flex gap-4">
             <button
               onClick={onBulkSale}
               className="bg-accent-green text-dark-text px-8 py-3 rounded-lg font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-accent-green/10"
             >
               <span className="material-symbols-outlined text-lg">batch_prediction</span>
               BULK SALE
             </button>
           </div>
        </div>
      )}

      {activeTab === 'sell' && sellStep === 'select' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4">
           {billers.map(b => (
              <button key={b.id} onClick={() => { setSellForm({...sellForm, billerId: b.id, billerName: b.name, catId: b.catId}); setSellStep('details'); }} className="bg-white p-8 rounded-xl border border-neutral-light hover:border-primary hover:shadow-2xl transition-all group flex flex-col items-center gap-4">
                 <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${b.color}`}><span className="material-symbols-outlined text-3xl">{b.icon}</span></div>
                 <h4 className="text-sm font-black text-dark-text">{b.name}</h4>
                 <p className="text-[10px] font-black text-accent-green uppercase tracking-widest">Earn {getCommissionRate(b.catId)}%</p>
              </button>
           ))}
        </div>
      )}

      {activeTab === 'sell' && sellStep === 'details' && (
        <div className="max-w-2xl mx-auto bg-white p-10 rounded-xl border border-neutral-light shadow-sm space-y-8 animate-in zoom-in-95">
           <div className="text-center space-y-2">
              <h3 className="text-3xl font-black text-dark-text tracking-tight">Confirm Authorization</h3>
              <p className="text-neutral-text font-medium">Verify customer information before authorizing float deduction.</p>
           </div>
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Customer Reference / Mobile</label>
                 <input type="text" placeholder="e.g. 0771***567" onChange={e => setSellForm({...sellForm, customerRef: e.target.value})} className="portal-input-base w-full rounded-xl px-4 py-3 font-bold text-sm" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Amount to Deduct ($)</label>
                 <input type="number" placeholder="0.00" onChange={e => setSellForm({...sellForm, amount: e.target.value})} className="portal-input-base w-full rounded-xl p-5 text-2xl font-black text-primary text-center" />
              </div>
           </div>
           <div className="p-5 bg-accent-green/10 rounded-lg border border-accent-green/20 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Estimated Commission</p>
                 <p className="text-xl font-black text-accent-green">+${( (parseFloat(sellForm.amount) || 0) * (getCommissionRate(sellForm.catId)/100)).toFixed(2)}</p>
              </div>
              <span className="material-symbols-outlined text-accent-green text-3xl">savings</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setSellStep('select')} className="py-4 rounded-lg border border-neutral-light font-black text-[10px] uppercase">Cancel</button>
              <button onClick={handleProcess} disabled={isProcessing} className="py-4 bg-primary text-white rounded-lg font-black text-[10px] uppercase shadow-xl">{isProcessing ? 'Authorizing...' : 'Confirm Sale'}</button>
           </div>
        </div>
      )}

      {activeTab === 'sell' && sellStep === 'success' && (
        <div className="max-w-2xl mx-auto animate-in zoom-in duration-500 pb-20">
           <div className="bg-white rounded-xl shadow-2xl border border-neutral-light overflow-hidden">
              <div className="bg-primary/5 p-12 text-center border-b border-dashed border-neutral-light relative">
                 <div className="absolute -bottom-2 left-0 w-full flex justify-around opacity-10">
                    {[...Array(20)].map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-dark-text"></div>)}
                 </div>
                 <div className="w-20 h-20 bg-accent-green text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <span className="material-symbols-outlined text-4xl font-black">check</span>
                 </div>
                 <h3 className="text-3xl font-black text-dark-text tracking-tight">Payment Successful</h3>
                 <p className="text-neutral-text font-bold text-xs uppercase tracking-[0.2em] mt-2">Authorization ID: {lastSale?.id}</p>
              </div>

              {lastSale?.token && (
                 <div className="p-10 bg-slate-50 text-center space-y-4">
                    <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Voucher Token</p>
                    <div className="bg-white border-2 border-primary/20 rounded-xl p-8 shadow-inner">
                       <p className="text-3xl md:text-4xl font-black text-dark-text tracking-tighter font-mono">{lastSale.token}</p>
                    </div>
                    <div className="flex justify-center gap-4">
                       <div className="px-4 py-2 bg-white rounded-full border border-neutral-light text-[10px] font-black text-neutral-text uppercase">Units: {lastSale.units}</div>
                       <div className="px-4 py-2 bg-white rounded-full border border-neutral-light text-[10px] font-black text-neutral-text uppercase">Biller: ZESA</div>
                    </div>
                 </div>
              )}

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

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                    <button onClick={() => handleFulfillAction('Thermal Receipt')} className="flex flex-col items-center justify-center p-6 bg-background-light rounded-lg hover:bg-neutral-light transition-all gap-2 group">
                       <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">print</span>
                       <span className="text-[10px] font-black uppercase tracking-widest">Thermal Print</span>
                    </button>
                    <button onClick={() => handleFulfillAction('WhatsApp Message')} className="flex flex-col items-center justify-center p-6 bg-background-light rounded-lg hover:bg-neutral-light transition-all gap-2 group">
                       <span className="material-symbols-outlined text-green-600 group-hover:scale-110 transition-transform">share</span>
                       <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                    </button>
                    <button onClick={() => handleFulfillAction('SMS Confirmation')} className="flex flex-col items-center justify-center p-6 bg-background-light rounded-lg hover:bg-neutral-light transition-all gap-2 group">
                       <span className="material-symbols-outlined text-blue-600 group-hover:scale-110 transition-transform">sms</span>
                       <span className="text-[10px] font-black uppercase tracking-widest">Send SMS</span>
                    </button>
                 </div>

                 <div className="pt-8 flex flex-col gap-4">
                    <button onClick={() => setSellStep('select')} className="w-full bg-dark-text text-white py-5 rounded-lg font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3">
                       <span className="material-symbols-outlined">add_circle</span>
                       New Transaction
                    </button>
                    <button onClick={() => setTab('overview')} className="w-full py-4 text-neutral-text font-black text-[10px] uppercase tracking-widest hover:text-dark-text transition-colors">
                       Return to Dashboard
                    </button>
                 </div>
              </div>
           </div>

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
      {activeTab === 'profile' && (
        <div className="animate-in fade-in duration-300">
          <UserProfile />
        </div>
      )}
    </div>
  );
}
