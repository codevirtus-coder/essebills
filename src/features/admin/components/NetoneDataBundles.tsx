// ============================================================================
// Netone Data Bundles Page
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { 
  getAllNetoneDataBundleTypes, 
  createNetoneDataBundleType, 
  changeNetoneDataBundleTypeStatus 
} from '../services/adminModules.service'

type UnknownRecord = Record<string, unknown>

const NetoneDataBundles: React.FC = () => {
  const [bundles, setBundles] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBundle, setNewBundle] = useState<UnknownRecord>({
    name: '',
    code: '',
    dataAmount: '',
    price: '',
    validityDays: '',
    isActive: true,
  })

  const loadBundles = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getAllNetoneDataBundleTypes()
      setBundles(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load data bundles')
      setBundles([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBundles()
  }, [loadBundles])

  const handleCreateBundle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createNetoneDataBundleType({
        ...newBundle,
        dataAmount: Number(newBundle.dataAmount),
        price: Number(newBundle.price),
        validityDays: Number(newBundle.validityDays),
      })
      toast.success('Data bundle created successfully')
      setShowAddModal(false)
      setNewBundle({ name: '', code: '', dataAmount: '', price: '', validityDays: '', isActive: true })
      void loadBundles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create data bundle')
    }
  }

  const handleToggleStatus = async (id: string | number, currentStatus: boolean) => {
    try {
      await changeNetoneDataBundleTypeStatus(id, !currentStatus)
      toast.success(`Bundle ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      void loadBundles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const filteredBundles = bundles.filter(bundle => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      String(bundle.name ?? '').toLowerCase().includes(searchLower) ||
      String(bundle.code ?? '').toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">Netone Data Bundles</h2>
          <p className="text-sm text-neutral-text">Manage Netone data bundle plans.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => void loadBundles()}
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
            Add Bundle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Total Bundles</p>
          <p className="text-2xl font-extrabold text-dark-text dark:text-white">{bundles.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Active</p>
          <p className="text-2xl font-extrabold text-green-600">
            {bundles.filter(b => b.isActive === true || b.active === true || String(b.status ?? '').toUpperCase() === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Total Data</p>
          <p className="text-2xl font-extrabold text-primary">
            {Math.round(bundles.reduce((sum, b) => sum + Number(b.dataAmount ?? b.data ?? 0), 0))} GB
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Price Range</p>
          <p className="text-2xl font-extrabold text-dark-text dark:text-white">
            ${Math.min(...bundles.map(b => Number(b.price ?? b.amount ?? 0))).toFixed(0)} - ${Math.max(...bundles.map(b => Number(b.price ?? b.amount ?? 0))).toFixed(0)}
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

      {/* Bundles Table */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-light/20 dark:bg-white/5 border-b border-neutral-light dark:border-white/5">
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider text-right">Data</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider text-right">Price</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider text-center">Validity</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-xs font-black text-neutral-text uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-neutral-text">
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      Loading bundles...
                    </div>
                  </td>
                </tr>
              ) : filteredBundles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-neutral-text">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-primary/30">data_usage</span>
                      <p>No data bundles found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBundles.map((bundle, index) => {
                  const isActive = bundle.isActive === true || bundle.active === true || String(bundle.status ?? '').toUpperCase() === 'ACTIVE'
                  return (
                    <tr key={String(bundle.id ?? `bundle-${index}`)} className="hover:bg-neutral-light/10 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono font-bold text-primary">#{String(bundle.id ?? index + 1)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-dark-text dark:text-white">
                          {String(bundle.name ?? '-')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-neutral-text">
                          {String(bundle.code ?? '-')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-black text-dark-text dark:text-white">
                          {Number(bundle.dataAmount ?? bundle.data ?? 0)} GB
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-black text-primary">
                          ${Number(bundle.price ?? bundle.amount ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-neutral-text">
                          {String(bundle.validityDays ?? bundle.validity ?? '-')} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(String(bundle.id ?? index), isActive)}
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
            <h3 className="text-xl font-extrabold text-dark-text dark:text-white mb-4">Add Netone Data Bundle</h3>
            <form onSubmit={handleCreateBundle} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Bundle Name</label>
                <input
                  type="text"
                  value={String(newBundle.name ?? '')}
                  onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })}
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Bundle Code</label>
                <input
                  type="text"
                  value={String(newBundle.code ?? '')}
                  onChange={(e) => setNewBundle({ ...newBundle, code: e.target.value })}
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Data Amount (GB)</label>
                <input
                  type="number"
                  value={String(newBundle.dataAmount ?? '')}
                  onChange={(e) => setNewBundle({ ...newBundle, dataAmount: e.target.value })}
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Price ($)</label>
                <input
                  type="number"
                  value={String(newBundle.price ?? '')}
                  onChange={(e) => setNewBundle({ ...newBundle, price: e.target.value })}
                  className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-text mb-1">Validity (days)</label>
                <input
                  type="number"
                  value={String(newBundle.validityDays ?? '')}
                  onChange={(e) => setNewBundle({ ...newBundle, validityDays: e.target.value })}
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
                  Create Bundle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NetoneDataBundles
