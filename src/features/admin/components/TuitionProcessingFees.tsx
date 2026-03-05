// ============================================================================
// Tuition Processing Fees Page
// ============================================================================

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { adminJsonFetch } from "../services";
import { DataTable, type TableColumn } from "../../../components/ui";
import { AdminTableLayout } from "./shared/AdminTableLayout";
import {
  AdminPrimaryButton,
  AdminRefreshButton,
  AdminSearchInput,
  AdminInput,
} from "./shared/AdminControls";
import { ADMIN_CARD, ADMIN_SECTION_LABEL } from "./shared/adminUi";

type UnknownRecord = Record<string, unknown>;

const TuitionProcessingFees: React.FC = () => {
  const [fees, setFees] = useState<UnknownRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFee, setNewFee] = useState<UnknownRecord>({
    name: "",
    feeAmount: "",
    feeType: "",
    institutionId: "",
    isActive: true,
  });

  const loadFees = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminJsonFetch<UnknownRecord[]>(
        "/v1/tuition-processing-fees/all",
      );
      setFees(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load processing fees",
      );
      setFees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFees();
  }, [loadFees]);

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminJsonFetch<UnknownRecord>("/v1/tuition-processing-fees", {
        method: "POST",
        body: {
          ...newFee,
          feeAmount: Number(newFee.feeAmount),
        },
      });
      toast.success("Processing fee created successfully");
      setShowAddModal(false);
      setNewFee({
        name: "",
        feeAmount: "",
        feeType: "",
        institutionId: "",
        isActive: true,
      });
      void loadFees();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create processing fee",
      );
    }
  };

  const filteredFees = fees.filter((fee) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      String(fee.name ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      String(fee.feeType ?? "")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const columns: TableColumn<UnknownRecord>[] = [
    {
      key: "id",
      header: "ID",
      render: (fee) => (
        <span className="text-xs font-black text-neutral-text">
          {String(fee.id ?? "")}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (fee) => (
        <span className="text-sm font-bold text-dark-text dark:text-gray-200">
          {String(fee.name ?? "")}
        </span>
      ),
    },
    {
      key: "feeType",
      header: "Fee Type",
      render: (fee) => (
        <span className="text-sm text-neutral-text">
          {String(fee.feeType ?? "")}
        </span>
      ),
    },
    {
      key: "feeAmount",
      header: "Amount",
      align: "right",
      render: (fee) => (
        <span className="text-sm font-black text-dark-text dark:text-white">
          ${Number(fee.feeAmount ?? fee.amount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "institution",
      header: "Institution",
      render: (fee) => (
        <span className="text-sm text-neutral-text">
          {String(fee.institutionId ?? fee.institution ?? "")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (fee) => (
        <span
          className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
            fee.isActive === true ||
            fee.active === true ||
            String(fee.status ?? "").toUpperCase() === "ACTIVE"
              ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {fee.isActive === true ||
          fee.active === true ||
          String(fee.status ?? "").toUpperCase() === "ACTIVE"
            ? "Active"
            : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: () => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {}}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 hover:text-primary text-neutral-text transition-all"
            title="Edit"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
          <button
            onClick={() => {}}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 text-neutral-text transition-all"
            title="Delete"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">
            Tuition Processing Fees
          </h2>
          <p className="text-sm text-neutral-text">
            Manage processing fees for tuition payments.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void loadFees()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-light dark:border-white/5 rounded-xl text-sm font-bold text-neutral-text hover:bg-neutral-light dark:hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Fee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">
            Total Fees
          </p>
          <p className="text-2xl font-extrabold text-dark-text dark:text-white">
            {fees.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">
            Active
          </p>
          <p className="text-2xl font-extrabold text-green-600">
            {
              fees.filter(
                (f) =>
                  f.isActive === true ||
                  f.active === true ||
                  String(f.status ?? "").toUpperCase() === "ACTIVE",
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">
            Min Fee
          </p>
          <p className="text-2xl font-extrabold text-primary">
            $
            {Math.min(
              ...fees.map((f) => Number(f.feeAmount ?? f.amount ?? 0)),
              0,
            ).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">
            Max Fee
          </p>
          <p className="text-2xl font-extrabold text-primary">
            $
            {Math.max(
              ...fees.map((f) => Number(f.feeAmount ?? f.amount ?? 0)),
              0,
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 p-4">
        <div className="max-w-md">
          <AdminSearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or fee type..."
          />
        </div>
      </div>

      {/* Fees Table */}
      <DataTable
        columns={columns}
        data={filteredFees}
        rowKey={(fee: UnknownRecord) => String(fee.id ?? Math.random())}
        loading={isLoading}
        emptyMessage="No processing fees found"
        emptyIcon="payments"
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-extrabold text-dark-text dark:text-white mb-4">
              Add Processing Fee
            </h3>
            <form onSubmit={handleCreateFee} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Fee Name
                </label>
                <input
                  type="text"
                  value={String(newFee.name ?? "")}
                  onChange={(e) =>
                    setNewFee({ ...newFee, name: e.target.value })
                  }
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Fee Amount ($)
                </label>
                <input
                  type="number"
                  value={String(newFee.feeAmount ?? "")}
                  onChange={(e) =>
                    setNewFee({ ...newFee, feeAmount: e.target.value })
                  }
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Fee Type
                </label>
                <input
                  type="text"
                  value={String(newFee.feeType ?? "")}
                  onChange={(e) =>
                    setNewFee({ ...newFee, feeType: e.target.value })
                  }
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  placeholder="e.g., Processing, Settlement"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Institution ID
                </label>
                <input
                  type="text"
                  value={String(newFee.institutionId ?? "")}
                  onChange={(e) =>
                    setNewFee({ ...newFee, institutionId: e.target.value })
                  }
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-neutral-light dark:border-white/5 rounded-xl text-sm font-bold text-neutral-text hover:bg-neutral-light/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TuitionProcessingFees;
