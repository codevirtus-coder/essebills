// ============================================================================
// Netone Bundle Plans Page
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  getAllNetoneBundlePlans,
  createNetoneBundlePlan,
  changeNetoneBundlePlanStatus,
} from "../services/adminModules.service";
import { DataTable, TableColumn } from "../../../components/ui/DataTable";
import { AdminTableLayout } from "./shared/AdminTableLayout";
import {
  AdminPrimaryButton,
  AdminRefreshButton,
  AdminSearchInput,
  AdminInput,
} from "./shared/AdminControls";
import { ADMIN_CARD, ADMIN_SECTION_LABEL } from "./shared/adminUi";

type UnknownRecord = Record<string, unknown>;

const NetoneBundlePlans: React.FC = () => {
  const [plans, setPlans] = useState<UnknownRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlan, setNewPlan] = useState<UnknownRecord>({
    name: "",
    code: "",
    amount: "",
    validityDays: "",
    isActive: true,
  });

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllNetoneBundlePlans();
      setPlans(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load bundle plans",
      );
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNetoneBundlePlan({
        ...newPlan,
        amount: Number(newPlan.amount),
        validityDays: Number(newPlan.validityDays),
      });
      toast.success("Bundle plan created successfully");
      setShowAddModal(false);
      setNewPlan({
        name: "",
        code: "",
        amount: "",
        validityDays: "",
        isActive: true,
      });
      void loadPlans();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create bundle plan",
      );
    }
  };

  const handleToggleStatus = async (
    id: string | number,
    currentStatus: boolean,
  ) => {
    try {
      await changeNetoneBundlePlanStatus(id, !currentStatus);
      toast.success(
        `Plan ${!currentStatus ? "activated" : "deactivated"} successfully`,
      );
      void loadPlans();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    }
  };

  const filteredPlans = plans.filter((plan) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      String(plan.name ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      String(plan.code ?? "")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const columns: TableColumn<UnknownRecord>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        render: (p, i) => (
          <span className="text-xs font-mono font-bold text-primary">
            #{String(p.id ?? i + 1)}
          </span>
        ),
      },
      {
        key: "name",
        header: "Name",
        render: (p) => (
          <span className="text-sm font-bold text-dark-text dark:text-white">
            {String(p.name ?? "-")}
          </span>
        ),
      },
      {
        key: "code",
        header: "Code",
        render: (p) => (
          <span className="text-sm font-mono text-neutral-text">
            {String(p.code ?? "-")}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        align: "right",
        render: (p) => (
          <span className="text-sm font-black text-dark-text dark:text-white">
            ${Number(p.amount ?? p.value ?? 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "validity",
        header: "Validity",
        align: "center",
        render: (p) => (
          <span className="text-sm text-neutral-text">
            {String(p.validityDays ?? p.validity ?? "-")} days
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (p, i) => {
          const isActive =
            p.isActive === true ||
            p.active === true ||
            String(p.status ?? "").toUpperCase() === "ACTIVE";
          return (
            <button
              onClick={() => handleToggleStatus(String(p.id ?? i), isActive)}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                isActive
                  ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              {isActive ? "ACTIVE" : "INACTIVE"}
            </button>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: () => (
          <div className="flex items-center justify-end gap-1">
            <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg text-neutral-text">
                edit
              </span>
            </button>
            <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg text-neutral-text">
                more_vert
              </span>
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminTableLayout
      title="Netone Bundle Plans"
      subtitle="Manage Netone airtime bundle plans."
      actions={
        <div className="flex gap-3">
          <AdminRefreshButton onClick={() => void loadPlans()}>
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh
          </AdminRefreshButton>
          <AdminPrimaryButton onClick={() => setShowAddModal(true)}>
            <span className="material-symbols-outlined text-lg">add</span>
            Add Plan
          </AdminPrimaryButton>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Plans",
              value: plans.length,
              color: "text-dark-text dark:text-white",
            },
            {
              label: "Active",
              value: plans.filter(
                (p) =>
                  p.isActive === true ||
                  p.active === true ||
                  String(p.status ?? "").toUpperCase() === "ACTIVE",
              ).length,
              color: "text-green-600",
            },
            {
              label: "Inactive",
              value: plans.filter(
                (p) =>
                  p.isActive !== true &&
                  p.active !== true &&
                  String(p.status ?? "").toUpperCase() !== "ACTIVE",
              ).length,
              color: "text-red-600",
            },
            {
              label: "Total Value",
              value: `$${plans.reduce((sum, p) => sum + Number(p.amount ?? p.value ?? 0), 0).toLocaleString()}`,
              color: "text-primary",
            },
          ].map((s, i) => (
            <div key={i} className={`${ADMIN_CARD} p-4`}>
              <p className={ADMIN_SECTION_LABEL}>{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      }
      toolbar={
        <AdminSearchInput
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      }
    >
      <DataTable
        columns={columns}
        data={filteredPlans}
        rowKey={(r) => String(r.id ?? r.code ?? JSON.stringify(r))}
        loading={isLoading}
        emptyMessage="No bundle plans found"
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-extrabold text-dark-text dark:text-white mb-4">
              Add Netone Bundle Plan
            </h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={String(newPlan.name ?? "")}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Plan Code
                </label>
                <input
                  type="text"
                  value={String(newPlan.code ?? "")}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, code: e.target.value })
                  }
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={String(newPlan.amount ?? "")}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, amount: e.target.value })
                  }
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Validity (days)
                </label>
                <input
                  type="number"
                  value={String(newPlan.validityDays ?? "")}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, validityDays: e.target.value })
                  }
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
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
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminTableLayout>
  );
};

export default NetoneBundlePlans;
