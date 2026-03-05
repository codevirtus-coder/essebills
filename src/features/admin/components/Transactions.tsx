import React, { useState, useMemo, useEffect } from "react";
import { TransactionStatus } from "../data/types";
import { DataTable, TableColumn } from "../../../components/ui/DataTable";
import {
  getRecentPaymentTransactions,
  type DashboardTransaction,
} from "../services/adminDashboard.service";
import { AdminTableLayout } from "./shared/AdminTableLayout";
import {
  AdminPrimaryButton,
  AdminSearchInput,
  AdminSelect,
  AdminStatusBadge,
  statusVariant,
} from "./shared/AdminControls";
import { ADMIN_CARD, ADMIN_SECTION_LABEL } from "./shared/adminUi";

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

  const stats = useMemo(() => {
    const total = transactions.length;
    if (total === 0)
      return { successPct: "—", pendingCount: 0, failurePct: "—" };
    const success = transactions.filter(
      (tx) => tx.status === TransactionStatus.SUCCESS,
    ).length;
    const pending = transactions.filter(
      (tx) => tx.status === TransactionStatus.PENDING,
    ).length;
    const failed = transactions.filter(
      (tx) => tx.status === TransactionStatus.FAILED,
    ).length;
    return {
      successPct: ((success / total) * 100).toFixed(1) + "%",
      pendingCount: pending,
      failurePct: ((failed / total) * 100).toFixed(1) + "%",
    };
  }, [transactions]);

  const columns: TableColumn<DashboardTransaction>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Transaction ID",
        render: (tx) => (
          <span className="text-xs font-mono font-bold text-primary">
            #EB-{String(tx.id ?? "").padStart(6, "0")}
          </span>
        ),
      },
      {
        key: "datetime",
        header: "Date & Time",
        render: (tx) => (
          <>
            <p className="text-sm font-bold text-dark-text dark:text-gray-200">
              {tx.date ?? "—"}
            </p>
            <p className="text-[10px] text-neutral-text uppercase tracking-tighter">
              {tx.time ?? ""}
            </p>
          </>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        render: (tx) => (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-inner ${
                tx.status === TransactionStatus.SUCCESS
                  ? "bg-primary/10 text-primary"
                  : tx.status === TransactionStatus.PENDING
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-red-50 text-red-600"
              }`}
            >
              {tx.customerInitials ?? "??"}
            </div>
            <p className="text-sm font-bold text-dark-text dark:text-gray-200">
              {tx.customerName ?? "—"}
            </p>
          </div>
        ),
      },
      {
        key: "biller",
        header: "Biller",
        render: (tx) => (
          <span className="text-xs font-bold text-neutral-text">
            {tx.biller ?? "—"}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        align: "right",
        render: (tx) => (
          <p className="text-sm font-black text-dark-text dark:text-white">
            ${(tx.amount ?? 0).toFixed(2)}
          </p>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (tx) => (
          <AdminStatusBadge variant={statusVariant(tx.status ?? "")}>
            {tx.status ?? "—"}
          </AdminStatusBadge>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: () => (
          <div className="flex items-center justify-end gap-2">
            <button
              className="w-8 h-8 flex items-center justify-center hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg text-neutral-text transition-colors"
              title="View Receipt"
            >
              <span className="material-symbols-outlined text-lg">
                receipt_long
              </span>
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const summaryCards = [
    {
      label: "Successful",
      value: stats.successPct,
      icon: "check_circle",
      color: "text-accent-green",
      bg: "bg-accent-green/10",
    },
    {
      label: "Processing",
      value: String(stats.pendingCount),
      icon: "pending",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Failures",
      value: stats.failurePct,
      icon: "error",
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <AdminTableLayout
      title="Transactions History"
      subtitle="Monitor and manage all customer payments across the platform."
      actions={
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 h-10 bg-white border border-neutral-light dark:border-white/5 rounded-lg text-sm font-bold text-neutral-text hover:bg-neutral-light transition-all">
            <span className="material-symbols-outlined text-lg">
              calendar_month
            </span>
            Last 30 Days
          </button>
          <AdminPrimaryButton>
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </AdminPrimaryButton>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryCards.map((card, i) => (
            <div
              key={i}
              className={`${ADMIN_CARD} p-6 flex items-center gap-4`}
            >
              <div
                className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}
              >
                <span className="material-symbols-outlined">{card.icon}</span>
              </div>
              <div>
                <p className={ADMIN_SECTION_LABEL}>{card.label}</p>
                <h4 className="text-xl font-extrabold text-dark-text dark:text-white">
                  {card.value}
                </h4>
              </div>
            </div>
          ))}
        </div>
      }
      toolbar={
        <>
          <AdminSearchInput
            placeholder="Search by customer, biller or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AdminSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-40"
          >
            <option value="ALL">All Status</option>
            <option value={TransactionStatus.SUCCESS}>Successful</option>
            <option value={TransactionStatus.PENDING}>Pending</option>
            <option value={TransactionStatus.FAILED}>Failed</option>
          </AdminSelect>
        </>
      }
    >
      <DataTable
        columns={columns}
        data={filteredTransactions}
        rowKey={(r) => String(r.id)}
        emptyMessage="No transactions found matching your filters."
        loading={loading}
      />

      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-light dark:border-white/5">
        <p className="text-xs text-neutral-text font-bold">
          Showing{" "}
          <span className="text-dark-text dark:text-white">
            {filteredTransactions.length}
          </span>{" "}
          of{" "}
          <span className="text-dark-text dark:text-white">
            {transactions.length}
          </span>{" "}
          results
        </p>
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-neutral-text hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg disabled:opacity-30"
            disabled
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {[1, 2, 3, "...", 45].map((page, i) => (
            <button
              key={i}
              className={`w-9 h-9 text-xs font-black rounded-lg transition-all ${
                page === 1
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-neutral-text hover:bg-neutral-light dark:hover:bg-white/10"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="p-2 text-neutral-text hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </AdminTableLayout>
  );
};

export default Transactions;
