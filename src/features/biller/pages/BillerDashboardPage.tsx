import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import UserProfile from "../../admin/components/UserProfile";
import StatCard from "../../../components/ui/StatCard";
import { DataTable, type TableColumn } from "../../../components/ui";
import { getCurrentUserProfile } from "../../auth/auth.service";
import { getAuthSession, saveAuthSession } from "../../auth/auth.storage";
import type { UserProfileDto } from "../../auth/dto/auth.dto";
import { getPayments } from "../../../services/payments.service";
import type { PaymentTransaction } from "../../../types";
import "../styles/biller-portal.css";

const COLLECTION_DATA = [
  { day: "Mon", amount: 12400 },
  { day: "Tue", amount: 15600 },
  { day: "Wed", amount: 13200 },
  { day: "Thu", amount: 18900 },
  { day: "Fri", amount: 21000 },
  { day: "Sat", amount: 14500 },
  { day: "Sun", amount: 11000 },
];

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

// Collections table columns
const collectionsColumns: TableColumn<PaymentTransaction>[] = [
  {
    key: 'transaction',
    header: 'Transaction',
    render: (c) => {
      const dateStr = c.dateTimeOfTransaction
        ? new Date(c.dateTimeOfTransaction).toLocaleDateString()
        : '—';
      return (
        <div>
          <p className="text-xs font-bold text-dark-text">{dateStr}</p>
          <p className="text-[9px] font-black text-neutral-text uppercase">{c.productName ?? ''} • {c.id}</p>
        </div>
      );
    },
  },
  {
    key: 'customerRef',
    header: 'Customer Ref',
    render: (c) => {
      const customerRef = c.customerPhoneNumber ?? c.customerEmail ?? c.productReferenceNumber ?? '—';
      return <span className="text-sm font-bold text-neutral-text">{customerRef}</span>;
    },
  },
  {
    key: 'gross',
    header: 'Gross',
    align: 'right',
    render: (c) => {
      const gross = Number(c.amount) || 0;
      return <span className="text-sm font-black text-dark-text">${gross.toFixed(2)}</span>;
    },
  },
  {
    key: 'fee',
    header: 'Fee',
    align: 'right',
    render: (c) => {
      const fee = Number(c.serviceFees) || 0;
      return <span className="text-sm font-bold text-red-500">-${fee.toFixed(2)}</span>;
    },
  },
  {
    key: 'net',
    header: 'Net',
    align: 'right',
    render: (c) => {
      const gross = Number(c.amount) || 0;
      const fee = Number(c.serviceFees) || 0;
      const net = gross - fee;
      return <span className="text-sm font-black text-accent-green">${net.toFixed(2)}</span>;
    },
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (c) => {
      const statusStr = c.paymentStatus ?? '';
      return (
        <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase tracking-widest">
          {statusStr || 'Completed'}
        </span>
      );
    },
  },
];

// Settlements table columns
const settlementsColumns: TableColumn<typeof MOCK_SETTLEMENTS[number]>[] = [
  {
    key: 'id',
    header: 'Payout ID',
    render: (s) => <span className="text-xs font-black text-primary">{s.id}</span>,
  },
  {
    key: 'date',
    header: 'Date',
    render: (s) => (
      <div>
        <p className="text-sm font-bold text-dark-text">{s.date}</p>
        <p className="text-[9px] font-black text-neutral-text uppercase">{s.period}</p>
      </div>
    ),
  },
  {
    key: 'gross',
    header: 'Gross Collection',
    render: (s) => <span className="text-sm font-bold text-neutral-text">${s.gross.toLocaleString()}</span>,
  },
  {
    key: 'net',
    header: 'Net Payout',
    align: 'right',
    render: (s) => <span className="text-base font-black text-dark-text">${s.net.toLocaleString()}</span>,
  },
  {
    key: 'reference',
    header: 'Reference',
    render: (s) => <span className="text-xs font-mono text-neutral-text">{s.reference}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (s) => (
      <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase tracking-widest">{s.status}</span>
    ),
  },
];

