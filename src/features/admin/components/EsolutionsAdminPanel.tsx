import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Wifi, WifiOff, ChevronDown, ChevronRight, RotateCcw, Search, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import {
  getEsolutionsBalance,
  getEsolutionsBalanceBy,
  getEsolutionsCatalog,
  triggerEsolutionsSyncAll,
  triggerEsolutionsSyncMerchant,
  getEsolutionsMerchants,
  createEsolutionsMerchant,
  updateEsolutionsMerchant,
  deleteEsolutionsMerchant,
  type EsolutionsCatalogItem,
  type EsolutionsMerchant,
} from '../services/esolutions.service'
import {
  getEsolutionsV2Catalog,
  getEsolutionsV2CatalogByMerchant,
  getEsolutionsV2ProductsByMerchant,
  postEsolutionsV2Balance,
  postEsolutionsV2CatalogSync,
  postEsolutionsV2Resend,
  postEsolutionsV2Transaction,
} from '../services/esolutionsV2.service'
import { toast } from 'react-hot-toast'

const EsolutionsAdminPanel: React.FC = () => {
  const queryClient = useQueryClient()
  const [merchantFilter, setMerchantFilter] = useState('')
  const [expandedMerchants, setExpandedMerchants] = useState<Set<string>>(new Set())
  const [syncingMerchant, setSyncingMerchant] = useState<string | null>(null)
  const [newMerchantCode, setNewMerchantCode] = useState('')
  const [newMerchantName, setNewMerchantName] = useState('')

  const [balanceKey, setBalanceKey] = useState('')
  const [balanceByKey, setBalanceByKey] = useState<any>(null)
  const [balanceByKeyLoading, setBalanceByKeyLoading] = useState(false)

  const [v2Expanded, setV2Expanded] = useState(false)
  const [v2MerchantCode, setV2MerchantCode] = useState('')
  const [v2Body, setV2Body] = useState('{\n  \n}')
  const [v2Result, setV2Result] = useState<any>(null)
  const [v2Loading, setV2Loading] = useState(false)

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

  const { data: merchants = [], isFetching: merchantsFetching } = useQuery({
    queryKey: ['esolutions-merchants'],
    queryFn: getEsolutionsMerchants,
    retry: 1,
  })

  const createMerchantMutation = useMutation({
    mutationFn: createEsolutionsMerchant,
    onSuccess: () => {
      toast.success('Merchant added')
      setNewMerchantCode('')
      setNewMerchantName('')
      queryClient.invalidateQueries({ queryKey: ['esolutions-merchants'] })
    },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to add merchant'),
  })

  const toggleMerchantActiveMutation = useMutation({
    mutationFn: ({ merchant, active }: { merchant: EsolutionsMerchant; active: boolean }) =>
      updateEsolutionsMerchant(merchant.id, { code: merchant.code, name: merchant.name ?? undefined, active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['esolutions-merchants'] }),
    onError: (err: any) => toast.error(err?.message ?? 'Update failed'),
  })

  const deleteMerchantMutation = useMutation({
    mutationFn: (id: number) => deleteEsolutionsMerchant(id),
    onSuccess: () => {
      toast.success('Merchant removed')
      queryClient.invalidateQueries({ queryKey: ['esolutions-merchants'] })
    },
    onError: (err: any) => toast.error(err?.message ?? 'Delete failed'),
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

  const runBalanceByKey = async () => {
    const key = balanceKey.trim()
    if (!key) return toast.error('Enter a balance key/param')
    try {
      setBalanceByKeyLoading(true)
      const res = await getEsolutionsBalanceBy(key)
      setBalanceByKey(res)
      toast.success('Fetched balance')
    } catch (err: any) {
      setBalanceByKey(null)
      toast.error(err?.message ?? 'Failed to fetch balance')
    } finally {
      setBalanceByKeyLoading(false)
    }
  }

  const parseV2Body = (): Record<string, unknown> | null => {
    try {
      const trimmed = v2Body.trim()
      if (!trimmed) return {}
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>
      return {}
    } catch {
      toast.error('Invalid JSON body')
      return null
    }
  }

  const runV2 = async (runner: () => Promise<unknown>) => {
    try {
      setV2Loading(true)
      const res = await runner()
      setV2Result(res)
      toast.success('V2 call OK')
    } catch (err: any) {
      setV2Result(null)
      toast.error(err?.message ?? 'V2 call failed')
    } finally {
      setV2Loading(false)
    }
  }

  const balanceEntries = balance ? Object.entries(balance) : []
  const isAnyBalanceOk = balanceEntries.some(([, b]) => b.responseCode === '00')

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
      <div className={`rounded-2xl border-2 p-6 ${isAnyBalanceOk ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            {isAnyBalanceOk
              ? <Wifi className="text-emerald-600 shrink-0" size={24} />
              : <WifiOff className="text-amber-600 shrink-0" size={24} />
            }
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vendor Balance</p>
              {balanceFetching ? (
                <div className="flex gap-4">
                  <div className="h-10 w-40 bg-white/60 rounded-xl animate-pulse" />
                  <div className="h-10 w-40 bg-white/60 rounded-xl animate-pulse" />
                </div>
              ) : balanceEntries.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {balanceEntries.map(([currency, bal]) => (
                    <div key={currency} className={`rounded-xl p-3 border ${bal.responseCode === '00' ? 'bg-white border-emerald-100' : 'bg-amber-50 border-amber-200'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{currency}</p>
                      {bal.responseCode === '00' ? (
                        <>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">
                            {bal.currencyCode ?? currency} {bal.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          {bal.accountName && (
                            <p className="text-xs text-slate-500 mt-1">{bal.accountName} · {bal.accountNumber}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm font-bold text-amber-700">{bal.narrative ?? 'Unavailable'}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-lg font-bold text-amber-700">Unable to fetch balance</p>
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

      {/* Balance by Key (Swagger: GET /v1/admin/esolutions/balance/{param}) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">Balance by Key</h2>
          <p className="text-xs text-slate-500 mt-0.5">Fetch a single balance record by param/key (for troubleshooting).</p>
        </div>
        <div className="p-5 flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Key / Param</label>
            <input
              type="text"
              placeholder="e.g. USD"
              value={balanceKey}
              onChange={(e) => setBalanceKey(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
          <button
            onClick={() => void runBalanceByKey()}
            disabled={balanceByKeyLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all shrink-0"
          >
            <Search size={14} className={balanceByKeyLoading ? 'animate-pulse' : ''} />
            Fetch
          </button>
        </div>
        {balanceByKey && (
          <div className="px-5 pb-5">
            <pre className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto">
              {JSON.stringify(balanceByKey, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Merchant Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">Configured Merchants</h2>
          <p className="text-xs text-slate-500 mt-0.5">Active merchants are included in catalog sync runs</p>
        </div>

        {/* Add merchant form */}
        <div className="p-5 border-b border-slate-100 flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Merchant Code</label>
            <input
              type="text"
              placeholder="e.g. ZETDC"
              value={newMerchantCode}
              onChange={(e) => setNewMerchantCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Display Name (optional)</label>
            <input
              type="text"
              placeholder="e.g. Zimbabwe Electricity"
              value={newMerchantName}
              onChange={(e) => setNewMerchantName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
          <button
            onClick={() => {
              if (!newMerchantCode.trim()) return
              createMerchantMutation.mutate({ code: newMerchantCode.trim(), name: newMerchantName.trim() || undefined, active: true })
            }}
            disabled={!newMerchantCode.trim() || createMerchantMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all shrink-0"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        {/* Merchant list */}
        {merchantsFetching && merchants.length === 0 ? (
          <div className="p-6 space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : merchants.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 font-bold">
            No merchants configured yet. Add one above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {merchants.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm font-mono text-slate-900">{m.code}</span>
                  {m.name && <span className="text-xs text-slate-400">— {m.name}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMerchantActiveMutation.mutate({ merchant: m, active: !m.active })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      m.active
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                    {m.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => syncMerchantMutation.mutate(m.code)}
                    disabled={syncingMerchant === m.code}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    <RotateCcw size={12} className={syncingMerchant === m.code ? 'animate-spin' : ''} />
                    Sync
                  </button>
                  <button
                    onClick={() => deleteMerchantMutation.mutate(m.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove merchant"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Legacy /api/v2 endpoints (Swagger uncovered) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setV2Expanded((v) => !v)}
          className="w-full p-5 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="text-left">
            <h2 className="text-base font-black text-slate-900">Legacy v2 Endpoints</h2>
            <p className="text-xs text-slate-500 mt-0.5">Use only if you still rely on `/api/v2/esolutions/*` endpoints.</p>
          </div>
          {v2Expanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
        </button>

        {v2Expanded && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Merchant Code (optional)</label>
                <input
                  type="text"
                  value={v2MerchantCode}
                  onChange={(e) => setV2MerchantCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ZETDC"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">JSON Body (for POST balance/resend/transaction)</label>
                <textarea
                  rows={6}
                  value={v2Body}
                  onChange={(e) => setV2Body(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={v2Loading}
                onClick={() => void runV2(() => getEsolutionsV2Catalog())}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                GET catalog
              </button>
              <button
                type="button"
                disabled={v2Loading || !v2MerchantCode.trim()}
                onClick={() => void runV2(() => getEsolutionsV2CatalogByMerchant(v2MerchantCode.trim()))}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                GET catalog by merchant
              </button>
              <button
                type="button"
                disabled={v2Loading || !v2MerchantCode.trim()}
                onClick={() => void runV2(() => getEsolutionsV2ProductsByMerchant(v2MerchantCode.trim()))}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                GET products by merchant
              </button>
              <button
                type="button"
                disabled={v2Loading}
                onClick={() => {
                  const body = parseV2Body()
                  if (!body) return
                  void runV2(() => postEsolutionsV2Balance(body))
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
              >
                POST balance
              </button>
              <button
                type="button"
                disabled={v2Loading || !v2MerchantCode.trim()}
                onClick={() => void runV2(() => postEsolutionsV2CatalogSync(v2MerchantCode.trim()))}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
              >
                POST sync merchant
              </button>
              <button
                type="button"
                disabled={v2Loading}
                onClick={() => {
                  const body = parseV2Body()
                  if (!body) return
                  void runV2(() => postEsolutionsV2Resend(body))
                }}
                className="px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 disabled:opacity-50"
              >
                POST resend
              </button>
              <button
                type="button"
                disabled={v2Loading}
                onClick={() => {
                  const body = parseV2Body()
                  if (!body) return
                  void runV2(() => postEsolutionsV2Transaction(body))
                }}
                className="px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 disabled:opacity-50"
              >
                POST transaction
              </button>
            </div>

            {v2Result !== null && (
              <pre className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto">
                {JSON.stringify(v2Result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EsolutionsAdminPanel
