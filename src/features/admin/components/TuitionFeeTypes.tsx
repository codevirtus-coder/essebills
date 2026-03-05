// ============================================================================
// Tuition Fee Types Page
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { adminJsonFetch } from "../services";
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

const TuitionFeeTypes: React.FC = () => {
  const [feeTypes, setFeeTypes] = useState<UnknownRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFeeType, setNewFeeType] = useState<UnknownRecord>({
    name: "",
    description: "",
    isActive: true,
  });

  const loadFeeTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminJsonFetch<UnknownRecord[]>(
        "/v1/tuition-fee-types/all",
      );
      setFeeTypes(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load fee types",
      );
      setFeeTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeeTypes();
  }, [loadFeeTypes]);

  const handleCreateFeeType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminJsonFetch<UnknownRecord>("/v1/tuition-fee-types", {
        method: "POST",
        body: newFeeType,
      });
      toast.success("Fee type created successfully");
      setShowAddModal(false);
      setNewFeeType({ name: "", description: "", isActive: true });
      void loadFeeTypes();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create fee type",
      );
    }
  };

  const filteredFeeTypes = feeTypes.filter((ft) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      String(ft.name ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      String(ft.description ?? "")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const columns: TableColumn<UnknownRecord>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        render: (ft, idx) => (
          <span className="text-xs font-mono font-bold text-primary">
            #{String(ft.id ?? idx + 1)}
          </span>
        ),
      },
      {
        key: "name",
        header: "Name",
        render: (ft) => (
          <span className="text-sm font-bold text-dark-text dark:text-white">
            {String(ft.name ?? "-")}
          </span>
        ),
      },
      {
        key: "description",
        header: "Description",
        render: (ft) => (
          <span className="text-sm text-neutral-text">
            {String(ft.description ?? "-")}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (ft) => {
          const isActive =
            ft.isActive === true ||
            ft.active === true ||
            String(ft.status ?? "").toUpperCase() === "ACTIVE";
          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-700 border border-gray-200"}`}
            >
              {isActive ? "ACTIVE" : "INACTIVE"}
            </span>
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
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">
            Tuition Fee Types
          </h2>
          <p className="text-sm text-neutral-text">
            Manage fee types for tuition payments.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void loadFeeTypes()}
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
            Add Fee Type
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">
            Total Fee Types
          </p>
          <p className="text-2xl font-extrabold text-dark-text dark:text-white">
            {feeTypes.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">
            Active
          </p>
          <p className="text-2xl font-extrabold text-green-600">
            {
              feeTypes.filter(
                (ft) =>
                  ft.isActive === true ||
                  ft.active === true ||
                  String(ft.status ?? "").toUpperCase() === "ACTIVE",
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">
            Inactive
          </p>
          <p className="text-2xl font-extrabold text-gray-500">
            {
              feeTypes.filter(
                (ft) =>
                  !(
                    ft.isActive === true ||
                    ft.active === true ||
                    String(ft.status ?? "").toUpperCase() === "ACTIVE"
                  ),
              ).length
            }
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 p-4">
        <div className="max-w-md">
          <AdminSearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or description..."
          />
        </div>
      </div>

      {/* Fee Types Table */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredFeeTypes}
            rowKey={(r) => String(r.id ?? Math.random())}
            loading={isLoading}
            skeletonRows={6}
            tableLayout="auto"
            ariaLabel="Tuition fee types"
          />
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-extrabold text-dark-text dark:text-white mb-4">
              Add Fee Type
            </h3>
            <form onSubmit={handleCreateFeeType} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Fee Type Name
                </label>
                <input
                  type="text"
                  value={String(newFeeType.name ?? "")}
                  onChange={(e) =>
                    setNewFeeType({ ...newFeeType, name: e.target.value })
                  }
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Description
                </label>
                <textarea
                  value={String(newFeeType.description ?? "")}
                  onChange={(e) =>
                    setNewFeeType({
                      ...newFeeType,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  rows={3}
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

export default TuitionFeeTypes;
