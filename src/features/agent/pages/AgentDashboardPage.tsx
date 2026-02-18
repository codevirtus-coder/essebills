import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import Logo from "../components/Logo";
import NotificationMenu from "../components/NotificationMenu";
import { INITIAL_CATEGORIES } from "../constants";
import { clearAuthToken } from "../../auth/auth.storage";
import { ROUTE_PATHS } from "../../../router/paths";
import "../styles/agent-dashboard.css";

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
  {
    id: "S-10293",
    biller: "ZESA Electricity",
    customer: "0771 223 994",
    amount: 20.0,
    commission: 0.5,
    time: "2 mins ago",
    icon: "bolt",
    token: "1922-3884-1002-3394-1102",
    units: "45.2 kWh",
  },
  {
    id: "S-10292",
    biller: "Econet Airtime",
    customer: "0772 445 112",
    amount: 5.0,
    commission: 0.25,
    time: "15 mins ago",
    icon: "cell_tower",
  },
  {
    id: "S-10291",
    biller: "ZINWA Water",
    customer: "ZW-991-001",
    amount: 35.0,
    commission: 0.88,
    time: "1 hour ago",
    icon: "water_drop",
  },
];

const FLOAT_HISTORY: FloatHistory[] = [
  {
    id: "FL-9920",
    date: "May 23, 2024",
    amount: 500.0,
    method: "EcoCash",
    status: "Approved",
  },
  {
    id: "FL-9918",
    date: "May 20, 2024",
    amount: 200.0,
    method: "Visa Card",
    status: "Approved",
  },
  {
    id: "FL-9912",
    date: "May 15, 2024",
    amount: 1000.0,
    method: "Bank Transfer",
    status: "Approved",
  },
];

type ActiveTab =
  | "overview"
  | "sell"
  | "commissions"
  | "schedule"
  | "float"
  | "settings";

