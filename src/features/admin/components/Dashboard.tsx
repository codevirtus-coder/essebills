import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../../../components/ui/StatCard";
import CRUDLayout, { type CRUDColumn } from "../../shared/components/CRUDLayout";
import {
  MOCK_STATS,
  BILLER_PERFORMANCE,
  REVENUE_DATA,
  MOCK_AGENTS,
} from "../data/constants";
import {
  getRecentPaymentTransactions,
  getUsersCount,
  type DashboardTransaction,
} from "../services/adminDashboard.service";
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Wallet, 
  Download, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  Layers
} from "lucide-react";
import { cn } from "../../../lib/utils";

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [usersCount, setUsersCount] = useState<number>(MOCK_STATS.activeUsers);
  const [totalTransactions, setTotalTransactions] = useState<number>(
    MOCK_STATS.totalTransactions,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getRecentPaymentTransactions(), getUsersCount()])
      .then(([txs, count]) => {
        if (!mounted) return;
        setTransactions(txs);
        setTotalTransactions(txs.length || MOCK_STATS.totalTransactions);
        setUsersCount(count || MOCK_STATS.activeUsers);
      })
      .catch(() => {
        /* keep mock fallbacks */
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const txColumns: CRUDColumn<DashboardTransaction>[] = [
    {
      key: "date",
      header: "Transaction Time",
      render: (tx) => (
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {tx.date ?? "—"}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {tx.time ?? ""}
          </p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer Account",
      render: (tx) => {
        const customerInitials =
          tx.customerInitials ??
          (String(tx.customerName ?? "")
            .slice(0, 2)
            .toUpperCase() ||
            "--");
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center text-[10px] font-black border border-emerald-100 dark:border-emerald-800/50">
              {customerInitials}
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {tx.customerName ?? "—"}
            </p>
          </div>
        );
      },
    },
    {
      key: "biller",
      header: "Service Biller",
      render: (tx) => (
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
          {tx.biller ?? "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Settled Amount",
      className: "text-right",
      render: (tx) => (
        <p className="text-sm font-black text-slate-900 dark:text-white">
          ${(Number(tx.amount) || 0).toFixed(2)}
        </p>
      ),
    },
    {
      key: "status",
      header: "Fulfillment",
      className: "text-center",
      render: (tx) => {
        const status = String(tx.status ?? "").toUpperCase();
        const isSuccess = status === "SUCCESS" || status === "COMPLETED" || status === "APPROVED";
        const isPending = status === "PENDING" || status === "PROCESSING";
        
        return (
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            isSuccess 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50" 
              : isPending
              ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
              : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
          )}>
            {tx.status || "—"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={`$${MOCK_STATS.totalRevenue.toLocaleString()}.00`}
          change={MOCK_STATS.revenueChange}
          icon="payments"
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          chartPath="M0 25 Q 20 10, 40 20 T 80 5 T 100 15"
          strokeColor="#10b981"
        />
        <StatCard
          label="Total Transactions"
          value={totalTransactions.toLocaleString()}
          change={MOCK_STATS.transactionsChange}
          icon="sync_alt"
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
          chartPath="M0 20 Q 25 25, 50 10 T 100 5"
          strokeColor="#3b82f6"
        />
        <StatCard
          label="Active Users"
          value={usersCount.toLocaleString()}
          change={MOCK_STATS.usersChange}
          icon="person_check"
          iconBg="bg-purple-50 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
          chartPath="M0 25 L 20 15 L 40 22 L 60 8 L 80 12 L 100 2"
          strokeColor="#a855f7"
        />
        <StatCard
          label="Agent Earnings"
          value={`$${MOCK_AGENTS.reduce((acc, curr) => acc + curr.totalEarnings, 0).toLocaleString()}`}
          change="+8.4% vs ytd"
          icon="storefront"
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600 dark:text-amber-400"
          chartPath="M0 15 Q 50 5, 100 25"
          strokeColor="#f59e0b"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Revenue Pulse
              </h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                Global performance metrics
              </p>
            </div>
            <div className="flex gap-3">
              <button className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-emerald-600 transition-colors">
                <Download size={18} />
              </button>
              <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest py-2 px-4 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option>Last 6 Months</option>
                <option>Year to Date</option>
              </select>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={REVENUE_DATA}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    fontWeight: "bold",
                    backgroundColor: "#1e293b",
                    color: "#fff"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
               Top Billers
             </h4>
             <Layers size={18} className="text-slate-400" />
          </div>
          <div className="space-y-6 flex-1">
            {BILLER_PERFORMANCE.map((biller) => (
              <div key={biller.name} className="space-y-2 group">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                    {biller.name}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    ${biller.amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 group-hover:bg-emerald-400"
                    style={{ width: `${biller.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full bg-slate-900 dark:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-emerald-900/20 hover:scale-[1.02] transition-all">
            Full Audit Report
          </button>
        </div>
      </div>

      {/* Transactions Section */}
      <CRUDLayout
        title="Live Ecosystem Activity"
        columns={txColumns}
        data={transactions}
        loading={isLoading}
        pageable={{ page: 1, size: 10, totalElements: transactions.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onRefresh={() => {}}
        searchable={false}
        actions={{
          renderCustom: () => (
            <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors">
              <MoreVertical size={16} />
            </button>
          )
        }}
      />
    </div>
  );
};

export default Dashboard;
