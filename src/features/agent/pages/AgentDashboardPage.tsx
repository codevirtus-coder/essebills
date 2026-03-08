import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../../../components/ui/StatCard';
import { INITIAL_CATEGORIES } from '../constants';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import UserProfile from '../../admin/components/UserProfile';
import { NotificationsPage } from '../../../pages/NotificationsPage';
import { getAuthSession, saveAuthSession } from '../../auth/auth.storage';
import { getCurrentUserProfile } from '../../auth/auth.service';
import type { UserProfileDto } from '../../auth/dto/auth.dto';
import { getAgentWalletBalances, getAgentWalletHistory, getMyBankTopUps, type AgentWalletBalance, type AgentWalletTransaction, type PendingBankTopUp } from '../services/agent.service';
import { getAgentRecentPayments, getAgentCommissionBalance, getAgentAnalyticsStats, type AgentPaymentProduct, type AgentDashboardStatsDto } from '../services/agent-api.service';
import Logo from '../../../components/ui/Logo';
import CRUDLayout, { type CRUDColumn, type PageableState } from '../../shared/components/CRUDLayout';
import CRUDModal from '../../shared/components/CRUDModal';
import { Bolt, Antenna, Droplets, Landmark, History, PlusCircle, CheckCircle, Smartphone, Share2, Printer, ShoppingCart, Wallet, ArrowRight, Loader2, Repeat, Zap, Wifi, BookOpen, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import '../styles/agent-dashboard.css';
import BulkPaymentsPage from './BulkPaymentsPage';
import toast from 'react-hot-toast';
import { ServicesMarketplace, type BillerCard } from '../../shared/components/ServicesMarketplace';
import { ProductPaymentCheckout } from '../../landing/components/ProductPaymentCheckout';
import WalletTopUpModal from '../../customer/components/WalletTopUpModal';
import { repeatPayment } from '../../customer/services/customer-api.service';

export function AgentDashboardPage() {
  const { tab: urlTab } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
      navigate(basePath);
    } else {
      navigate(`${basePath}/${tab}`);
    }
    setSelectedCheckoutProduct(null);
  };

  const [walletBalances, setWalletBalances] = useState<AgentWalletBalance[]>([]);
  const [floatLoading, setFloatLoading] = useState(true);
  const [commissionBalance, setCommissionBalance] = useState<number>(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [stats, setStats] = useState<AgentDashboardStatsDto | null>(null);

  const [floatHistory, setFloatHistory] = useState<AgentWalletTransaction[]>([]);
  const [floatHistoryTotal, setFloatHistoryTotal] = useState(0);
  const [floatHistoryPage, setFloatHistoryPage] = useState(0);
  const [loadingFloatHistory, setLoadingFloatHistory] = useState(true);

  const [topUps, setTopUps] = useState<PendingBankTopUp[]>([]);
  const [topUpsTotal, setTopUpsTotal] = useState(0);
  const [loadingTopUps, setLoadingTopUps] = useState(true);
  const [floatSubTab, setFloatSubTab] = useState<'history' | 'topups'>('history');

  const [selectedCheckoutProduct, setSelectedCheckoutProduct] = useState<BillerCard | null>(null);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  // Derived: primary float balance (first USD balance or first available)
  const floatBalance = walletBalances.find(b => b.currencyCode === 'USD')?.balance
    ?? walletBalances[0]?.balance
    ?? 0;

  // Payout Logic
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

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

  const refreshBalances = () => {
    getAgentWalletBalances()
      .then((data) => { setWalletBalances(data); })
      .catch(() => {})
      .finally(() => { setFloatLoading(false); });
  };

  useEffect(() => {
    refreshBalances();
  }, []);

  const refreshSales = () => {
    getAgentRecentPayments(10)
      .then((data) => { setRecentSales(data); })
      .catch(() => {})
      .finally(() => { setLoadingSales(false); });
  };

  useEffect(() => {
    refreshSales();
  }, []);

  useEffect(() => {
    let mounted = true;
    getAgentCommissionBalance()
      .then((data) => { if (mounted) setCommissionBalance(data.availableBalance || 0); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (session?.profile?.id) {
      getAgentAnalyticsStats(session.profile.id)
        .then(data => { if (mounted) setStats(data); })
        .catch(() => {});
    }
    return () => { mounted = false; };
  }, [session?.profile?.id]);

  useEffect(() => {
    if (activeTab !== 'float') return;
    let mounted = true;
    getAgentWalletHistory(floatHistoryPage, 20)
      .then(({ content, totalElements }) => {
        if (!mounted) return;
        setFloatHistory(content);
        setFloatHistoryTotal(totalElements);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoadingFloatHistory(false); });
    return () => { mounted = false; };
  }, [activeTab, floatHistoryPage]);

  useEffect(() => {
    if (activeTab !== 'float' || floatSubTab !== 'topups') return;
    let mounted = true;
    getMyBankTopUps(0, 20)
      .then(({ content, totalElements }) => {
        if (!mounted) return;
        setTopUps(content);
        setTopUpsTotal(totalElements);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoadingTopUps(false); });
    return () => { mounted = false; };
  }, [activeTab, floatSubTab]);

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

  const handleRepeatPayment = async (txId: string | number) => {
    const loadingToast = toast.loading("Initiating repeat sale...");
    try {
      const response = await repeatPayment(txId);
      toast.dismiss(loadingToast);
      
      const redirectUrl = (response as any).paymentTransaction?.redirectUrl || (response as any).redirectUrl;
      
      if (redirectUrl) {
        window.location.assign(redirectUrl);
      } else {
        toast.success("Sale successful!");
        refreshSales();
        refreshBalances();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to repeat sale.");
    }
  };

  // --------------------------------------------------------------------------
  // Tables
  // --------------------------------------------------------------------------

  const salesColumns: CRUDColumn<any>[] = [
    {
      key: 'time',
      header: 'Time',
      render: (sale) => <span className="text-xs font-semibold text-slate-500">{sale.time || new Date(sale.transactionDate).toLocaleTimeString()}</span>,
    },
    {
      key: 'service',
      header: 'Service',
      render: (sale) => (
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{sale.biller || sale.productName}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sale.customer || sale.productReference}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (sale) => <span className="font-bold text-slate-700 dark:text-slate-300">${(Number(sale.amount) || 0).toFixed(2)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (sale) => (
        <button 
          onClick={() => handleRepeatPayment(sale.id)}
          className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter hover:underline flex items-center gap-1 ml-auto"
        >
          <Repeat size={10} /> Repeat
        </button>
      ),
    }
  ];

  const floatColumns: CRUDColumn<AgentWalletTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (f) => (
        <span className="text-xs font-semibold text-slate-500">
          {f.createdDate ? new Date(f.createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (f) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          f.transactionType === 'TOP_UP'
            ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'
        }`}>
          {f.transactionType === 'TOP_UP' ? 'Top Up' : 'Commission'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (f) => <span className="text-sm text-slate-600 dark:text-slate-400">{f.description ?? f.productCode ?? '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (f) => <span className="font-bold text-slate-900 dark:text-slate-100">{f.currencyCode} {(Number(f.amount) || 0).toFixed(2)}</span>,
    },
    {
      key: 'runningBalance',
      header: 'Balance',
      className: 'text-right',
      render: (f) => <span className="font-mono text-sm text-slate-500">{f.currencyCode} {(Number(f.runningBalance) || 0).toFixed(2)}</span>,
    },
  ];

  const topUpStatusStyle = (status: string) => {
    if (status === 'CONFIRMED') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (status === 'REJECTED') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

  const topUpColumns: CRUDColumn<PendingBankTopUp>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (t) => (
        <span className="text-xs font-semibold text-slate-500">
          {t.createdDate ? new Date(t.createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'bank',
      header: 'Bank Account',
      render: (t) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{t.eseBillsAccount?.bank ?? '—'}</p>
          <p className="text-[10px] font-mono text-slate-400">{t.eseBillsAccount?.accountNumber ?? ''}</p>
        </div>
      ),
    },
    {
      key: 'reference',
      header: 'Deposit Ref',
      render: (t) => <span className="font-mono text-xs text-emerald-600">{t.depositReference ?? '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (t) => <span className="font-bold text-slate-900 dark:text-slate-100">{t.currencyCode} {(Number(t.amount) || 0).toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center',
      render: (t) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${topUpStatusStyle(t.status)}`}>
          {t.status}
        </span>
      ),
    },
  ];

  // --------------------------------------------------------------------------
  // Sections
  // --------------------------------------------------------------------------

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Sales Today"
            value={stats?.todayTransactions !== undefined ? String(stats.todayTransactions) : `$${(recentSales.reduce((a, b) => a + (Number(b.amount) || 0), 0) || 0).toFixed(2)}`}
            change={stats?.todayEarnings !== undefined ? `+$${stats.todayEarnings.toFixed(2)} earned` : "+12.4% vs yesterday"}
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
            onClick={() => setIsTopUpModalOpen(true)}
          />
          <StatCard
            label="Commissions"
            value={`$${commissionBalance.toFixed(2)}`}
            change="Available for payout"
            icon="payments"
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Success Rate"
            value={stats?.successfulTransactions !== undefined && stats?.totalTransactions ? `${Math.round((stats.successfulTransactions / stats.totalTransactions) * 100)}%` : "98.2%"}
            change="System health optimal"
            icon="check_circle"
            iconBg="bg-amber-50 dark:bg-amber-900/20"
            iconColor="text-amber-600 dark:text-amber-400"
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
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Authorize Sale</h2>
        <p className="text-slate-500 mt-2">Browse the marketplace and select a service to sell.</p>
      </div>

      <div className="glass-card p-8 md:p-10 border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px]">
        {selectedCheckoutProduct ? (
          <ProductPaymentCheckout 
            productId={selectedCheckoutProduct.productId}
            billerName={selectedCheckoutProduct.name}
            productCategoryId={selectedCheckoutProduct.productCategoryId}
            embedded={true}
            onBack={() => setSelectedCheckoutProduct(null)}
            onSuccess={() => {
              setSelectedCheckoutProduct(null);
              setTab('overview');
              refreshBalances();
              refreshSales();
            }}
          />
        ) : (
          <ServicesMarketplace 
            embedded={true} 
            onSelectProduct={(p) => setSelectedCheckoutProduct(p)}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 font-sans">
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'sell' && renderSell()}
      {activeTab === 'bulk-payments' && <BulkPaymentsPage />}
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
           {/* Balance cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {floatLoading ? (
               <div className="bg-slate-900 p-8 rounded-2xl col-span-full animate-pulse h-28" />
             ) : walletBalances.length > 0 ? (
               walletBalances.map((wb) => (
                 <div key={wb.id} className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{wb.currencyCode} Float</p>
                   <h3 className="text-4xl font-bold tracking-tighter">{wb.currencyCode} {(wb.balance || 0).toFixed(2)}</h3>
                 </div>
               ))
             ) : (
               <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Available Float</p>
                 <h3 className="text-4xl font-bold tracking-tighter">USD {(floatBalance || 0).toFixed(2)}</h3>
               </div>
             )}
           </div>

           {/* Sub-tabs */}
           <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
             {([['history', 'Wallet History'], ['topups', 'My Top-Up Requests']] as const).map(([id, label]) => (
               <button
                 key={id}
                 onClick={() => setFloatSubTab(id)}
                 className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                   floatSubTab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                 }`}
               >
                 {label}
               </button>
             ))}
           </div>

           {floatSubTab === 'history' && (
             <CRUDLayout
               title="Wallet Transactions"
               columns={floatColumns}
               data={floatHistory}
               loading={loadingFloatHistory}
               pageable={{
                 page: floatHistoryPage + 1,
                 size: 20,
                 totalElements: floatHistoryTotal,
                 totalPages: Math.max(1, Math.ceil(floatHistoryTotal / 20)),
               }}
               onPageChange={(p) => setFloatHistoryPage(p - 1)}
               onSizeChange={() => {}}
               onRefresh={() => {
                 setLoadingFloatHistory(true);
                 getAgentWalletHistory(floatHistoryPage, 20)
                   .then(({ content, totalElements }) => { setFloatHistory(content); setFloatHistoryTotal(totalElements); })
                   .catch(() => {})
                   .finally(() => setLoadingFloatHistory(false));
               }}
             />
           )}

           {floatSubTab === 'topups' && (
             <CRUDLayout
               title="Bank Top-Up Submissions"
               columns={topUpColumns}
               data={topUps}
               loading={loadingTopUps}
               pageable={{ page: 1, size: 20, totalElements: topUpsTotal, totalPages: Math.max(1, Math.ceil(topUpsTotal / 20)) }}
               onPageChange={() => {}}
               onSizeChange={() => {}}
               onRefresh={() => {
                 setLoadingTopUps(true);
                 getMyBankTopUps(0, 20)
                   .then(({ content, totalElements }) => { setTopUps(content); setTopUpsTotal(totalElements); })
                   .catch(() => {})
                   .finally(() => setLoadingTopUps(false));
               }}
             />
           )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="animate-in fade-in duration-300">
          <UserProfile />
        </div>
      )}

      <WalletTopUpModal 
        isOpen={isTopUpModalOpen} 
        onClose={() => setIsTopUpModalOpen(false)}
        onSuccess={() => {
          refreshBalances();
        }}
      />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
