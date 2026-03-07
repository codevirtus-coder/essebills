import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../../../components/ui/StatCard';
import { INITIAL_CATEGORIES } from '../constants';
import { useParams, useSearchParams } from 'react-router-dom';
import UserProfile from '../../admin/components/UserProfile';
import { NotificationsPage } from '../../../pages/NotificationsPage';
import { getAuthSession, saveAuthSession } from '../../auth/auth.storage';
import { getCurrentUserProfile } from '../../auth/auth.service';
import type { UserProfileDto } from '../../auth/dto/auth.dto';
import { getAgentWalletBalance, getAgentWalletHistory, type WalletHistoryEntry } from '../services/agent.service';
import Logo from '../../../components/ui/Logo';
import CRUDLayout, { type CRUDColumn, type PageableState } from '../../shared/components/CRUDLayout';
import CRUDModal from '../../shared/components/CRUDModal';
import { Bolt, Antenna, Droplets, Landmark, History, PlusCircle, CheckCircle, Smartphone, Share2, Printer, ShoppingCart, Wallet, ArrowRight } from 'lucide-react';
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

export function AgentDashboardPage() {
  const { tab: urlTab } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = urlTab || searchParams.get('tab') || 'overview';

  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);
  const agentName = useMemo(() => {
    const first = profile?.firstName ?? '';
    const last = profile?.lastName ?? '';
    return `${first} ${last}`.trim() || profile?.username || 'Agent';
  }, [profile]);

  const setTab = (tab: string) => {
    const basePath = '/portal-agent';
    if (tab === 'overview') {
      window.history.replaceState(null, '', basePath);
      setSearchParams({});
    } else {
      window.history.replaceState(null, '', `${basePath}/${tab}`);
      setSearchParams({});
    }
    setSellStep('select');
  };

  const [floatBalance, setFloatBalance] = useState(452.10);
  const [floatLoading, setFloatLoading] = useState(true);
  const [commissionBalance, setCommissionBalance] = useState(24.40);
  const [recentSales, setRecentSales] = useState<Sale[]>(INITIAL_SALES);

  const [floatHistory, setFloatHistory] = useState<WalletHistoryEntry[]>([]);
  const [loadingFloatHistory, setLoadingFloatHistory] = useState(false);

  // Sale Logic
  const [sellStep, setSellStep] = useState<'select' | 'details' | 'confirm' | 'success'>('select');
  const [sellForm, setSellForm] = useState({ billerId: '', billerName: '', customerRef: '', amount: '', catId: 'util' });
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payout Logic
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

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

  useEffect(() => {
    let mounted = true;
    getAgentWalletBalance()
      .then((data) => {
        if (mounted) setFloatBalance(data.balance ?? 452.10);
      })
      .catch(() => { })
      .finally(() => { if (mounted) setFloatLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (activeTab !== 'float') return;
    setLoadingFloatHistory(true);
    getAgentWalletHistory()
      .then((data) => {
        setFloatHistory(data.length > 0 ? data : FALLBACK_FLOAT_HISTORY);
      })
      .catch(() => { 
        setFloatHistory(FALLBACK_FLOAT_HISTORY); 
      })
      .finally(() => {
        setLoadingFloatHistory(false);
      });
  }, [activeTab]);

  const billers = [
    { id: 'zesa', name: 'ZESA Electricity', icon: <Bolt size={24} />, color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400', catId: 'util' },
    { id: 'econet', name: 'Econet Airtime', icon: <Antenna size={24} />, color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400', catId: 'air' },
    { id: 'netone', name: 'NetOne Airtime', icon: <Smartphone size={24} />, color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400', catId: 'air' },
    { id: 'telone', name: 'TelOne Internet', icon: <Share2 size={24} />, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400', catId: 'net' },
  ];

  const getCommissionRate = (catId: string) => INITIAL_CATEGORIES.find(c => c.id === catId)?.agentRate || 2.0;

  const handleProcess = () => {
    const amt = parseFloat(sellForm.amount) || 0;
    if (amt > floatBalance) return toast.error("Insufficient Float Balance!");
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
        icon: 'payments',
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

  // --------------------------------------------------------------------------
  // Tables
  // --------------------------------------------------------------------------

  const salesColumns: CRUDColumn<Sale>[] = [
    {
      key: 'time',
      header: 'Time',
      render: (sale) => <span className="text-xs font-semibold text-slate-500">{sale.time}</span>,
    },
    {
      key: 'service',
      header: 'Service',
      render: (sale) => (
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{sale.biller}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sale.customer}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (sale) => <span className="font-bold text-slate-700 dark:text-slate-300">${sale.amount.toFixed(2)}</span>,
    },
    {
      key: 'commission',
      header: 'Comm.',
      className: 'text-right',
      render: (sale) => <span className="font-bold text-emerald-600">+${sale.commission.toFixed(2)}</span>,
    },
  ];

  const floatColumns: CRUDColumn<WalletHistoryEntry>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (f) => <span className="font-semibold text-slate-900 dark:text-slate-100">{String(f.date ?? '—')}</span>,
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (f) => <span className="text-xs font-mono font-bold text-emerald-600">{String(f.id ?? '—')}</span>,
    },
    {
      key: 'method',
      header: 'Method',
      render: (f) => <span className="text-sm text-slate-600 dark:text-slate-400">{String(f.method ?? '—')}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (f) => <span className="font-bold text-slate-900 dark:text-slate-100">${(Number(f.amount) || 0).toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center',
      render: (f) => (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {String(f.status ?? '—')}
        </span>
      ),
    },
  ];

  // --------------------------------------------------------------------------
  // Sections
  // --------------------------------------------------------------------------

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatCard
            label="Total Sales Today"
            value={`$${(recentSales.reduce((a, b) => a + (Number(b.amount) || 0), 0) || 0).toFixed(2)}`}
            change="+12.4% vs yesterday"
            icon="shopping_cart"
            iconBg="bg-emerald-50 dark:bg-emerald-900/20"
            iconColor="text-emerald-600 dark:text-emerald-400"
            chartPath="M0 25 L 50 10 L 100 20"
            strokeColor="#10b981"
          />
          <StatCard
            label="Current Float"
            value={floatLoading ? 'Loading...' : `$${(floatBalance || 0).toFixed(2)}`}
            change="Instant available"
            icon="account_balance_wallet"
            iconBg="bg-slate-100 dark:bg-slate-800"
            iconColor="text-slate-600 dark:text-slate-300"
            chartPath="M0 20 Q 50 5, 100 15"
            strokeColor="#64748b"
          />
       </div>

       <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Recent Activity</h4>
             <button onClick={() => setTab('sell')} className="text-xs font-bold text-emerald-600 uppercase tracking-widest hover:underline">New Sale</button>
          </div>
          <CRUDLayout
            title=""
            columns={salesColumns}
            data={recentSales.slice(0, 5)}
            loading={false}
            pageable={{ page: 1, size: 5, totalElements: recentSales.length, totalPages: 1 }}
            onPageChange={() => {}}
            onSizeChange={() => {}}
            searchable={false}
          />
       </div>
    </div>
  );

  const renderSell = () => (
    <div className="space-y-8">
      {sellStep === 'select' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4">
           {billers.map(b => (
              <button 
                key={b.id} 
                onClick={() => { setSellForm({...sellForm, billerId: b.id, billerName: b.name, catId: b.catId}); setSellStep('details'); }} 
                className="glass-card p-8 hover:border-emerald-500/50 hover:shadow-xl transition-all group flex flex-col items-center gap-4 border-slate-200 dark:border-slate-800"
              >
                 <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", b.color)}>
                    {b.icon}
                 </div>
                 <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{b.name}</h4>
                 <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Earn {getCommissionRate(b.catId)}%</p>
              </button>
           ))}
        </div>
      )}

      {sellStep === 'details' && (
        <div className="max-w-2xl mx-auto glass-card p-10 border-slate-200 dark:border-slate-800 space-y-8 animate-in zoom-in-95">
           <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Authorize Sale</h3>
              <p className="text-slate-500 dark:text-slate-400">Verify customer details before proceeding with payment.</p>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Customer Reference / Mobile</label>
                 <input 
                   type="text" 
                   placeholder="e.g. 0771 000 000" 
                   onChange={e => setSellForm({...sellForm, customerRef: e.target.value})} 
                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Amount ($)</label>
                 <input 
                   type="number" 
                   placeholder="0.00" 
                   onChange={e => setSellForm({...sellForm, amount: e.target.value})} 
                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-3xl font-bold text-emerald-600 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                 />
              </div>
           </div>
           
           <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Commission</p>
                 <p className="text-2xl font-bold text-emerald-600">+${((parseFloat(sellForm.amount) || 0) * (getCommissionRate(sellForm.catId)/100)).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                 <CheckCircle className="text-emerald-500" size={24} />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 pt-2">
              <button onClick={() => setSellStep('select')} className="py-4 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button 
                onClick={handleProcess} 
                disabled={isProcessing} 
                className="py-4 bg-emerald-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm Payment'}
              </button>
           </div>
        </div>
      )}

      {sellStep === 'success' && (
        <div className="max-w-2xl mx-auto animate-in zoom-in duration-500 pb-20">
           <div className="glass-card overflow-hidden border-slate-200 dark:border-slate-800">
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-12 text-center border-b border-dashed border-slate-200 dark:border-slate-800">
                 <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-900/20">
                    <CheckCircle size={40} />
                 </div>
                 <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Payment Successful</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Auth ID: {lastSale?.id}</p>
              </div>

              {lastSale?.token && (
                 <div className="p-10 bg-slate-50/50 dark:bg-slate-900/50 text-center space-y-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Voucher Code</p>
                    <div className="bg-white dark:bg-slate-950 border-2 border-emerald-500/20 rounded-2xl p-8 shadow-inner">
                       <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter font-mono">{lastSale.token}</p>
                    </div>
                    <div className="flex justify-center gap-4">
                       <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Units: {lastSale.units}</div>
                       <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Service: ZESA</div>
                    </div>
                 </div>
              )}

              <div className="p-12 space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[9px]">Authorized By</span>
                       <span className="text-slate-900 dark:text-white font-bold text-sm">{agentName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[9px]">Customer Reference</span>
                       <span className="text-slate-900 dark:text-white font-bold text-sm">{lastSale?.customer}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                       <span className="text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[10px]">Total Paid</span>
                       <span className="text-3xl font-bold text-emerald-600 tracking-tighter">${(Number(lastSale?.amount) || 0).toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <button onClick={() => handleFulfillAction('Print')} className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all gap-2 group">
                       <Printer size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
                       <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Thermal Print</span>
                    </button>
                    <button onClick={() => handleFulfillAction('WhatsApp')} className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all gap-2 group">
                       <Share2 size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
                       <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">WhatsApp</span>
                    </button>
                    <button onClick={() => handleFulfillAction('SMS')} className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all gap-2 group">
                       <PlusCircle size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
                       <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Send SMS</span>
                    </button>
                 </div>

                 <div className="pt-6 flex flex-col gap-4">
                    <button onClick={() => setSellStep('select')} className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3">
                       <PlusCircle size={18} />
                       New Transaction
                    </button>
                    <button onClick={() => setTab('overview')} className="w-full py-4 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">
                       Return to Dashboard
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 font-sans">
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'sell' && renderSell()}
      {activeTab === 'notifications' && <NotificationsPage />}
      
      {activeTab === 'commissions' && (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-emerald-600 p-10 rounded-2xl text-white relative overflow-hidden shadow-2xl">
                 <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">Unpaid Commissions</p>
                    <h3 className="text-5xl font-bold tracking-tighter">${(commissionBalance || 0).toFixed(2)}</h3>
                    <button
                      onClick={handleRequestPayout}
                      disabled={isRequestingPayout || payoutRequested || commissionBalance <= 0}
                      className={cn(
                        "mt-8 px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                        payoutRequested ? "bg-white text-emerald-600" : "bg-white/20 hover:bg-white hover:text-emerald-600 backdrop-blur-md"
                      )}
                    >
                      {isRequestingPayout ? <Loader2 className="animate-spin" size={14} /> : payoutRequested ? <CheckCircle size={14} /> : null}
                      {isRequestingPayout ? 'Processing...' : payoutRequested ? 'Payout Success' : 'Request Payout'}
                    </button>
                 </div>
              </div>
              <div className="glass-card p-8 border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Commission Breakdown</h4>
                 <div className="space-y-4">
                    {INITIAL_CATEGORIES.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between">
                         <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{cat.label}</span>
                         <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{cat.agentRate}%</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
           
           <CRUDLayout
             title="Earning Ledger"
             columns={salesColumns}
             data={recentSales}
             loading={false}
             pageable={{ page: 1, size: 10, totalElements: recentSales.length, totalPages: 1 }}
             onPageChange={() => {}}
             onSizeChange={() => {}}
             onRefresh={() => {}}
           />
        </div>
      )}

      {activeTab === 'float' && (
        <div className="space-y-8">
           <div className="bg-slate-900 p-10 rounded-2xl text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl">
              <div className="relative z-10">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Available Float</p>
                 <h3 className="text-6xl font-bold tracking-tighter">${(floatBalance || 0).toFixed(2)}</h3>
              </div>
              <button className="bg-emerald-600 px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex items-center gap-2">
                 <PlusCircle size={18} />
                 Replenish Float
              </button>
           </div>
           <CRUDLayout
             title="Wallet History"
             columns={floatColumns}
             data={floatHistory}
             loading={loadingFloatHistory}
             pageable={{ page: 1, size: 10, totalElements: floatHistory.length, totalPages: 1 }}
             onPageChange={() => {}}
             onSizeChange={() => {}}
             onRefresh={() => {}}
           />
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="animate-in fade-in duration-300">
          <UserProfile />
        </div>
      )}
    </div>
  );
}

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
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
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
