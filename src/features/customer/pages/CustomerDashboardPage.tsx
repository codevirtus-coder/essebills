import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import UserProfile from '../../admin/components/UserProfile';
import { 
  getCustomerTransactions, 
  getProductCategories,
  getCustomerWalletBalances,
  getSavedAccounts,
  repeatPayment,
  type CustomerTransaction, 
  type ProductCategory,
  type SavedAccount
} from '../services/customer-api.service';
import { getMyBankTopUps, type PendingBankTopUp } from '../../agent/services/agent.service';
import { NotificationsPage } from '../../../pages/NotificationsPage';
import CRUDLayout, { type CRUDColumn, type PageableState } from '../../shared/components/CRUDLayout';
import BulkPaymentsPage from '../../agent/pages/BulkPaymentsPage';
import StatCard from '../../../components/ui/StatCard';
import { Zap, Smartphone, Wifi, BookOpen, ShieldCheck, Droplets, Heart, Sparkles, CreditCard, Wallet, Repeat, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { ROUTE_PATHS } from '../../../router/paths';
import toast from 'react-hot-toast';
import { ServicesMarketplace, type BillerCard } from '../../shared/components/ServicesMarketplace';
import { ProductPaymentCheckout } from '../../landing/components/ProductPaymentCheckout';
import { QuickPay } from '../components/QuickPay';
import WalletTopUpModal from '../components/WalletTopUpModal';
import CustomerDonationsPage from './CustomerDonationsPage';

export function CustomerDashboardPage() {
  const { tab: urlTab } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = urlTab || searchParams.get('tab') || 'overview';

  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageable, setPageable] = useState<PageableState>({
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Services State
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [selectedCheckoutProduct, setSelectedCheckoutProduct] = useState<BillerCard | null>(null);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  // Wallet State
  const [walletBalances, setWalletBalances] = useState<any[]>([]);
  const [topUps, setTopUps] = useState<PendingBankTopUp[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(false);

  const walletBalance = useMemo(() => {
    return walletBalances.find(b => b.currencyCode === 'USD')?.balance ?? 0;
  }, [walletBalances]);

  const setTab = (tab: string) => {
    navigate(`/portal-customer/${tab}`);
    setSelectedCheckoutProduct(null);
  };

  const columns: CRUDColumn<CustomerTransaction>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (tx) => {
        const date = tx.transactionDate
          ? new Date(tx.transactionDate).toLocaleDateString()
          : '—';
        return <span className="font-semibold text-slate-900 dark:text-slate-100">{date}</span>;
      },
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (tx) => {
        const ref = tx.productReference ?? String(tx.id);
        return <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{ref}</span>;
      },
    },
    {
      key: 'service',
      header: 'Service',
      render: (tx) => <span className="text-slate-600 dark:text-slate-300">{tx.productName ?? '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (tx) => <span className="font-bold text-slate-900 dark:text-slate-100">${(Number(tx.amount) || 0).toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center',
      render: (tx) => {
        const status = tx.paymentStatus ?? '—';
        const statusLower = String(status).toLowerCase();
        const isSuccess = statusLower.includes('success') || statusLower.includes('paid');
        const isPending = statusLower.includes('pending');
        
        return (
          <span className={ `px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isSuccess
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'
              : isPending
              ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50'
              : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
          }`}>
            {status}
          </span>
        );
      },
    },
  ];

  const fetchTransactions = (page = 1, size = 10) => {
    setLoading(true);
    getCustomerTransactions({ page: page - 1, size })
      .then((data) => {
        setTransactions(data.content ?? []);
        setPageable({
          page: (data.number ?? 0) + 1,
          size: data.size ?? size,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
        });
      })
      .catch(() => { 
        setTransactions([]); 
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchDashboardData = async () => {
    try {
      const [catData, savedData] = await Promise.all([
        getProductCategories(),
        getSavedAccounts()
      ]);
      setCategories(catData);
      setSavedAccounts(savedData);
    } catch (e) {
      console.error("Failed to load dashboard supporting data");
    }
  };

  const fetchWalletData = async () => {
    setLoadingWallet(true);
    try {
      const [balances, topupData] = await Promise.all([
        getCustomerWalletBalances(),
        getMyBankTopUps(0, 10)
      ]);
      setWalletBalances(balances);
      setTopUps(topupData.content);
    } catch (e) {
      // toast.error("Failed to load wallet data");
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'transactions' || activeTab === 'overview') {
      fetchTransactions(1, 10);
    }
    if (activeTab === 'overview') {
      fetchDashboardData();
    }
    if (activeTab === 'wallet' || activeTab === 'overview') {
      fetchWalletData();
    }
  }, [activeTab]);

  const handleRepeatPayment = async (tx: CustomerTransaction) => {
    const loadingToast = toast.loading("Initiating repeat payment...");
    try {
      const response = await repeatPayment(tx.id);
      toast.dismiss(loadingToast);
      
      const redirectUrl = (response as any).paymentTransaction?.redirectUrl || (response as any).redirectUrl;
      
      if (redirectUrl) {
        window.location.assign(redirectUrl);
      } else {
        toast.success("Payment successful!");
        fetchTransactions(1, 10);
        fetchWalletData();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to repeat payment. Please try again.");
    }
  };

  const getCategoryIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('airtime')) return <Smartphone className="w-6 h-6" />;
    if (l.includes('internet')) return <Wifi className="w-6 h-6" />;
    if (l.includes('education')) return <BookOpen className="w-6 h-6" />;
    if (l.includes('insurance')) return <ShieldCheck className="w-6 h-6" />;
    if (l.includes('fuel')) return <Droplets className="w-6 h-6" />;
    if (l.includes('donation')) return <Heart className="w-6 h-6" />;
    if (l.includes('lottery')) return <Sparkles className="w-6 h-6" />;
    return <Zap className="w-6 h-6" />;
  };

  // --------------------------------------------------------------------------
  // Render Sections
  // --------------------------------------------------------------------------

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Spent"
          value={`$${transactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toFixed(2)}`}
          change="Last 30 days"
          icon="payments"
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Wallet Balance"
          value={`$${walletBalance.toFixed(2)}`}
          change="Available for payments"
          icon="account_balance_wallet"
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          onClick={() => setIsTopUpModalOpen(true)}
        />
        <StatCard
          label="Pending Top-ups"
          value={topUps.filter(t => t.status === 'PENDING').length.toString()}
          change="Awaiting confirmation"
          icon="history"
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white">Quick Pay</h3>
            <button onClick={() => setTab('pay')} className="text-xs font-bold text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {savedAccounts.length > 0 ? (
              savedAccounts.slice(0, 3).map(acc => (
                <button 
                  key={acc.id}
                  onClick={() => {
                    const query = new URLSearchParams({ 
                      biller: acc.productName, 
                      account: acc.accountReference,
                      productId: String(acc.productId)
                    });
                    window.location.assign(`${ROUTE_PATHS.checkout}?${query.toString()}`);
                  }}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 shadow-sm transition-colors">
                    {getCategoryIcon(acc.productName)}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{acc.accountNickname || acc.productName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{acc.accountReference}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                </button>
              ))
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {categories.slice(0, 4).map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setTab('pay')}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 hover:border-emerald-500/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 shadow-sm transition-colors">
                      {getCategoryIcon(cat.name)}
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{cat.name}</span>
                  </button>
                ))}
              </div>
            ) : Array(4).fill(0).map((_, i) => (
               <div key={i} className="h-24 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>

        <div className="glass-card p-8 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <button onClick={() => setTab('transactions')} className="text-xs font-bold text-emerald-600 uppercase tracking-widest hover:underline">Full History</button>
          </div>
          <div className="space-y-4">
            {transactions.slice(0, 3).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.productName}</p>
                    <p className="text-[10px] text-slate-500">{new Date(tx.transactionDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">${tx.amount.toFixed(2)}</p>
                  <button 
                    onClick={() => handleRepeatPayment(tx)}
                    className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter hover:underline flex items-center gap-1 ml-auto"
                  >
                    <Repeat size={10} /> Repeat
                  </button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-center py-8 text-sm text-slate-400 italic">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPay = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Quick Pay</h2>
        <p className="text-slate-500 mt-2">Select a service and pay in seconds.</p>
      </div>

      <div className="glass-card p-6 md:p-8 border-slate-200 dark:border-slate-800 overflow-hidden max-w-xl">
        <QuickPay />
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">Personal Wallet</p>
          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6">
            <h3 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter">${walletBalance.toFixed(2)}</h3>
            <p className="text-slate-400 font-medium mb-2">Available Balance</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <button 
              onClick={() => setIsTopUpModalOpen(true)}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-900/40"
            >
              Top Up Wallet
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm border border-white/10 transition-all backdrop-blur-md">Withdraw Funds</button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Top-up History</h4>
        <div className="glass-card overflow-hidden border-slate-200 dark:border-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Method</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topUps.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">{new Date(t.createdDate || '').toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">Bank Deposit</td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">${t.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      t.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {topUps.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No top-up history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 font-sans">
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'pay' && renderPay()}
      {activeTab === 'donations' && <CustomerDonationsPage />}
      {activeTab === 'wallet' && renderWallet()}
      
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <CRUDLayout
            title="My Transactions"
            columns={columns}
            data={transactions}
            loading={loading}
            pageable={pageable}
            onPageChange={(page) => fetchTransactions(page, pageable.size)}
            onSizeChange={(size) => fetchTransactions(1, size)}
            onRefresh={() => fetchTransactions(pageable.page, pageable.size)}
            actions={{
              onView: handleRepeatPayment,
            }}
          />
        </div>
      )}

      {activeTab === 'bulk-payments' && <BulkPaymentsPage />}
      {activeTab === 'notifications' && <NotificationsPage />}
      {activeTab === 'profile' && <div className="animate-in fade-in duration-300"><UserProfile /></div>}

      <WalletTopUpModal 
        isOpen={isTopUpModalOpen} 
        onClose={() => setIsTopUpModalOpen(false)}
        onSuccess={() => {
          fetchWalletData();
        }}
      />
    </div>
  );
}
