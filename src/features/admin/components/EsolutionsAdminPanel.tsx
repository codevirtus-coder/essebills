import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Wifi, WifiOff, ChevronDown, ChevronRight, RotateCcw, Search } from 'lucide-react'
import {
  getEsolutionsBalance,
  getEsolutionsCatalog,
  triggerEsolutionsSyncAll,
  triggerEsolutionsSyncMerchant,
  type EsolutionsCatalogItem,
} from '../services/esolutions.service'
import { toast } from 'react-hot-toast'

const EsolutionsAdminPanel: React.FC = () => {
  const queryClient = useQueryClient()
  const [merchantFilter, setMerchantFilter] = useState('')
  const [expandedMerchants, setExpandedMerchants] = useState<Set<string>>(new Set())
  const [syncingMerchant, setSyncingMerchant] = useState<string | null>(null)

  const { data: balance, isFetching: balanceFetching, refetch: refetchBalance } = useQuery({
    queryKey: ['esolutions-balance'],
    queryFn: getEsolutionsBalance,
    retry: 1,
  })

  const { data: catalog = [], isFetching: catalogFetching } = useQuery({
    queryKey: ['esolutions-catalog'],
    queryFn: getEsolutionsCatalog,
    retry: 1,
  })

  const syncAllMutation = useMutation({
    mutationFn: triggerEsolutionsSyncAll,
    onSuccess: (res) => {
      toast.success(res.status)
      queryClient.invalidateQueries({ queryKey: ['esolutions-catalog'] })
    },
    onError: (err: any) => toast.error(err?.message ?? 'Sync failed'),
  })

  const syncMerchantMutation = useMutation({
    mutationFn: (merchantCode: string) => triggerEsolutionsSyncMerchant(merchantCode),
    onMutate: (merchantCode) => setSyncingMerchant(merchantCode),
    onSettled: () => setSyncingMerchant(null),
    onSuccess: (res) => {
      toast.success(res.status)
      queryClient.invalidateQueries({ queryKey: ['esolutions-catalog'] })
    },
    onError: (err: any) => toast.error(err?.message ?? 'Sync failed'),
  })

  // Group catalog by merchant
  const catalogByMerchant = catalog.reduce<Record<string, EsolutionsCatalogItem[]>>((acc, item) => {
    if (!acc[item.merchantCode]) acc[item.merchantCode] = []
    acc[item.merchantCode].push(item)
    return acc
  }, {})

  const merchantCodes = Object.keys(catalogByMerchant).sort()
  const filteredMerchants = merchantCodes.filter((code) =>
    !merchantFilter || code.toLowerCase().includes(merchantFilter.toLowerCase())
  )

  const toggleMerchant = (code: string) => {
    setExpandedMerchants((prev) => {
      const next = new Set(prev)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })
  }

  const isBalanceOk = balance?.responseCode === '00'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">eSolutions Provider</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor vendor balance and manage product catalog sync</p>
        </div>
        <button
          onClick={() => syncAllMutation.mutate()}
          disabled={syncAllMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all"
        >
          <RotateCcw size={16} className={syncAllMutation.isPending ? 'animate-spin' : ''} />
          Sync All Merchants
        </button>
      </div>

      {/* Balance Card */}
      <div className={`rounded-2xl border-2 p-6 ${isBalanceOk ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {isBalanceOk
              ? <Wifi className="text-emerald-600" size={24} />
              : <WifiOff className="text-amber-600" size={24} />
            }
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor Balance</p>
              {isBalanceOk && balance ? (
                <>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {balance.currencyCode ?? 'USD'} {balance.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {balance.accountName && (
                    <p className="text-xs text-slate-500 mt-1">{balance.accountName} · {balance.accountNumber}</p>
                  )}
                </>
              ) : (
                <p className="text-lg font-bold text-amber-700">{balance?.narrative ?? 'Unable to fetch balance'}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => refetchBalance()}
            disabled={balanceFetching}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            <RefreshCw size={14} className={balanceFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Catalog Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-black text-slate-900">Product Catalog</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {catalog.length} products across {merchantCodes.length} merchants
              {catalogFetching && <span className="ml-2 text-emerald-600">Refreshing…</span>}
            </p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter merchants…"
              value={merchantFilter}
              onChange={(e) => setMerchantFilter(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
        </div>

        {filteredMerchants.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-400 font-bold">
            {merchantCodes.length === 0
              ? 'No catalog data. Click "Sync All Merchants" to load products.'
              : 'No merchants match the filter.'}
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {filteredMerchants.map((merchantCode) => {
            const items = catalogByMerchant[merchantCode]
            const isExpanded = expandedMerchants.has(merchantCode)
            const isSyncing = syncingMerchant === merchantCode

            return (
              <div key={merchantCode}>
                <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <button
                    className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => toggleMerchant(merchantCode)}
                  >
                    {isExpanded
                      ? <ChevronDown size={16} className="text-slate-400 shrink-0" />
                      : <ChevronRight size={16} className="text-slate-400 shrink-0" />
                    }
                    <span className="font-black text-sm text-slate-900">{merchantCode}</span>
                    {items[0]?.merchantName && (
                      <span className="text-xs text-slate-400 font-medium">— {items[0].merchantName}</span>
                    )}
                    <span className="ml-auto mr-4 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {items.length} products
                    </span>
                  </button>
                  <button
                    onClick={() => syncMerchantMutation.mutate(merchantCode)}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all shrink-0"
                  >
                    <RotateCcw size={12} className={isSyncing ? 'animate-spin' : ''} />
                    Sync
                  </button>
                </div>

                {isExpanded && (
                  <div className="overflow-x-auto border-t border-slate-100 bg-slate-50/50">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left px-6 py-2 font-black text-slate-400 uppercase tracking-widest">Product Code</th>
                          <th className="text-left px-4 py-2 font-black text-slate-400 uppercase tracking-widest">Name</th>
                          <th className="text-right px-4 py-2 font-black text-slate-400 uppercase tracking-widest">Min</th>
                          <th className="text-right px-4 py-2 font-black text-slate-400 uppercase tracking-widest">Max</th>
                          <th className="text-right px-4 py-2 font-black text-slate-400 uppercase tracking-widest">Price</th>
                          <th className="text-center px-4 py-2 font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-white transition-colors">
                            <td className="px-6 py-2 font-mono font-bold text-slate-700">{item.productCode}</td>
                            <td className="px-4 py-2 text-slate-700">{item.productName}</td>
                            <td className="px-4 py-2 text-right text-slate-500">
                              {item.minimumAmount != null ? (item.minimumAmount / 100).toFixed(2) : '—'}
                            </td>
                            <td className="px-4 py-2 text-right text-slate-500">
                              {item.maximumAmount != null ? (item.maximumAmount / 100).toFixed(2) : '—'}
                            </td>
                            <td className="px-4 py-2 text-right font-bold text-slate-800">
                              {item.price != null ? (item.price / 100).toFixed(2) : '—'}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {item.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default EsolutionsAdminPanel
