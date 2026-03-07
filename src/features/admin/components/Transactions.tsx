import React, { useState, useMemo, useEffect } from "react";
import { TransactionStatus } from "../data/types";
import {
  getRecentPaymentTransactions,
  type DashboardTransaction,
} from "../services/adminDashboard.service";
import CRUDLayout, { type CRUDColumn } from "../../shared/components/CRUDLayout";
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  Calendar, 
  Receipt,
  Search,
  ArrowRight
} from "lucide-react";
import { cn } from "../../../lib/utils";

const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getRecentPaymentTransactions()
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((tx) => {
        const name = tx.customerName ?? "";
        const biller = tx.biller ?? "";
        const id = String(tx.id ?? "");
        const matchesSearch =
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          biller.toLowerCase().includes(searchTerm.toLowerCase()) ||
          id.includes(searchTerm);
        const matchesStatus =
          statusFilter === "ALL" || tx.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [transactions, searchTerm, statusFilter],
  );

  const columns: CRUDColumn<DashboardTransaction>[] = [
    {
      key: "id",
      header: "Transaction ID",
      render: (tx) => (
        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
          #EB-{String(tx.id ?? "").padStart(6, "0")}
        </span>
      ),
    },
    {
      key: "datetime",
      header: "Date & Time",
      render: (tx) => (
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {tx.date ?? "—"}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            {tx.time ?? ""}
          </p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (tx) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border",
              tx.status === TransactionStatus.SUCCESS
                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50"
                : tx.status === TransactionStatus.PENDING
                  ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
                  : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
            )}
          >
            {tx.customerInitials ?? "??"}
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {tx.customerName ?? "—"}
          </p>
        </div>
      ),
    },
    {
      key: "biller",
      header: "Biller",
      render: (tx) => (
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
          {tx.biller ?? "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      render: (tx) => (
        <p className="text-sm font-black text-slate-900 dark:text-white">
          ${(tx.amount ?? 0).toFixed(2)}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      render: (tx) => (
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          tx.status === TransactionStatus.SUCCESS
            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50"
            : tx.status === TransactionStatus.PENDING
              ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
              : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
        )}>
          {tx.status === TransactionStatus.SUCCESS ? <CheckCircle size={12} /> : 
           tx.status === TransactionStatus.PENDING ? <Clock size={12} /> : 
           <XCircle size={12} />}
          {tx.status ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            label: "Successful", 
            value: `${((transactions.filter(t => t.status === TransactionStatus.SUCCESS).length / (transactions.length || 1)) * 100).toFixed(1)}%`, 
            icon: CheckCircle, 
            color: "text-emerald-600", 
            bg: "bg-emerald-50 dark:bg-emerald-900/20" 
          },
          { 
            label: "Processing", 
            value: transactions.filter(t => t.status === TransactionStatus.PENDING).length, 
            icon: Clock, 
            color: "text-amber-600", 
            bg: "bg-amber-50 dark:bg-amber-900/20" 
          },
          { 
            label: "Failures", 
            value: `${((transactions.filter(t => t.status === TransactionStatus.FAILED).length / (transactions.length || 1)) * 100).toFixed(1)}%`, 
            icon: XCircle, 
            color: "text-red-600", 
            bg: "bg-red-50 dark:bg-red-900/20" 
          },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by customer, biller or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All Status</option>
            <option value={TransactionStatus.SUCCESS}>Successful</option>
            <option value={TransactionStatus.PENDING}>Pending</option>
            <option value={TransactionStatus.FAILED}>Failed</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <CRUDLayout
        title="Transactions History"
        columns={columns}
        data={filteredTransactions}
        loading={loading}
        pageable={{ page: 1, size: 50, totalElements: filteredTransactions.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        searchable={false}
        actions={{
          renderCustom: () => (
            <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors" title="View Receipt">
              <Receipt size={16} />
            </button>
          )
        }}
      />
    </div>
  );
};

export default Transactions;
