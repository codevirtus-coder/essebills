// ============================================================================
// Netone Data Bundles Page
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { 
  getAllNetoneDataBundleTypes, 
  createNetoneDataBundleType, 
  changeNetoneDataBundleTypeStatus 
} from '../services/adminModules.service'
import { DataTable, TableColumn } from '../../../components/ui/DataTable'

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

  const columns: TableColumn<UnknownRecord>[] = useMemo(() => [
    { key: 'id', header: 'ID', render: (b, i) => <span className="text-xs font-mono font-bold text-primary">#{String(b.id ?? i + 1)}</span> },
    { key: 'name', header: 'Name', render: (b) => <span className="text-sm font-bold text-dark-text dark:text-white">{String(b.name ?? '-')}</span> },
    { key: 'code', header: 'Code', render: (b) => <span className="text-sm font-mono text-neutral-text">{String(b.code ?? '-')}</span> },
    { key: 'data', header: 'Data', align: 'right', render: (b) => <span className="text-sm font-black text-dark-text dark:text-white">{Number(b.dataAmount ?? b.data ?? 0)} GB</span> },
    { key: 'price', header: 'Price', align: 'right', render: (b) => <span className="text-sm font-black text-primary">${Number(b.price ?? b.amount ?? 0).toFixed(2)}</span> },
    { key: 'validity', header: 'Validity', align: 'center', render: (b) => <span className="text-sm text-neutral-text">{String(b.validityDays ?? b.validity ?? '-')} days</span> },
    { key: 'status', header: 'Status', align: 'center', render: (b, i) => {
      const isActive = b.isActive === true || b.active === true || String(b.status ?? '').toUpperCase() === 'ACTIVE'
      return (
        <button
          onClick={() => handleToggleStatus(String(b.id ?? i), isActive)}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
            isActive ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </button>
      )
    } },
    { key: 'actions', header: 'Actions', align: 'right', render: () => (
      <div className="flex items-center justify-end gap-1">
        <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-lg text-neutral-text">edit</span>
        </button>
        <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-lg text-neutral-text">more_vert</span>
        </button>
      </div>
    ) },
  ], [])

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
        <DataTable
          columns={columns}
          data={filteredBundles}
          rowKey={(r) => String(r.id ?? r.code ?? JSON.stringify(r))}
          loading={isLoading}
          emptyMessage="No data bundles found"
          className="rounded-2xl"
        />
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