export function AgentDashboardPage() {
  const navigate = useNavigate();
  const agentName = "Tinashe Chando";

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [floatBalance] = useState(452.1);
  const [commissionBalance, setCommissionBalance] = useState(24.4);
  const [recentSales] = useState<Sale[]>(INITIAL_SALES);
  const [sellStep, setSellStep] = useState<"select" | "details">("select");
  const [sellForm, setSellForm] = useState({
    billerId: "",
    billerName: "",
    customerRef: "",
    amount: "",
    catId: "util",
  });

  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  const [settingsConfig, setSettingsConfig] = useState({
    lowFloatAlerts: true,
    dailyEarningsSms: false,
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  const billers = [
    {
      id: "zesa",
      name: "ZESA Electricity",
      icon: "bolt",
      color: "bg-orange-50 text-orange-600",
      catId: "util",
    },
    {
      id: "econet",
      name: "Econet Airtime",
      icon: "cell_tower",
      color: "bg-red-50 text-red-600",
      catId: "air",
    },
    {
      id: "netone",
      name: "NetOne Airtime",
      icon: "signal_cellular_alt",
      color: "bg-orange-50 text-orange-600",
      catId: "air",
    },
    {
      id: "telone",
      name: "TelOne Internet",
      icon: "wifi",
      color: "bg-indigo-50 text-indigo-600",
      catId: "net",
    },
  ];

  const getCommissionRate = (catId: string) =>
    INITIAL_CATEGORIES.find((c) => c.id === catId)?.agentRate || 2.0;

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

  const toggleSetting = (key: keyof typeof settingsConfig) => {
    setSettingsConfig((prev) => {
      const newVal = !prev[key];
      const label =
        key === "dailyEarningsSms" ? "Daily SMS report" : "Low float alerts";
      setUpdateFeedback(`${label} ${newVal ? "enabled" : "disabled"}`);
      setTimeout(() => setUpdateFeedback(null), 3000);
      return { ...prev, [key]: newVal };
    });
  };

  const handleUpdateProfile = () => {
    setIsUpdatingProfile(true);
    setTimeout(() => {
      setIsUpdatingProfile(false);
      setUpdateFeedback("Shop profile updated successfully!");
      setTimeout(() => setUpdateFeedback(null), 4000);
    }, 1500);
  };

  const onLogout = () => {
    clearAuthToken();
    navigate(ROUTE_PATHS.loginAgent, { replace: true });
  };

  const onAddFloat = () => setActiveTab("float");
  const onBulkSale = () => {
    setActiveTab("sell");
    setSellStep("select");
  };

  const renderCommissions = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-accent-green p-10 rounded-[3rem] text-dark-text relative overflow-hidden shadow-2xl">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #131118 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-dark-text/40 mb-2">
                Unpaid Earnings
              </p>
              <h3 className="text-5xl font-black tracking-tighter">
                ${(commissionBalance || 0).toFixed(2)}
              </h3>
              <button
                onClick={handleRequestPayout}
                disabled={
                  isRequestingPayout ||
                  payoutRequested ||
                  commissionBalance <= 0
                }
                className={`mt-8 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 ${
                  payoutRequested
                    ? "bg-white text-accent-green border border-accent-green"
                    : "bg-dark-text text-white"
                }`}
              >
                {isRequestingPayout ? (
                  <span className="material-symbols-outlined animate-spin text-sm">
                    sync
                  </span>
                ) : payoutRequested ? (
                  <span className="material-symbols-outlined text-sm">
                    check_circle
                  </span>
                ) : null}
                {isRequestingPayout
                  ? "Processing..."
                  : payoutRequested
                    ? "Payout Success"
                    : "Request Payout"}
              </button>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center border border-white/30 backdrop-blur-md">
              <span className="material-symbols-outlined text-3xl">
                account_balance_wallet
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-neutral-light shadow-sm flex flex-col justify-center gap-6">
          <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest">
            Earning Breakdown
          </h4>
          <div className="space-y-4">
            {INITIAL_CATEGORIES.map((cat) => {
              const rate = Number(cat.agentRate) || 0;
              return (
                <div key={cat.id} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-text">
                    {cat.label}
                  </span>
                  <div className="flex items-center gap-4 flex-1 mx-4">
                    <div className="h-1.5 bg-neutral-light flex-1 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, rate * 10)}%` }}
                        className="bg-accent-green h-full"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-black text-dark-text">
                    {rate.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-neutral-light shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-light flex items-center justify-between bg-[#f8fafc]">
          <h4 className="text-lg font-black text-dark-text tracking-tight">
            Commission Ledger
          </h4>
          <button className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Ledger
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-light/10">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                  Time
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                  Service
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">
                  Sale Amount
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">
                  My Cut
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {recentSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-[#f8fafc] transition-colors"
                >
                  <td className="px-8 py-5 text-xs font-bold text-neutral-text">
                    {sale.time}
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-dark-text">
                      {sale.biller}
                    </p>
                    <p className="text-[10px] font-bold text-neutral-text uppercase">
                      {sale.customer}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-neutral-text">
                    ${(Number(sale.amount) || 0).toFixed(2)}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-accent-green">
                    +${(Number(sale.commission) || 0).toFixed(2)}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase tracking-widest">
                      Accrued
                    </span>
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
      {updateFeedback ? (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10">
          <div className="bg-dark-text text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-white/10">
            <span className="material-symbols-outlined text-accent-green">
              check_circle
            </span>
            <span className="text-sm font-bold tracking-tight">
              {updateFeedback}
            </span>
          </div>
        </div>
      ) : null}

      <section className="bg-white p-12 rounded-[4rem] border border-neutral-light shadow-sm space-y-10">
        <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest border-b border-neutral-light pb-2">
          Business Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">
              Shop Name
            </label>
            <input
              type="text"
              defaultValue="TC General Store"
              className="w-full bg-[#f8fafc] border-none rounded-2xl p-4 text-sm font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">
              Location
            </label>
            <input
              type="text"
              defaultValue="Harare CBD"
              className="w-full bg-[#f8fafc] border-none rounded-2xl p-4 text-sm font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">
              Agent Owner
            </label>
            <input
              type="text"
              defaultValue={agentName}
              className="w-full bg-[#f8fafc] border-none rounded-2xl p-4 text-sm font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-text uppercase">
              Mobile Number
            </label>
            <input
              type="tel"
              defaultValue="+263 771 223 994"
              className="w-full bg-[#f8fafc] border-none rounded-2xl p-4 text-sm font-bold"
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-12 rounded-[4rem] border border-neutral-light shadow-sm space-y-10">
        <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-widest border-b border-neutral-light pb-2">
          Preferences
        </h4>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-3xl group transition-all">
            <div>
              <p className="text-sm font-bold text-dark-text">
                Low Float Alerts
              </p>
              <p className="text-[10px] text-neutral-text font-medium">
                Notify when float falls below $50.
              </p>
            </div>
            <button
              onClick={() => toggleSetting("lowFloatAlerts")}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settingsConfig.lowFloatAlerts ? "bg-primary" : "bg-neutral-light"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settingsConfig.lowFloatAlerts ? "right-1" : "left-1"}`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-3xl group transition-all">
            <div>
              <p className="text-sm font-bold text-dark-text">
                Daily Earnings SMS
              </p>
              <p className="text-[10px] text-neutral-text font-medium">
                Receive a summary of today&apos;s commissions.
              </p>
            </div>
            <button
              onClick={() => toggleSetting("dailyEarningsSms")}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settingsConfig.dailyEarningsSms ? "bg-primary" : "bg-neutral-light"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settingsConfig.dailyEarningsSms ? "right-1" : "left-1"}`}
              />
            </button>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleUpdateProfile}
          disabled={isUpdatingProfile}
          className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          {isUpdatingProfile ? (
            <span className="material-symbols-outlined animate-spin text-sm">
              sync
            </span>
          ) : null}
          {isUpdatingProfile ? "Updating Shop..." : "Update Shop Profile"}
        </button>
      </div>
    </div>
  );

  const renderSell = () => {
    if (sellStep === "select") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {billers.map((biller, idx) => (
            <button
              key={biller.id}
              type="button"
              onClick={() => {
                setSellForm((prev) => ({
                  ...prev,
                  billerId: biller.id,
                  billerName: biller.name,
                  catId: biller.catId,
                }));
                setSellStep("details");
              }}
              className={`bg-white p-10 rounded-[2.6rem] border shadow-sm transition-all text-center ${
                idx === 0
                  ? "border-primary"
                  : "border-neutral-light hover:border-primary/40"
              }`}
            >
              <div className="w-20 h-20 mx-auto rounded-[2rem] bg-[#f3f0ee] flex items-center justify-center mb-5">
                <span
                  className={`material-symbols-outlined text-4xl ${biller.color}`}
                >
                  {biller.icon}
                </span>
              </div>
              <h4 className="text-[2rem] leading-tight font-black text-dark-text">
                {biller.name}
              </h4>
              <p className="mt-5 text-accent-green text-xl font-black uppercase tracking-wider">
                EARN {getCommissionRate(biller.catId)}%
              </p>
            </button>
          ))}
        </div>
      );
    }

    return (
      <section className="max-w-2xl bg-white border border-neutral-light rounded-[2.6rem] p-10 shadow-sm">
        <h3 className="text-3xl font-black tracking-tight text-dark-text">
          Confirm Sale Details
        </h3>
        <p className="text-neutral-text mt-2">
          Enter customer reference and amount for {sellForm.billerName}.
        </p>
        <div className="grid gap-5 mt-8">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Customer Reference / Mobile
            </label>
            <input
              type="text"
              value={sellForm.customerRef}
              onChange={(e) =>
                setSellForm((prev) => ({
                  ...prev,
                  customerRef: e.target.value,
                }))
              }
              placeholder="e.g. 0771223994"
              className="mt-2 w-full bg-[#f8fafc] border-none rounded-2xl p-4 text-sm font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Amount
            </label>
            <input
              type="number"
              value={sellForm.amount}
              onChange={(e) =>
                setSellForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0.00"
              className="mt-2 w-full bg-[#f8fafc] border-none rounded-2xl p-4 text-sm font-bold"
            />
          </div>
          <div className="p-4 rounded-2xl bg-accent-green/10 border border-accent-green/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Estimated Commission
            </p>
            <p className="text-2xl font-black text-accent-green mt-1">
              +$
              {(
                (parseFloat(sellForm.amount) || 0) *
                (getCommissionRate(sellForm.catId) / 100)
              ).toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => setSellStep("select")}
              className="px-6 py-3 rounded-xl border border-neutral-light text-dark-text font-bold"
            >
              Back
            </button>
            <button
              type="button"
              className="px-6 py-3 rounded-xl bg-primary text-white font-bold"
            >
              Confirm Sale
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderSchedule = () => (
    <section className="bg-white rounded-[2.6rem] border border-neutral-light shadow-sm overflow-hidden">
      <div className="p-8 border-b border-neutral-light">
        <h4 className="text-2xl font-black tracking-tight text-dark-text">
          Commission Schedule
        </h4>
      </div>
      <div className="p-8 grid gap-4">
        {INITIAL_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between bg-[#f8fafc] border border-neutral-light rounded-2xl px-6 py-5"
          >
            <div>
              <p className="text-lg font-black text-dark-text">{cat.label}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
                Commission Rate
              </p>
            </div>
            <p className="text-3xl font-black text-accent-green">
              {cat.agentRate}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );

  const renderFloat = () => (
    <section className="bg-white rounded-[2.6rem] border border-neutral-light shadow-sm overflow-hidden">
      <div className="p-8 border-b border-neutral-light flex items-center justify-between">
        <h4 className="text-2xl font-black tracking-tight text-dark-text">
          Float Wallet
        </h4>
        <p className="text-3xl font-black text-primary">
          ${floatBalance.toFixed(2)}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-light/5">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                Date
              </th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                Reference
              </th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                Method
              </th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">
                Amount
              </th>
              <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {FLOAT_HISTORY.map((row) => (
              <tr key={row.id}>
                <td className="px-8 py-5 text-sm font-bold text-dark-text">
                  {row.date}
                </td>
                <td className="px-8 py-5 text-xs font-bold text-primary">
                  {row.id}
                </td>
                <td className="px-8 py-5 text-sm font-semibold text-neutral-text">
                  {row.method}
                </td>
                <td className="px-8 py-5 text-right text-lg font-black text-dark-text">
                  ${row.amount.toFixed(2)}
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[10px] font-black uppercase tracking-widest">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background-light font-display text-dark-text flex">
      <aside className="w-64 bg-white border-r border-neutral-light flex flex-col h-screen shrink-0 sticky top-0">
        <div className="p-8">
          <Logo className="h-9" />
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: "overview", label: "Dashboard", icon: "home" },
            { id: "sell", label: "Make a Sale", icon: "point_of_sale" },
            { id: "commissions", label: "Earnings Analysis", icon: "payments" },
            {
              id: "schedule",
              label: "Commission Schedule",
              icon: "table_chart",
            },
            {
              id: "float",
              label: "Float Wallet",
              icon: "account_balance_wallet",
            },
            { id: "settings", label: "Shop Profile", icon: "settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as ActiveTab);
                if (item.id !== "sell") {
                  setSellStep("select");
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? "bg-primary/10 text-primary" : "text-neutral-text hover:bg-neutral-light"}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50"
          >
            <span className="material-symbols-outlined">logout</span>Exit
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between sticky top-0 bg-background-light/80 backdrop-blur-md z-10 py-2">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              {activeTab === "overview"
                ? "Agent Overview"
                : activeTab === "sell"
                  ? "Sales Console"
                  : activeTab === "commissions"
                    ? "Earnings Analysis"
                    : activeTab === "schedule"
                      ? "Commission Schedule"
                      : activeTab === "float"
                        ? "Float Wallet"
                        : "Shop Profile"}
            </h2>
            <p className="text-neutral-text font-medium mt-1">
              Partner Agent: {agentName}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={onBulkSale}
              className="bg-accent-green text-dark-text px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
            >
              <span className="material-symbols-outlined text-lg">
                batch_prediction
              </span>
              BULK SALE
            </button>
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-neutral-text/50 uppercase tracking-widest">
                AVAILABLE FLOAT
              </p>
              <p className="text-lg font-black text-primary tracking-tighter">
                ${(floatBalance || 0).toFixed(2)}
              </p>
            </div>
            <NotificationMenu onReplenishFloat={onAddFloat} />
          </div>
        </div>

        <div className="pb-12">
          {activeTab === "overview" ? (
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
                  label="Today's Earnings"
                  value={`$${(recentSales.reduce((a, b) => a + (Number(b.commission) || 0), 0) || 0).toFixed(2)}`}
                  change="Instant Accrual"
                  icon="monetization_on"
                  iconBg="bg-accent-green/10"
                  iconColor="text-accent-green"
                  chartPath="M0 20 Q 50 5, 100 15"
                  strokeColor="#a3e635"
                />
              </div>

              <div className="bg-white rounded-[3rem] border border-neutral-light shadow-sm overflow-hidden">
                <div className="p-8 border-b border-neutral-light flex items-center justify-between">
                  <h4 className="text-lg font-black tracking-tight">
                    Recent Sales Activity
                  </h4>
                  <button
                    onClick={() => setActiveTab("sell")}
                    className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    New Sale
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-light/5">
                      <tr>
                        <th className="px-8 py-4 text-[9px] font-black text-neutral-text uppercase tracking-widest">
                          Time
                        </th>
                        <th className="px-8 py-4 text-[9px] font-black text-neutral-text uppercase tracking-widest">
                          Customer
                        </th>
                        <th className="px-8 py-4 text-[9px] font-black text-neutral-text uppercase tracking-widest">
                          Service
                        </th>
                        <th className="px-8 py-4 text-[9px] font-black text-neutral-text uppercase tracking-widest text-right">
                          Amount
                        </th>
                        <th className="px-8 py-4 text-[9px] font-black text-neutral-text uppercase tracking-widest text-right">
                          Comm.
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-light">
                      {recentSales.slice(0, 3).map((sale) => (
                        <tr key={sale.id}>
                          <td className="px-8 py-5 text-xs font-bold text-neutral-text">
                            {sale.time}
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-dark-text">
                            {sale.customer}
                          </td>
                          <td className="px-8 py-5 text-xs font-bold text-neutral-text">
                            {sale.biller}
                          </td>
                          <td className="px-8 py-5 text-right font-black text-dark-text">
                            ${(Number(sale.amount) || 0).toFixed(2)}
                          </td>
                          <td className="px-8 py-5 text-right font-black text-accent-green">
                            +${(Number(sale.commission) || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "sell" ? renderSell() : null}

          {activeTab === "commissions" ? renderCommissions() : null}
          {activeTab === "schedule" ? renderSchedule() : null}
          {activeTab === "float" ? renderFloat() : null}
          {activeTab === "settings" ? renderSettings() : null}
        </div>
      </main>
    </div>
  );
}
