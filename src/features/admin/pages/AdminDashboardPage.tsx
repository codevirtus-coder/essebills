import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthToken } from "../../auth/auth.storage";
import { ROUTE_PATHS } from "../../../router/paths";
import "../../agent/styles/agent-dashboard.css";
import StatCard from "../../agent/components/StatCard";
import Transactions from "../components/Transactions";
import Billers from "../components/Billers";
import Agents from "../components/Agents";
import Users from "../components/Users";
import Messaging from "../components/Messaging";
import Reports from "../components/Reports";
import Settings from "../components/Settings";
import Support from "../components/Support";
import UserProfile from "../components/UserProfile";
import { INITIAL_FAQS } from "../data/constants";

type AdminTab =
  | "dashboard"
  | "transactions"
  | "billers"
  | "agents"
  | "commissions"
  | "users"
  | "messaging"
  | "reports"
  | "profile"
  | "settings"
  | "support";

const NAV_ITEMS: Array<{ id: AdminTab; label: string; icon: string }> = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "transactions", label: "Transactions", icon: "receipt_long" },
  { id: "billers", label: "Billers", icon: "corporate_fare" },
  { id: "agents", label: "Agents", icon: "storefront" },
  { id: "commissions", label: "Commissions", icon: "payments" },
  { id: "users", label: "Users", icon: "group" },
  { id: "messaging", label: "SMS & Email", icon: "chat_bubble" },
  { id: "reports", label: "Reports", icon: "analytics" },
];

const PREFERENCE_ITEMS: Array<{ id: AdminTab; label: string; icon: string }> = [
  { id: "profile", label: "Profile", icon: "account_circle" },
  { id: "settings", label: "Settings", icon: "settings" },
  { id: "support", label: "Support", icon: "help" },
];

const REVENUE_DATA = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 8000 },
  { month: "Jun", revenue: 7000 },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [faqs, setFaqs] = useState(INITIAL_FAQS);

  const handleSignOut = () => {
    clearAuthToken();
    navigate(ROUTE_PATHS.loginAdmin, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background-light font-display text-dark-text flex">
      <aside className="w-64 bg-white border-r border-neutral-light flex flex-col h-screen shrink-0">
        <div className="p-6">
          <p className="text-[3.05rem] leading-none italic font-black text-primary">
            EseBills
          </p>
          <span className="block h-[3px] w-[76px] rounded-full bg-accent-green ml-[2px] mt-1" />
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[1rem] font-semibold transition-colors ${
                activeTab === item.id
                  ? "bg-neutral-light text-dark-text border-l-4 border-primary"
                  : "text-neutral-text hover:bg-neutral-light/50"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="pt-10 pb-4">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-neutral-text/50">
              Preferences
            </p>
          </div>

          {PREFERENCE_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[1rem] font-semibold transition-colors ${
                activeTab === item.id
                  ? "bg-neutral-light text-dark-text border-l-4 border-primary"
                  : "text-neutral-text hover:bg-neutral-light/50"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[1rem] font-semibold text-red-500 hover:bg-red-50 mt-8 mb-4"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-neutral-light shadow-sm flex items-center justify-between px-8 sticky top-0 z-[60]">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text/50 text-xl">
                  search
                </span>
                <input
                  className="w-full bg-neutral-light/50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 text-dark-text placeholder:text-neutral-text/50 h-10"
                  placeholder="Search transactions, users, or billers..."
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-neutral-light/50 text-neutral-text hover:bg-neutral-light">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                2
              </span>
            </button>
            <div className="h-8 w-[1px] bg-neutral-light mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-dark-text">Alex Mukunda</p>
                <p className="text-[10px] text-neutral-text font-medium">
                  System Administrator
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#9fa89b] border-2 border-primary/10" />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 overflow-y-auto">
          {activeTab === "dashboard" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="Total Revenue"
                  value="$240,500.00"
                  change="+12.5% vs LW"
                  icon="payments"
                  iconBg="bg-primary/10"
                  iconColor="text-primary"
                  chartPath="M0 25 Q 20 10, 40 20 T 80 5 T 100 15"
                  strokeColor="#7e56c2"
                />
                <StatCard
                  label="Total Transactions"
                  value="12,450"
                  change="+8.2% vs LW"
                  icon="sync_alt"
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  chartPath="M0 20 Q 25 25, 50 10 T 100 5"
                  strokeColor="#7e56c2"
                />
                <StatCard
                  label="Active Users"
                  value="8,200"
                  change="+5.1% vs LW"
                  icon="person_check"
                  iconBg="bg-accent-green/10"
                  iconColor="text-accent-green"
                  chartPath="M0 25 L 20 15 L 40 22 L 60 8 L 80 12 L 100 2"
                  strokeColor="#a3e635"
                />
                <StatCard
                  label="Agent Earnings"
                  value="$3,999.3"
                  change="+8.4% vs ytd"
                  icon="storefront"
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                  chartPath="M0 15 Q 50 5, 100 25"
                  strokeColor="#7e56c2"
                />
              </div>

              <div className="bg-white rounded-[32px] border border-neutral-light shadow-sm overflow-hidden">
                <div className="p-8 border-b border-neutral-light flex items-center justify-between">
                  <div>
                    <h4 className="text-[2.4rem] font-black text-dark-text">Revenue Pulse</h4>
                    <p className="text-[1.2rem] font-bold text-neutral-text uppercase tracking-widest mt-1">
                      Global performance metrics
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-neutral-light/50 p-2 rounded-xl text-neutral-text hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">download</span>
                    </button>
                    <select className="bg-neutral-light/50 border-none rounded-xl text-[13px] font-black uppercase tracking-widest py-2 px-4 focus:ring-1 focus:ring-primary">
                      <option>Last 6 Months</option>
                      <option>Year to Date</option>
                    </select>
                  </div>
                </div>

                <div className="h-[330px] p-8 pt-6 relative">
                  <div className="absolute inset-x-8 top-8 bottom-8 rounded-2xl border border-dashed border-[#e3e0eb] bg-[linear-gradient(to_bottom,transparent_0,transparent_59px,#eceaf1_59px,#eceaf1_60px)]" />
                  <svg viewBox="0 0 640 240" className="absolute inset-x-10 bottom-8 h-[260px]" preserveAspectRatio="none">
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
                  <div className="absolute bottom-5 left-12 right-12 grid grid-cols-6 text-[12px] font-bold text-neutral-text">
                    {REVENUE_DATA.map((item) => (
                      <span key={item.month} className="text-center">
                        {item.month}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "transactions" ? <Transactions /> : null}
          {activeTab === "billers" ? <Billers /> : null}
          {activeTab === "agents" ? <Agents /> : null}
          {activeTab === "users" ? <Users /> : null}
          {activeTab === "messaging" ? <Messaging /> : null}
          {activeTab === "reports" ? <Reports /> : null}
          {activeTab === "commissions" ? (
            <Settings initialTab="commissions" faqs={faqs} setFaqs={setFaqs} />
          ) : null}
          {activeTab === "profile" ? <UserProfile /> : null}
          {activeTab === "settings" ? (
            <Settings initialTab="categories" faqs={faqs} setFaqs={setFaqs} />
          ) : null}
          {activeTab === "support" ? <Support /> : null}
        </div>
      </main>
    </div>
  );
}
