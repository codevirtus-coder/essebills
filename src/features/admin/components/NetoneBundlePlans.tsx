// ============================================================================
// Netone Bundle Plans Page
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { 
  getAllNetoneBundlePlans, 
  createNetoneBundlePlan, 
  changeNetoneBundlePlanStatus 
} from '../services/adminModules.service'

type UnknownRecord = Record<string, unknown>

const NetoneBundlePlans: React.FC = () => {
  const [plans, setPlans] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPlan, setNewPlan] = useState<UnknownRecord>({
    name: '',
    code: '',
    amount: '',
    validityDays: '',
    isActive: true,
  })

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getAllNetoneBundlePlans()
      setPlans(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load bundle plans')
      setPlans([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPlans()
  }, [loadPlans])

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createNetoneBundlePlan({
        ...newPlan,
        amount: Number(newPlan.amount),
        validityDays: Number(newPlan.validityDays),
      })
      toast.success('Bundle plan created successfully')
      setShowAddModal(false)
      setNewPlan({ name: '', code: '', amount: '', validityDays: '', isActive: true })
      void loadPlans()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create bundle plan')
    }
  }

  const handleToggleStatus = async (id: string | number, currentStatus: boolean) => {
    try {
      await changeNetoneBundlePlanStatus(id, !currentStatus)
      toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      void loadPlans()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const filteredPlans = plans.filter(plan => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      String(plan.name ?? '').toLowerCase().includes(searchLower) ||
      String(plan.code ?? '').toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">Netone Bundle Plans</h2>
          <p className="text-sm text-neutral-text">Manage Netone airtime bundle plans.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => void loadPlans()}
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
            Add Plan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Total Plans</p>
          <p className="text-2xl font-extrabold text-dark-text dark:text-white">{plans.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Active</p>
          <p className="text-2xl font-extrabold text-green-600">
            {plans.filter(p => p.isActive === true || p.active === true || String(p.status ?? '').toUpperCase() === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Inactive</p>
          <p className="text-2xl font-extrabold text-red-600">
            {plans.filter(p => p.isActive !== true && p.active !== true && String(p.status ?? '').toUpperCase() !== 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Total Value</p>
          <p className="text-2xl font-extrabold text-primary">
            ${plans.reduce((sum, p) => sum + Number(p.amount ?? p.value ?? 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 p-4">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text text-xl">search</span>
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-light/20 dark:bg-white/5 border-b border-neutral-light dark:border-white/5">
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider text-right">Amount</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider text-center">Validity</th>
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
                      Loading plans...
                    </div>
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-text">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-primary/30">inventory_2</span>
                      <p>No bundle plans found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan, index) => {
                  const isActive = plan.isActive === true || plan.active === true || String(plan.status ?? '').toUpperCase() === 'ACTIVE'
                  return (
                    <tr key={String(plan.id ?? `plan-${index}`)} className="hover:bg-neutral-light/10 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono font-bold text-primary">#{String(plan.id ?? index + 1)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-dark-text dark:text-white">
                          {String(plan.name ?? '-')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-neutral-text">
                          {String(plan.code ?? '-')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-black text-dark-text dark:text-white">
                          ${Number(plan.amount ?? plan.value ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-neutral-text">
                          {String(plan.validityDays ?? plan.validity ?? '-')} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(String(plan.id ?? index), isActive)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-extrabold text-dark-text dark:text-white mb-4">Add Netone Bundle Plan</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Plan Name</label>
                <input
                  type="text"
                  value={String(newPlan.name ?? '')}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Plan Code</label>
                <input
                  type="text"
                  value={String(newPlan.code ?? '')}
                  onChange={(e) => setNewPlan({ ...newPlan, code: e.target.value })}
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={String(newPlan.amount ?? '')}
                  onChange={(e) => setNewPlan({ ...newPlan, amount: e.target.value })}
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Validity (days)</label>
                <input
                  type="number"
                  value={String(newPlan.validityDays ?? '')}
                  onChange={(e) => setNewPlan({ ...newPlan, validityDays: e.target.value })}
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
    </div>
  )
}

export default NetoneBundlePlans
