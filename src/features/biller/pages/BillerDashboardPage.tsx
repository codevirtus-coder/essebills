import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutBiller } from "../../auth/biller-auth.service";
import { ROUTE_PATHS } from "../../../router/paths";
import UserProfile from "../../admin/components/UserProfile";
import BillerStatCard from "../components/BillerStatCard";
import BillerLogo from "../components/BillerLogo";
import BillerNotificationMenu from "../components/BillerNotificationMenu";
import { getCurrentUserProfile } from "../../auth/auth.service";
import { getAuthSession, saveAuthSession } from "../../auth/auth.storage";
import type { UserProfileDto } from "../../auth/dto/auth.dto";
import "../styles/biller-portal.css";

type BillerTab = "overview" | "collections" | "settlements" | "settings" | "profile";

const COLLECTION_DATA = [
  { day: "Mon", amount: 12400 },
  { day: "Tue", amount: 15600 },
  { day: "Wed", amount: 13200 },
  { day: "Thu", amount: 18900 },
  { day: "Fri", amount: 21000 },
  { day: "Sat", amount: 14500 },
  { day: "Sun", amount: 11000 },
];

const MOCK_COLLECTIONS = [
  {
    id: "C-99201",
    date: "May 24, 2024",
    time: "14:20 PM",
    customer: "0771 223 994",
    amount: 50.0,
    fee: 0.75,
    net: 49.25,
    status: "Completed",
  },
  {
    id: "C-99202",
    date: "May 24, 2024",
    time: "14:15 PM",
    customer: "0783 112 003",
    amount: 120.0,
    fee: 1.8,
    net: 118.2,
    status: "Completed",
  },
  {
    id: "C-99203",
    date: "May 24, 2024",
    time: "13:58 PM",
    customer: "0712 554 882",
    amount: 25.0,
    fee: 0.38,
    net: 24.62,
    status: "Completed",
  },
  {
    id: "C-99204",
    date: "May 24, 2024",
    time: "13:45 PM",
    customer: "0774 991 223",
    amount: 10.0,
    fee: 0.15,
    net: 9.85,
    status: "Completed",
  },
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

export function BillerDashboardPage() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [profile, setProfile] = useState<UserProfileDto | null>(session?.profile ?? null);
  const displayName = useMemo(() => {
    const first = profile?.firstName ?? "";
    const last = profile?.lastName ?? "";
    return `${first} ${last}`.trim() || profile?.username || "Biller";
  }, [profile]);

  const [activeTab, setActiveTab] = useState<BillerTab>("overview");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [notifConfig, setNotifConfig] = useState({
    dailySummary: true,
    lowFloatAlerts: false,
    payoutAlerts: true,
    systemUpdates: true,
  });

  const toggleNotif = (key: keyof typeof notifConfig) => {
    setNotifConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (profile) return;
    let mounted = true;
    getCurrentUserProfile()
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        if (session) {
          saveAuthSession({ ...session, profile: data });
        }
      })
      .catch(() => {
        if (!mounted) return;
        setProfile(null);
      });
    return () => {
      mounted = false;
    };
  }, [profile, session]);

  const onLogout = () => {
    logoutBiller();
    navigate(ROUTE_PATHS.login, { replace: true });
  };

  const handleTabChange = (tab: BillerTab) => {
    setActiveTab(tab);
    setIsMobileNavOpen(false);
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <BillerStatCard
          label="Gross Collections"
          value="$12,280.50"
          change="+18.2% vs LW"
          icon="payments"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          chartPath="M0 25 Q 20 10, 40 20 T 80 5 T 100 15"
          strokeColor="#7e56c2"
        />
        <BillerStatCard
          label="Total Deductions"
          value="-$420.00"
          change="3.4% Commission Avg"
          icon="account_tree"
          iconBg="bg-red-50"
          iconColor="text-red-500"
          chartPath="M0 10 L 100 30"
          strokeColor="#ef4444"
        />
        <BillerStatCard
          label="Net Settlement"
          value="$11,860.50"
          change="Pending Payout"
          icon="check_circle"
          iconBg="bg-accent-green/10"
          iconColor="text-accent-green"
          chartPath="M0 25 L 20 15 L 40 22 L 100 2"
          strokeColor="#a3e635"
        />
        <BillerStatCard
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
                <span className="text-[10px] font-bold text-neutral-text uppercase">
                  Collections
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-accent-green" />
                <span className="text-[10px] font-bold text-neutral-text uppercase">
                  Net Profit
                </span>
              </div>
            </div>
          </div>
          <div className="relative h-[300px] w-full rounded-3xl border border-dashed border-[#e3e0eb] overflow-hidden bg-[linear-gradient(to_bottom,transparent_0,transparent_59px,#eceaf1_59px,#eceaf1_60px)]">
            <svg
              viewBox="0 0 640 240"
              className="absolute inset-x-2 bottom-10 h-[230px]"
              preserveAspectRatio="none"
            >
              <path
                d="M0 150 C80 182,140 170,220 132 C290 98,360 80,430 86 C500 92,560 126,640 146 L640 240 L0 240 Z"
                fill="rgba(126,86,194,.16)"
              />
              <path
                d="M0 150 C80 182,140 170,220 132 C290 98,360 80,430 86 C500 92,560 126,640 146"
                fill="none"
                stroke="#7e56c2"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute left-4 top-[44%] rounded-2xl bg-white shadow-lg px-4 py-3">
              <p className="text-xl font-black text-dark-text leading-none">
                Mon
              </p>
              <p className="text-[#7e56c2] font-bold text-lg leading-none mt-2">
                amount : 12400
              </p>
            </div>
            <div className="absolute bottom-2 left-8 right-8 grid grid-cols-6 text-[12px] font-bold text-neutral-text">
              {COLLECTION_DATA.slice(1).map((item) => (
                <span key={item.day} className="text-center">
                  {item.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-neutral-light shadow-sm space-y-8 min-w-0">
          <h4 className="text-sm font-black uppercase tracking-widest text-neutral-text">
            Fee Structure
          </h4>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-light">
              <div>
                <p className="text-xs font-bold text-dark-text">
                  Platform Service Fee
                </p>
                <p className="text-[10px] text-neutral-text">
                  Fixed processing per item
                </p>
              </div>
              <span className="text-sm font-black text-primary">1.5%</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-neutral-light">
              <div>
                <p className="text-xs font-bold text-dark-text">
                  Agent Commission Pool
                </p>
                <p className="text-[10px] text-neutral-text">
                  Channel partner incentive
                </p>
              </div>
              <span className="text-sm font-black text-accent-green">2.5%</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div>
                <p className="text-xs font-black text-dark-text uppercase">
                  Your Share Rate
                </p>
                <p className="text-[10px] text-neutral-text">
                  Settled to your bank
                </p>
              </div>
              <span className="text-xl font-black text-dark-text underline decoration-accent-green decoration-4">
                96.0%
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("settings")}
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
          <h3 className="text-2xl font-black text-dark-text tracking-tight">
            Recent Collections
          </h3>
          <p className="text-[10px] font-bold text-neutral-text uppercase tracking-widest mt-1">
            Real-time payment inbound log
          </p>
        </div>
        <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xl shadow-primary/20">
          Download Report
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-light/10">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                Transaction
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                Customer Ref
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">
                Gross
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">
                Fee
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">
                Net
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {MOCK_COLLECTIONS.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-[#f8fafc] transition-colors group"
              >
                <td className="px-10 py-6">
                  <p className="text-xs font-bold text-dark-text">{c.date}</p>
                  <p className="text-[9px] font-black text-neutral-text uppercase">
                    {c.time} • {c.id}
                  </p>
                </td>
                <td className="px-10 py-6 text-sm font-bold text-neutral-text">
                  {c.customer}
                </td>
                <td className="px-10 py-6 text-right text-sm font-black text-dark-text">
                  ${c.amount.toFixed(2)}
                </td>
                <td className="px-10 py-6 text-right text-sm font-bold text-red-500">
                  -${c.fee.toFixed(2)}
                </td>
                <td className="px-10 py-6 text-right text-sm font-black text-accent-green">
                  ${c.net.toFixed(2)}
                </td>
                <td className="px-10 py-6 text-center">
                  <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase tracking-widest">
                    Completed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettlements = () => (
    <div className="bg-white rounded-[3rem] shadow-sm border border-neutral-light overflow-hidden animate-in fade-in duration-500">
      <div className="p-10 border-b border-neutral-light flex items-center justify-between bg-[#f8fafc]">
        <div>
          <h3 className="text-2xl font-black text-dark-text tracking-tight">
            Payout History
          </h3>
          <p className="text-[10px] font-bold text-neutral-text uppercase tracking-widest mt-1">
            Settlements to your Standard Chartered account
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-light/10">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                Payout ID
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                Date
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                Gross Collection
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">
                Net Payout
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                Reference
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-light">
            {MOCK_SETTLEMENTS.map((s) => (
              <tr key={s.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="px-10 py-6 text-xs font-black text-primary">
                  {s.id}
                </td>
                <td className="px-10 py-6">
                  <p className="text-sm font-bold text-dark-text">{s.date}</p>
                  <p className="text-[9px] font-black text-neutral-text uppercase">
                    {s.period}
                  </p>
                </td>
                <td className="px-10 py-6 text-sm font-bold text-neutral-text">
                  ${s.gross.toLocaleString()}
                </td>
                <td className="px-10 py-6 text-right text-base font-black text-dark-text">
                  ${s.net.toLocaleString()}
                </td>
                <td className="px-10 py-6 text-xs font-mono text-neutral-text">
                  {s.reference}
                </td>
                <td className="px-10 py-6 text-center">
                  <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase tracking-widest">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
            <label className="text-[10px] font-black text-neutral-text uppercase">
              Display Name
            </label>
            <input
              type="text"
              defaultValue="ZESA Prepaid"
              className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">
              Support Email
            </label>
            <input
              type="email"
              defaultValue="billing@zesa.co.zw"
              className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">
              Settlement Bank
            </label>
            <input
              type="text"
              defaultValue="Standard Chartered"
              className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">
              Account Number
            </label>
            <input
              type="text"
              defaultValue="**** 9920"
              className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold"
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-10 rounded-[3rem] border border-neutral-light shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-light pb-2">
          <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest">
            Notification Preferences
          </h4>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-3xl group transition-all">
            <div>
              <p className="text-sm font-bold text-dark-text">
                Daily Collection Summary
              </p>
              <p className="text-[10px] text-neutral-text font-medium">
                Receive an email at 08:00 AM daily.
              </p>
            </div>
            <button
              onClick={() => toggleNotif("dailySummary")}
              className={`w-10 h-5 rounded-full relative transition-all ${
                notifConfig.dailySummary ? "bg-primary" : "bg-neutral-light"
              }`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                  notifConfig.dailySummary ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-3xl group transition-all">
            <div>
              <p className="text-sm font-bold text-dark-text">Payout Alerts</p>
              <p className="text-[10px] text-neutral-text font-medium">
                Get notified immediately after a successful bank settlement.
              </p>
            </div>
            <button
              onClick={() => toggleNotif("payoutAlerts")}
              className={`w-10 h-5 rounded-full relative transition-all ${
                notifConfig.payoutAlerts ? "bg-primary" : "bg-neutral-light"
              }`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                  notifConfig.payoutAlerts ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-3xl group transition-all">
            <div>
              <p className="text-sm font-bold text-dark-text">
                Low Float Alerts (Agents)
              </p>
              <p className="text-[10px] text-neutral-text font-medium">
                Get notified when agents are low on liquidity.
              </p>
            </div>
            <button
              onClick={() => toggleNotif("lowFloatAlerts")}
              className={`w-10 h-5 rounded-full relative transition-all ${
                notifConfig.lowFloatAlerts ? "bg-primary" : "bg-neutral-light"
              }`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                  notifConfig.lowFloatAlerts ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
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
    <div className="min-h-screen bg-background-light font-display text-dark-text">
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden md:flex w-64 bg-white border-r border-neutral-light flex-col h-full shrink-0">
          <div className="p-8">
            <BillerLogo className="h-9" />
          </div>
          <nav className="flex-1 px-4 space-y-1 mt-4">
            {[
              { id: "overview", label: "Overview", icon: "dashboard" },
              { id: "collections", label: "Collections", icon: "receipt_long" },
              {
                id: "settlements",
                label: "Settlements",
                icon: "account_balance",
              },
              { id: "profile", label: "Profile", icon: "person" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as BillerTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg"
                    : "text-neutral-text hover:bg-neutral-light"
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="p-4 mt-auto">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50"
            >
              <span className="material-symbols-outlined">logout</span>
              Exit
            </button>
          </div>
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
                <BillerLogo className="h-8" />
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-9 h-9 rounded-xl bg-neutral-light text-neutral-text flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
              </div>
              <nav className="pt-4 space-y-2">
                {[
                  { id: "overview", label: "Overview", icon: "dashboard" },
                  {
                    id: "collections",
                    label: "Collections",
                    icon: "receipt_long",
                  },
                  {
                    id: "settlements",
                    label: "Settlements",
                    icon: "account_balance",
                  },
                  { id: "profile", label: "Profile", icon: "person" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as BillerTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      activeTab === tab.id
                        ? "bg-primary text-white shadow-lg"
                        : "text-neutral-text hover:bg-neutral-light"
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {tab.icon}
                    </span>
                    {tab.label}
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

        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between sticky top-0 bg-background-light/80 backdrop-blur-md z-20 py-4 -mx-8 px-8">
            <div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen((prev) => !prev)}
                className="md:hidden mb-3 w-10 h-10 rounded-xl bg-white border border-neutral-light text-neutral-text flex items-center justify-center shadow-sm"
                aria-label={
                  isMobileNavOpen ? "Close navigation" : "Open navigation"
                }
              >
                <span className="material-symbols-outlined">
                  {isMobileNavOpen ? "close" : "menu"}
                </span>
              </button>
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest mb-1">
                Biller Enterprise Dashboard
              </p>
              <h2 className="text-3xl font-black text-dark-text tracking-tight">
                ZESA Prepaid
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <BillerNotificationMenu onReplenishFloat={() => {}} />
              <div className="h-10 w-[1px] bg-neutral-light" />
              <button
                type="button"
                onClick={() => handleTabChange("profile")}
                className="flex items-center gap-3"
                aria-label="Open profile"
              >
                <div className="text-right hidden md:block">
                  <p className="text-xs font-black text-dark-text">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-neutral-text font-bold uppercase">
                    {profile?.email ?? ''}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">
                    corporate_fare
                  </span>
                </div>
              </button>
            </div>
          </div>

          {activeTab === "overview" && renderOverview()}
          {activeTab === "collections" && renderCollections()}
          {activeTab === "settlements" && renderSettlements()}
          {activeTab === "settings" && renderSettings()}
          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-300">
              <UserProfile />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

