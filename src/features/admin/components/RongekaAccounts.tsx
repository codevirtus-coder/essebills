// ============================================================================
// Rongeka Accounts Page
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  getAllRongekaAccounts,
  createRongekaAccount,
} from "../services/adminModules.service";
import { DataTable, TableColumn } from "../../../components/ui/DataTable";
import {
  AdminCreateButton,
  AdminRefreshButton,
  AdminSearchInput,
  AdminInput,
  AdminStatusBadge,
  statusVariant,
} from "./shared/AdminControls";
import { Icon } from "../../../components/ui/Icon";

type UnknownRecord = Record<string, unknown>;

const RongekaAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<UnknownRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState<UnknownRecord>({
    accountNumber: "",
    accountName: "",
    phoneNumber: "",
    email: "",
  });

  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllRongekaAccounts();
      setAccounts(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load accounts",
      );
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRongekaAccount(newAccount);
      toast.success("Account created successfully");
      setShowAddModal(false);
      setNewAccount({
        accountNumber: "",
        accountName: "",
        phoneNumber: "",
        email: "",
      });
      void loadAccounts();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create account",
      );
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      String(account.accountNumber ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      String(account.accountName ?? account.name ?? "")
        .toLowerCase()
        .includes(searchLower) ||
      String(account.phoneNumber ?? account.phone ?? "")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const columns: TableColumn<UnknownRecord>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        render: (a, i) => (
          <span className="text-xs font-mono font-bold text-primary">
            #{String(a.id ?? i + 1)}
          </span>
        ),
      },
      {
        key: "accountNumber",
        header: "Account Number",
        render: (a) => (
          <span className="text-sm font-mono font-bold text-dark-text dark:text-white">
            {String(a.accountNumber ?? "-")}
          </span>
        ),
      },
      {
        key: "accountName",
        header: "Account Name",
        render: (a) => (
          <span className="text-sm text-dark-text dark:text-gray-200">
            {String(a.accountName ?? a.name ?? "-")}
          </span>
        ),
      },
      {
        key: "phone",
        header: "Phone",
        render: (a) => (
          <span className="text-sm text-neutral-text">
            {String(a.phoneNumber ?? a.phone ?? "-")}
          </span>
        ),
      },
      {
        key: "email",
        header: "Email",
        render: (a) => (
          <span className="text-sm text-neutral-text">
            {String(a.email ?? "-")}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (a) => {
          const value = String(a.status ?? a.active ?? "INACTIVE").toUpperCase();
          return (
            <AdminStatusBadge variant={statusVariant(value)}>{value}</AdminStatusBadge>
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
              <Icon name="edit" size={18} className="text-neutral-text" />
            </button>
            <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg transition-colors">
              <Icon name="more_vert" size={18} className="text-neutral-text" />
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
            Rongeka Accounts
          </h2>
          <p className="text-sm text-neutral-text">
            Manage Econet Rongeka (EVD) accounts.
          </p>
        </div>
        <div className="flex gap-3">
          <AdminRefreshButton onClick={() => void loadAccounts()}>
            <Icon name="refresh" size={16} />
            Refresh
          </AdminRefreshButton>
          <AdminCreateButton onClick={() => setShowAddModal(true)}>
            <Icon name="add" size={16} />
            Add Account
          </AdminCreateButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">
            Total Accounts
          </p>
          <p className="text-2xl font-extrabold text-dark-text dark:text-white">
            {accounts.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">
            Active
          </p>
          <p className="text-2xl font-extrabold text-green-600">
            {
              accounts.filter(
                (a) =>
                  String(a.status ?? a.active ?? "").toLowerCase() === "active",
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">
            Inactive
          </p>
          <p className="text-2xl font-extrabold text-red-600">
            {
              accounts.filter(
                (a) =>
                  String(a.status ?? a.active ?? "").toLowerCase() !== "active",
              ).length
            }
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 p-4">
        <div className="max-w-md">
          <AdminSearchInput
            placeholder="Search by account number, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredAccounts}
          rowKey={(r) => String(r.id ?? r.accountNumber ?? JSON.stringify(r))}
          loading={isLoading}
          emptyMessage="No accounts found"
          className="rounded-2xl"
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-extrabold text-dark-text dark:text-white mb-4">
              Add Rongeka Account
            </h3>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Account Number
                </label>
                <AdminInput
                  type="text"
                  value={String(newAccount.accountNumber ?? "")}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Account Name
                </label>
                <AdminInput
                  type="text"
                  value={String(newAccount.accountName ?? "")}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      accountName: e.target.value,
                    })
                  }
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Phone Number
                </label>
                <AdminInput
                  type="text"
                  value={String(newAccount.phoneNumber ?? "")}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">
                  Email
                </label>
                <AdminInput
                  type="email"
                  value={String(newAccount.email ?? "")}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, email: e.target.value })
                  }
                  className="w-full"
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RongekaAccounts;
