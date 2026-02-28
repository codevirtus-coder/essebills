// ============================================================================
// Zimbabwe (Zim) Products Transactions Page
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { adminJsonFetch } from '../services'
import { DataTable, TableColumn } from '../../../components/ui/DataTable'

type UnknownRecord = Record<string, unknown>

// Zimbabwe product providers
const ZIM_PRODUCTS = [
  { label: 'ZESA', slug: 'zesa', endpoint: '/v1/zesa-transactions' },
  { label: 'Econet Airtime', slug: 'econet-airtime', endpoint: '/v1/airtime-transactions' },
  { label: 'Netone', slug: 'netone', endpoint: '/v1/netone-transactions' },
  { label: 'Telecel', slug: 'telecel', endpoint: '/v1/telecel-transactions' },
  { label: 'ZINWA', slug: 'zinwa', endpoint: '/v1/zinwa-transactions' },
  { label: 'DSTV', slug: 'dstv', endpoint: '/v1/dstv-zim-transactions' },
  { label: 'GOtv', slug: 'gotv', endpoint: '/v1/gotv-zim-transactions' },
]

function toRows(payload: unknown): UnknownRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is UnknownRecord => typeof item === 'object' && item !== null)
  }
  if (payload && typeof payload === 'object') {
    const maybePage = payload as { content?: unknown[] }
    if (Array.isArray(maybePage.content)) {
      return maybePage.content.filter(
        (item): item is UnknownRecord => typeof item === 'object' && item !== null,
      )
    }
  }
  return []
}

const ZimProductsTransactions: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState(ZIM_PRODUCTS[0].slug)
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      const product = ZIM_PRODUCTS.find(p => p.slug === selectedProduct)
      if (!product) return
      
      const payload = await adminJsonFetch<unknown>(`${product.endpoint}/all`)
      setRows(toRows(payload))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load transactions')
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedProduct])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions])

  const filteredRows = rows.filter(row => {
    const matchesSearch = !searchTerm || 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    const rowStatus = String(row.status ?? row.transactionStatus ?? '')
    const matchesStatus = statusFilter === 'ALL' || 
      rowStatus.toUpperCase() === statusFilter.toUpperCase()
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase()
    const isSuccess = statusUpper.includes('SUCCESS') || statusUpper.includes('COMPLETED') || statusUpper.includes('CREDITED') || statusUpper.includes('TOKEN')
    const isPending = statusUpper.includes('PENDING') || statusUpper.includes('PROCESSING') || statusUpper.includes('NOT_PAID')
    const isFailed = statusUpper.includes('FAILED') || statusUpper.includes('ERROR')
    
    if (isSuccess) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">SUCCESS</span>
    }
    if (isPending) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">PENDING</span>
    }
    if (isFailed) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">FAILED</span>
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>
  }

  const columns: TableColumn<UnknownRecord>[] = useMemo(() => [
    { key: 'id', header: 'ID', render: (tx) => <span className="text-xs font-mono font-bold text-primary">#{String(tx.id ?? '').padStart(6, '0')}</span> },
    { key: 'date', header: 'Date', render: (tx) => <span className="text-sm text-dark-text dark:text-gray-200">{String(tx.createdAt ?? tx.transactionDate ?? tx.date ?? '-')}</span> },
    { key: 'customer', header: 'Customer', render: (tx) => <span className="text-sm text-dark-text dark:text-gray-200">{String(tx.customerName ?? tx.name ?? tx.customer ?? '-')}</span> },
    { key: 'account', header: 'Account/Meter', render: (tx) => <span className="text-sm text-neutral-text font-mono">{String(tx.accountNumber ?? tx.meterNumber ?? tx.account ?? '-')}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (tx) => <span className="text-sm font-black text-dark-text dark:text-white">${String(tx.amount ?? tx.value ?? '0')}</span> },
    { key: 'status', header: 'Status', align: 'center', render: (tx) => getStatusBadge(String(tx.status ?? tx.transactionStatus ?? '-')) },
    { key: 'token', header: 'Token/Ref', align: 'right', render: (tx) => <span className="text-xs font-mono text-neutral-text">{String(tx.token ?? tx.referenceNumber ?? tx.reference ?? '-').substring(0, 20)}</span> },
    { key: 'actions', header: 'Actions', align: 'right', render: () => (
      <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/10 rounded-lg transition-colors">
        <span className="material-symbols-outlined text-lg text-neutral-text">more_vert</span>
      </button>
    ) },
  ], [])

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">Zimbabwe Products Transactions</h2>
          <p className="text-sm text-neutral-text">View and manage all Zimbabwe-based product transactions.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => void loadTransactions()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-light dark:border-white/5 rounded-xl text-sm font-bold text-neutral-text hover:bg-neutral-light dark:hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all">
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Total Transactions</p>
          <p className="text-2xl font-extrabold text-dark-text dark:text-white">{rows.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Successful</p>
          <p className="text-2xl font-extrabold text-green-600">{rows.filter(r => String(r.status ?? r.transactionStatus ?? '').toUpperCase().includes('SUCCESS') || String(r.status ?? r.transactionStatus ?? '').toUpperCase().includes('TOKEN')).length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-extrabold text-yellow-600">{rows.filter(r => String(r.status ?? r.transactionStatus ?? '').toUpperCase().includes('PENDING') || String(r.status ?? r.transactionStatus ?? '').toUpperCase().includes('NOT_PAID')).length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-light dark:border-white/5">
          <p className="text-xs font-black text-neutral-text uppercase tracking-wider">Failed</p>
          <p className="text-2xl font-extrabold text-red-600">{rows.filter(r => String(r.status ?? r.transactionStatus ?? '').toUpperCase().includes('FAILED')).length}</p>
        </div>
      </div>

      {/* Product Tabs & Filters */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Product Tabs */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {ZIM_PRODUCTS.map((product) => (
                <button
                  key={product.slug}
                  onClick={() => setSelectedProduct(product.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                    selectedProduct === product.slug
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-neutral-light/30 text-neutral-text hover:bg-neutral-light/50'
                  }`}
                >
                  {product.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search & Filter */}
          <div className="flex gap-2 lg:w-96">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text text-xl">search</span>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-light/30 dark:bg-white/5 border-none rounded-xl px-3 py-2.5 text-sm font-bold"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-neutral-light dark:border-white/5 overflow-hidden">
        <div className="p-0">
          <DataTable
            columns={columns}
            data={filteredRows.slice(0, 50)}
            rowKey={(r) => String(r.id ?? r.transactionId ?? r.createdAt ?? r.accountNumber ?? JSON.stringify(r))}
            loading={isLoading}
            emptyMessage="No transactions found"
            className="rounded-2xl"
          />
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-neutral-light dark:border-white/5 flex items-center justify-between">
          <p className="text-xs text-neutral-text">
            Showing {Math.min(filteredRows.length, 50)} of {filteredRows.length} results
          </p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-neutral-text hover:bg-neutral-light rounded-lg disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 text-xs font-bold bg-primary text-white rounded-lg">1</button>
            <button className="p-2 text-neutral-text hover:bg-neutral-light rounded-lg">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZimProductsTransactions
