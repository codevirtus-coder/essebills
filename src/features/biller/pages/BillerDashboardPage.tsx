import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import UserProfile from "../../admin/components/UserProfile";
import { NotificationsPage } from "../../../pages/NotificationsPage";
import StatCard from "../../../components/ui/StatCard";
import { getCurrentUserProfile } from "../../auth/auth.service";
import { getAuthSession, saveAuthSession } from "../../auth/auth.storage";
import type { UserProfileDto } from "../../auth/dto/auth.dto";
import { getPayments } from "../../../services/payments.service";
import type { PaymentTransaction } from "../../../types";
import CRUDLayout, { type CRUDColumn, type PageableState } from "../../shared/components/CRUDLayout";
import { CreditCard, History, Settings, UserCircle, TrendingUp, TrendingDown, ArrowUpRight, Users, CheckCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import "../styles/biller-portal.css";

const MOCK_SETTLEMENTS = [
  {
    id: "ST-5521",
    date: "May 23, 2024",
    period: "Daily Payout",
    gross: 12400.0,
    net: 11860.5,
    status: "Settled",
    reference: "REF-SCB-9920",
  },
  {
    id: "ST-5520",
    date: "May 22, 2024",
    period: "Daily Payout",
    gross: 15600.0,
    net: 14922.0,
    status: "Settled",
    reference: "REF-SCB-9919",
  },
  {
    id: "ST-5519",
    date: "May 21, 2024",
    period: "Daily Payout",
    gross: 13200.0,
    net: 12625.5,
    status: "Settled",
    reference: "REF-SCB-9918",
  },
];

export function BillerDashboardPage() {
  const { tab: urlTab } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = urlTab || searchParams.get("tab") || "overview";

  const setTab = (tab: string) => {
    const basePath = "/portal-biller";
    if (tab === "overview") {
      window.history.replaceState(null, "", basePath);
      setSearchParams({});
    } else {
      window.history.replaceState(null, "", `${basePath}/${tab}`);
      setSearchParams({});
    }
  };

  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);
  const displayName = useMemo(() => {
    const first = profile?.firstName ?? "";
    const last = profile?.lastName ?? "";
    return `${first} ${last}`.trim() || profile?.username || "Biller";
  }, [profile]);

  const [notifConfig, setNotifConfig] = useState({
    dailySummary: true,
    lowFloatAlerts: false,
    payoutAlerts: true,
    systemUpdates: true,
  });

  const toggleNotif = (key: keyof typeof notifConfig) => {
    setNotifConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Collections state
  const [collections, setCollections] = useState<PaymentTransaction[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [pageable, setPageable] = useState<PageableState>({
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

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

  const fetchCollections = (page = 1, size = 10) => {
    setLoadingCollections(true);
    getPayments({ page: page - 1, size })
      .then((data) => {
        setCollections(data.content ?? []);
        setPageable({
          page: (data.number ?? 0) + 1,
          size: data.size ?? size,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
        });
      })
      .catch(() => { 
        setCollections([]); 
      })
      .finally(() => {
        setLoadingCollections(false);
      });
  };

  useEffect(() => {
    if (activeTab === "collections") {
      fetchCollections(pageable.page, pageable.size);
    }
  }, [activeTab]);

  // --------------------------------------------------------------------------
  // Tables
  // --------------------------------------------------------------------------

  const collectionsColumns: CRUDColumn<PaymentTransaction>[] = [
    {
      key: 'transaction',
      header: 'Transaction',
      render: (c) => {
        const dateStr = c.dateTimeOfTransaction
          ? new Date(c.dateTimeOfTransaction).toLocaleDateString()
          : '—';
        return (
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{dateStr}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.productName ?? 'Payment'} • #{c.id}</p>
          </div>
        );
      },
    },
    {
      key: 'customerRef',
      header: 'Customer Ref',
      render: (c) => {
        const ref = c.productReferenceNumber ?? c.customerPhoneNumber ?? '—';
        return <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">{ref}</span>;
      },
    },
    {
      key: 'gross',
      header: 'Gross',
      className: 'text-right',
      render: (c) => <span className="font-bold text-slate-900 dark:text-slate-100">${(Number(c.amount) || 0).toFixed(2)}</span>,
    },
    {
      key: 'net',
      header: 'Net Payout',
      className: 'text-right',
      render: (c) => {
        const gross = Number(c.amount) || 0;
        const fee = Number(c.serviceFees) || 0;
        return <span className="font-bold text-emerald-600 dark:text-emerald-400">${(gross - fee).toFixed(2)}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center',
      render: (c) => (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {c.paymentStatus || 'Completed'}
        </span>
      ),
    },
  ];

  const settlementColumns: CRUDColumn<typeof MOCK_SETTLEMENTS[number]>[] = [
    {
      key: 'id',
      header: 'Payout ID',
      render: (s) => <span className="font-bold text-emerald-600">{s.id}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (s) => (
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{s.date}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.period}</p>
        </div>
      ),
    },
    {
      key: 'net',
      header: 'Amount',
      className: 'text-right',
      render: (s) => <span className="text-base font-bold text-slate-900 dark:text-slate-100">${s.net.toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center',
      render: (s) => (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-wider">{s.status}</span>
      ),
    },
  ];

  // --------------------------------------------------------------------------
  // Renderers
  // --------------------------------------------------------------------------

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Gross Collections"
          value="$12,280.50"
          change="+18.2% vs last week"
          icon="payments"
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          chartPath="M0 25 Q 20 10, 40 20 T 80 5 T 100 15"
          strokeColor="#10b981"
        />
        <StatCard
          label="Total Fees"
          value="-$420.00"
          change="3.4% Platform Fee"
          icon="account_tree"
          iconBg="bg-red-50 dark:bg-red-900/20"
          iconColor="text-red-500 dark:text-red-400"
          chartPath="M0 10 L 100 30"
          strokeColor="#ef4444"
        />
        <StatCard
          label="Net Settlement"
          value="$11,860.50"
          change="Pending next payout"
          icon="check_circle"
          iconBg="bg-slate-100 dark:bg-slate-800"
          iconColor="text-slate-600 dark:text-slate-300"
          chartPath="M0 25 L 20 15 L 40 22 L 100 2"
          strokeColor="#64748b"
        />
        <StatCard
          label="Payment Points"
          value="42 Agents"
          change="Real-time collection"
          icon="hub"
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          chartPath="M0 15 Q 50 5, 100 25"
          strokeColor="#10b981"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Revenue Stream</h3>
               <p className="text-xs text-slate-500 font-medium">Daily collection and profit analysis</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Collections</span>
              </div>
            </div>
          </div>
          
          <div className="h-[280px] w-full flex items-end justify-between px-2">
             {[45, 60, 52, 78, 90, 65, 48].map((val, i) => (
               <div key={i} className="w-[10%] flex flex-col items-center gap-3">
                  <div 
                    className="w-full bg-emerald-500/20 dark:bg-emerald-500/10 border-t-2 border-emerald-500 rounded-t-lg transition-all hover:bg-emerald-500/40" 
                    style={{ height: `${val}%` }} 
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="glass-card p-8 border-slate-200 dark:border-slate-800 space-y-8">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Service Terms</h4>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Platform Fee</p>
                <p className="text-[10px] text-slate-500 font-medium tracking-tight">Transaction processing</p>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">1.5%</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Agent Commission</p>
                <p className="text-[10px] text-slate-500 font-medium tracking-tight">Channel maintenance</p>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">2.5%</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Settlement Rate</p>
                <p className="text-[10px] text-slate-500 font-medium">To your bank account</p>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white underline decoration-emerald-500 decoration-4">96.0%</span>
            </div>
          </div>
          <button
            onClick={() => setTab("settings")}
            className="w-full py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
          >
            Review Agreement
          </button>
        </div>
      </div>
    </div>
  );

  const renderCollections = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <CRUDLayout
        title="Transaction History"
        columns={collectionsColumns}
        data={collections}
        loading={loadingCollections}
        pageable={pageable}
        onPageChange={(page) => fetchCollections(page, pageable.size)}
        onSizeChange={(size) => fetchCollections(1, size)}
        onRefresh={() => fetchCollections(pageable.page, pageable.size)}
      />
    </div>
  );

  const renderSettlements = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <CRUDLayout
        title="Payout Settlements"
        columns={settlementColumns}
        data={MOCK_SETTLEMENTS}
        loading={false}
        pageable={{ page: 1, size: 10, totalElements: MOCK_SETTLEMENTS.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onRefresh={() => {}}
      />
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl space-y-10 animate-in fade-in duration-500">
      <section className="glass-card p-8 border-slate-200 dark:border-slate-800 space-y-8">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
          Organization Profile
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
            <input type="text" defaultValue={displayName || "Organization"} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Settlement Bank</label>
            <input type="text" defaultValue="Standard Chartered" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none" />
          </div>
        </div>
      </section>

      <section className="glass-card p-8 border-slate-200 dark:border-slate-800 space-y-8">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Notifications</h4>
        <div className="space-y-4">
          {[
            { key: 'dailySummary' as const, label: 'Daily Collection Summary', desc: 'Receive automated reports every morning.' },
            { key: 'payoutAlerts' as const, label: 'Payout Alerts', desc: 'Notify immediately on successful settlement.' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
                <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(key)}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-all",
                  notifConfig[key] ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", notifConfig[key] ? "right-1" : "left-1")} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end pt-2">
        <button className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all">
          Update Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 font-sans">
      {activeTab === "overview" && renderOverview()}
      {activeTab === "collections" && renderCollections()}
      {activeTab === "settlements" && renderSettlements()}
      {activeTab === "notifications" && <NotificationsPage />}
      {activeTab === "settings" && renderSettings()}
      {activeTab === "profile" && (
        <div className="animate-in fade-in duration-300">
          <UserProfile />
        </div>
      )}
    </div>
  );
}