export function BillerDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const setTab = (tab: string) => setSearchParams({ tab });

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

  // Collections data — null means "not yet fetched"
  const [collections, setCollections] = useState<PaymentTransaction[] | null>(null);

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

  // Fetch collections when that tab is first visited
  useEffect(() => {
    if (activeTab !== "collections" || collections !== null) return;
    let mounted = true;
    getPayments({ size: 50 })
      .then((data) => {
        if (mounted) setCollections(data.content ?? []);
      })
      .catch(() => { if (mounted) setCollections([]); });
    return () => { mounted = false; };
  }, [activeTab, collections]);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Gross Collections"
          value="$12,280.50"
          change="+18.2% vs LW"
          icon="payments"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          chartPath="M0 25 Q 20 10, 40 20 T 80 5 T 100 15"
          strokeColor="#7e56c2"
        />
        <StatCard
          label="Total Deductions"
          value="-$420.00"
          change="3.4% Commission Avg"
          icon="account_tree"
          iconBg="bg-red-50"
          iconColor="text-red-500"
          chartPath="M0 10 L 100 30"
          strokeColor="#ef4444"
        />
        <StatCard
          label="Net Settlement"
          value="$11,860.50"
          change="Pending Payout"
          icon="check_circle"
          iconBg="bg-accent-green/10"
          iconColor="text-accent-green"
          chartPath="M0 25 L 20 15 L 40 22 L 100 2"
          strokeColor="#a3e635"
        />
        <StatCard
          label="Collection Points"
          value="42 Agents"
          change="Real-time Network"
          icon="hub"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          chartPath="M0 15 Q 50 5, 100 25"
          strokeColor="#3b82f6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 min-w-0 bg-white p-8 rounded-[3rem] border border-neutral-light shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-dark-text tracking-tight">
              Revenue Stream Analysis
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-neutral-text uppercase">Collections</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-accent-green" />
                <span className="text-[10px] font-bold text-neutral-text uppercase">Net Profit</span>
              </div>
            </div>
          </div>
          <div className="relative h-[300px] w-full rounded-3xl border border-dashed border-[#e3e0eb] overflow-hidden bg-[linear-gradient(to_bottom,transparent_0,transparent_59px,#eceaf1_59px,#eceaf1_60px)]">
            <svg viewBox="0 0 640 240" className="absolute inset-x-2 bottom-10 h-[230px]" preserveAspectRatio="none">
              <path d="M0 150 C80 182,140 170,220 132 C290 98,360 80,430 86 C500 92,560 126,640 146 L640 240 L0 240 Z" fill="rgba(126,86,194,.16)" />
              <path d="M0 150 C80 182,140 170,220 132 C290 98,360 80,430 86 C500 92,560 126,640 146" fill="none" stroke="#7e56c2" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div className="absolute left-4 top-[44%] rounded-2xl bg-white shadow-lg px-4 py-3">
              <p className="text-xl font-black text-dark-text leading-none">Mon</p>
              <p className="text-[#7e56c2] font-bold text-lg leading-none mt-2">amount : 12400</p>
            </div>
            <div className="absolute bottom-2 left-8 right-8 grid grid-cols-6 text-[12px] font-bold text-neutral-text">
              {COLLECTION_DATA.slice(1).map((item) => (
                <span key={item.day} className="text-center">{item.day}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-neutral-light shadow-sm space-y-8 min-w-0">
          <h4 className="text-sm font-black uppercase tracking-widest text-neutral-text">Fee Structure</h4>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-light">
              <div>
                <p className="text-xs font-bold text-dark-text">Platform Service Fee</p>
                <p className="text-[10px] text-neutral-text">Fixed processing per item</p>
              </div>
              <span className="text-sm font-black text-primary">1.5%</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-neutral-light">
              <div>
                <p className="text-xs font-bold text-dark-text">Agent Commission Pool</p>
                <p className="text-[10px] text-neutral-text">Channel partner incentive</p>
              </div>
              <span className="text-sm font-black text-accent-green">2.5%</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div>
                <p className="text-xs font-black text-dark-text uppercase">Your Share Rate</p>
                <p className="text-[10px] text-neutral-text">Settled to your bank</p>
              </div>
              <span className="text-xl font-black text-dark-text underline decoration-accent-green decoration-4">96.0%</span>
            </div>
          </div>
          <button
            onClick={() => setTab("settings")}
            className="w-full py-4 bg-background-light rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-light transition-all"
          >
            Review Agreements
          </button>
        </div>
      </div>
    </div>
  );

  const renderCollections = () => (
    <div className="bg-white rounded-[3rem] shadow-sm border border-neutral-light overflow-hidden animate-in fade-in duration-500">
      <div className="p-10 border-b border-neutral-light flex items-center justify-between bg-[#f8fafc]">
        <div>
          <h3 className="text-2xl font-black text-dark-text tracking-tight">Recent Collections</h3>
          <p className="text-[10px] font-bold text-neutral-text uppercase tracking-widest mt-1">Real-time payment inbound log</p>
        </div>
        <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xl shadow-primary/20">
          Download Report
        </button>
      </div>
      {collections === null ? (
        <div className="p-12 flex items-center justify-center gap-3">
          <span className="material-symbols-outlined animate-spin text-neutral-text">sync</span>
          <span className="text-xs font-bold text-neutral-text uppercase tracking-widest">Loading collections...</span>
        </div>
      ) : (
        <DataTable
          columns={collectionsColumns}
          data={collections ?? []}
          rowKey={(c) => c.id ?? Math.random()}
          loading={collections === null}
          emptyMessage="No collections found"
          emptyIcon="payments"
        />
      )}
    </div>
  );

  const renderSettlements = () => (
    <div className="bg-white rounded-[3rem] shadow-sm border border-neutral-light overflow-hidden animate-in fade-in duration-500">
      <div className="p-10 border-b border-neutral-light flex items-center justify-between bg-[#f8fafc]">
        <div>
          <h3 className="text-2xl font-black text-dark-text tracking-tight">Payout History</h3>
          <p className="text-[10px] font-bold text-neutral-text uppercase tracking-widest mt-1">
            Settlements to your Standard Chartered account
          </p>
        </div>
      </div>
      <DataTable
        columns={settlementsColumns}
        data={MOCK_SETTLEMENTS}
        rowKey={(s) => s.id}
        emptyMessage="No settlements found"
        emptyIcon="account_balance"
      />
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl space-y-10 animate-in fade-in duration-500">
      <section className="bg-white p-10 rounded-[3rem] border border-neutral-light shadow-sm space-y-8">
        <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest border-b border-neutral-light pb-2">
          Organizational Profile
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">Display Name</label>
            <input type="text" defaultValue={displayName || "ZESA Prepaid"} className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">Support Email</label>
            <input type="email" defaultValue={profile?.email ?? "billing@zesa.co.zw"} className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">Settlement Bank</label>
            <input type="text" defaultValue="Standard Chartered" className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">Account Number</label>
            <input type="text" defaultValue="**** 9920" className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold" />
          </div>
        </div>
      </section>

      <section className="bg-white p-10 rounded-[3rem] border border-neutral-light shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-light pb-2">
          <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest">Notification Preferences</h4>
        </div>
        <div className="space-y-4">
          {[
            { key: 'dailySummary' as const, label: 'Daily Collection Summary', desc: 'Receive an email at 08:00 AM daily.' },
            { key: 'payoutAlerts' as const, label: 'Payout Alerts', desc: 'Get notified immediately after a successful bank settlement.' },
            { key: 'lowFloatAlerts' as const, label: 'Low Float Alerts (Agents)', desc: 'Get notified when agents are low on liquidity.' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-3xl group transition-all">
              <div>
                <p className="text-sm font-bold text-dark-text">{label}</p>
                <p className="text-[10px] text-neutral-text font-medium">{desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(key)}
                className={`w-10 h-5 rounded-full relative transition-all ${notifConfig[key] ? "bg-primary" : "bg-neutral-light"}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notifConfig[key] ? "right-1" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
          Update Portal Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 font-display text-dark-text">
      {activeTab === "overview" && renderOverview()}
      {activeTab === "collections" && renderCollections()}
      {activeTab === "settlements" && renderSettlements()}
      {activeTab === "settings" && renderSettings()}
      {activeTab === "profile" && (
        <div className="animate-in fade-in duration-300">
          <UserProfile />
        </div>
      )}
    </div>
  );
}
