// ============================================================================
// Rongeka Accounts Page
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getAllRongekaAccounts, createRongekaAccount } from '../services/adminModules.service'

type UnknownRecord = Record<string, unknown>

const RongekaAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAccount, setNewAccount] = useState<UnknownRecord>({
    accountNumber: '',
    accountName: '',
    phoneNumber: '',
    email: '',
  })

  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getAllRongekaAccounts()
      setAccounts(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load accounts')
      setAccounts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAccounts()
  }, [loadAccounts])

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRongekaAccount(newAccount)
      toast.success('Account created successfully')
      setShowAddModal(false)
      setNewAccount({
        accountNumber: '',
        accountName: '',
        phoneNumber: '',
        email: '',
      })
      void loadAccounts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account')
    }
  }

  const filteredAccounts = accounts.filter(account => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      String(account.accountNumber ?? '').toLowerCase().includes(searchLower) ||
      String(account.accountName ?? account.name ?? '').toLowerCase().includes(searchLower) ||
      String(account.phoneNumber ?? account.phone ?? '').toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">Rongeka Accounts</h2>
          <p className="text-sm text-neutral-text">Manage Econet Rongeka (EVD) accounts.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => void loadAccounts()}
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
            Add Account
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Total Accounts</p>
          <p className="text-2xl font-extrabold text-dark-text dark:text-white">{accounts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Active</p>
          <p className="text-2xl font-extrabold text-green-600">
            {accounts.filter(a => String(a.status ?? a.active ?? '').toLowerCase() === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Inactive</p>
          <p className="text-2xl font-extrabold text-red-600">
            {accounts.filter(a => String(a.status ?? a.active ?? '').toLowerCase() !== 'active').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 p-4">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text text-xl">search</span>
          <input
            type="text"
            placeholder="Search by account number, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-light/20 dark:bg-white/5 border-b border-neutral-light dark:border-white/5">
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">Account Number</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">Account Name</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-text">
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      Loading accounts...
                    </div>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-text">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-primary/30">account_balance</span>
                      <p>No accounts found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account, index) => (
                  <tr key={String(account.id ?? `acc-${index}`)} className="hover:bg-neutral-light/10 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-bold text-primary">#{String(account.id ?? index + 1)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-bold text-dark-text dark:text-white">
                        {String(account.accountNumber ?? '-')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-text dark:text-gray-200">
                      {String(account.accountName ?? account.name ?? '-')}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text">
                      {String(account.phoneNumber ?? account.phone ?? '-')}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-text">
                      {String(account.email ?? '-')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        String(account.status ?? account.active ?? '').toLowerCase() === 'active'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {String(account.status ?? account.active ?? 'INACTIVE').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg text-neutral-text">edit</span>
                        </button>
                        <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-lg text-neutral-text">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-extrabold text-dark-text dark:text-white mb-4">Add Rongeka Account</h3>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Account Number</label>
                <input
                  type="text"
                  value={String(newAccount.accountNumber ?? '')}
                  onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Account Name</label>
                <input
                  type="text"
                  value={String(newAccount.accountName ?? '')}
                  onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Phone Number</label>
                <input
                  type="text"
                  value={String(newAccount.phoneNumber ?? '')}
                  onChange={(e) => setNewAccount({ ...newAccount, phoneNumber: e.target.value })}
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Email</label>
                <input
                  type="email"
                  value={String(newAccount.email ?? '')}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RongekaAccounts
