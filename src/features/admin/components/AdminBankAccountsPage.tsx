import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, Plus, RefreshCw, Search, WalletCards } from 'lucide-react'
import { cn } from '../../../lib/utils'
import CRUDLayout, { type CRUDColumn, type PageableState } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import { showConfirmDialog } from '../../shared/components/ConfirmDialog'
import {
  createEsebillsAccount,
  deleteEsebillsAccount,
  getDefaultEsebillsAccount,
  getEsebillsAccountById,
  getPaginatedEsebillsAccounts,
  searchEsebillsAccount,
  updateEsebillsAccount,
} from '../services'
import { getCurrencies } from '../../../services/products.service'

type UnknownRecord = Record<string, unknown>

function getStr(row: UnknownRecord, key: string): string {
  const value = row[key]
  return value === null || value === undefined ? '—' : String(value)
}

function getCurrencyCode(row: UnknownRecord): string {
  const direct = row.currencyCode
  if (typeof direct === 'string') return direct
  const currency = row.currency
  if (currency && typeof currency === 'object' && typeof (currency as any).code === 'string') {
    return String((currency as any).code)
  }
  return ''
}

export default function AdminBankAccountsPage() {
  const [pageable, setPageable] = useState<PageableState>({ page: 1, size: 20, totalElements: 0, totalPages: 0 })
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [defaultAccount, setDefaultAccount] = useState<UnknownRecord | null>(null)
  const [isLoadingDefault, setIsLoadingDefault] = useState(false)

  const [searchBank, setSearchBank] = useState('')
  const [searchAccountNumber, setSearchAccountNumber] = useState('')
  const [searchResult, setSearchResult] = useState<UnknownRecord | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const [currencies, setCurrencies] = useState<Array<{ code: string; name: string }>>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [form, setForm] = useState({
    bank: '',
    accountNumber: '',
    accountName: '',
    currencyCode: '',
  })

  const [isViewOpen, setIsViewOpen] = useState(false)
  const [viewRow, setViewRow] = useState<UnknownRecord | null>(null)
  const [isViewing, setIsViewing] = useState(false)

  const loadDefault = useCallback(async () => {
    try {
      setIsLoadingDefault(true)
      const record = await getDefaultEsebillsAccount()
      setDefaultAccount(record && typeof record === 'object' ? (record as UnknownRecord) : null)
    } catch {
      setDefaultAccount(null)
    } finally {
      setIsLoadingDefault(false)
    }
  }, [])

  const loadCurrencies = useCallback(async () => {
    try {
      const page = await getCurrencies()
      const list = Array.isArray(page?.content) ? page.content : []
      setCurrencies(
        list
          .filter((c: any) => c?.code)
          .map((c: any) => ({ code: String(c.code), name: String(c.name ?? c.code) })),
      )
    } catch {
      setCurrencies([])
    }
  }, [])

  const load = useCallback(
    async (pageIndex = 0, size = 20) => {
      try {
        setIsLoading(true)
        const res: any = await getPaginatedEsebillsAccounts({ page: pageIndex, size, sort: 'createdDate,desc' })
        const content = Array.isArray(res?.content) ? (res.content as UnknownRecord[]) : []
        setRows(content)
        setPageable({
          page: (res?.number ?? 0) + 1,
          size: res?.size ?? size,
          totalElements: res?.totalElements ?? content.length,
          totalPages: res?.totalPages ?? 1,
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load accounts')
        setRows([])
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    void loadCurrencies()
    void loadDefault()
  }, [loadCurrencies, loadDefault])

  useEffect(() => {
    void load(pageable.page - 1, pageable.size)
  }, [load, pageable.page, pageable.size])

  const openCreate = () => {
    setEditingId(null)
    setForm({ bank: '', accountNumber: '', accountName: '', currencyCode: '' })
    setIsModalOpen(true)
  }

  const openEdit = (row: UnknownRecord) => {
    const idValue = row.id
    setEditingId(typeof idValue === 'string' || typeof idValue === 'number' ? idValue : null)
    setForm({
      bank: String(row.bank ?? ''),
      accountNumber: String(row.accountNumber ?? ''),
      accountName: String(row.accountName ?? ''),
      currencyCode: getCurrencyCode(row),
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.bank.trim()) return toast.error('Bank is required')
    if (!form.accountNumber.trim()) return toast.error('Account number is required')
    if (!form.accountName.trim()) return toast.error('Account name is required')
    if (!form.currencyCode.trim()) return toast.error('Currency is required')

    const payload = {
      bank: form.bank.trim(),
      accountNumber: form.accountNumber.trim(),
      accountName: form.accountName.trim(),
      currencyCode: form.currencyCode.trim(),
    }

    try {
      setIsSaving(true)
      if (editingId) await updateEsebillsAccount(editingId, payload)
      else await createEsebillsAccount(payload)
      toast.success('Saved')
      setIsModalOpen(false)
      await loadDefault()
      await load(pageable.page - 1, pageable.size)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (row: UnknownRecord) => {
    const id = row.id
    if (id === null || id === undefined) return toast.error('Missing id')
    const label = `${getStr(row, 'bank')} • ${getStr(row, 'accountNumber')}`
    showConfirmDialog(`Delete ${label}?`, () => {
      deleteEsebillsAccount(String(id))
        .then(async () => {
          toast.success('Deleted')
          await loadDefault()
          await load(pageable.page - 1, pageable.size)
        })
        .catch((err) => toast.error(err?.message ?? 'Delete failed'))
    })
  }

  const handleView = async (row: UnknownRecord) => {
    const id = row.id
    if (id === null || id === undefined) return toast.error('Missing id')
    try {
      setIsViewing(true)
      const record = await getEsebillsAccountById(String(id))
      setViewRow(record && typeof record === 'object' ? (record as UnknownRecord) : {})
      setIsViewOpen(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load')
    } finally {
      setIsViewing(false)
    }
  }

  const runSearch = async () => {
    const bank = searchBank.trim()
    const accountNumber = searchAccountNumber.trim()
    if (!bank) return toast.error('Bank is required')
    if (!accountNumber) return toast.error('Account number is required')

    try {
      setIsSearching(true)
      const record = await searchEsebillsAccount({ bank, accountNumber })
      setSearchResult(record && typeof record === 'object' ? (record as UnknownRecord) : {})
      toast.success('Found')
    } catch (error) {
      setSearchResult(null)
      toast.error(error instanceof Error ? error.message : 'No match found')
    } finally {
      setIsSearching(false)
    }
  }

  const columns: CRUDColumn<UnknownRecord>[] = useMemo(
    () => [
      {
        key: 'bank',
        header: 'Bank',
        render: (r) => <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{getStr(r, 'bank')}</span>,
      },
      {
        key: 'accountNumber',
        header: 'Account Number',
        render: (r) => <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">{getStr(r, 'accountNumber')}</span>,
      },
      {
        key: 'accountName',
        header: 'Account Name',
        render: (r) => <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{getStr(r, 'accountName')}</span>,
      },
      {
        key: 'currencyCode',
        header: 'Currency',
        className: 'text-center',
        render: (r) => (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
            {getCurrencyCode(r) || '—'}
          </span>
        ),
      },
      {
        key: 'active',
        header: 'Active',
        className: 'text-center',
        render: (r) => {
          const active = r.active !== false
          return (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border',
              active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
            )}>
              {active ? 'Yes' : 'No'}
            </span>
          )
        },
      },
    ],
    [],
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
          <WalletCards className="text-emerald-600" size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Bank Accounts</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Settlement/bank accounts used for deposits and reconciliations.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            void loadDefault()
            void load(pageable.page - 1, pageable.size)
          }}
          disabled={isLoading || isLoadingDefault}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={cn(isLoading || isLoadingDefault ? 'animate-spin' : '')} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Default Account</p>
          <div className="mt-3">
            {isLoadingDefault ? (
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : defaultAccount ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {getStr(defaultAccount, 'bank')} • {getStr(defaultAccount, 'accountNumber')}
                </p>
                <p className="text-xs text-slate-500">{getStr(defaultAccount, 'accountName')}</p>
                <p className="text-[10px] font-mono text-emerald-700">{getCurrencyCode(defaultAccount)}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No default account found.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6 border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Search Account</p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:items-end">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bank</label>
              <input
                value={searchBank}
                onChange={(e) => setSearchBank(e.target.value)}
                placeholder="e.g. CBZ"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Number</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={searchAccountNumber}
                  onChange={(e) => setSearchAccountNumber(e.target.value)}
                  placeholder="Account number"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => void runSearch()}
                  disabled={isSearching}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Search size={16} />
                  Search
                </button>
              </div>
            </div>
          </div>
          {searchResult && (
            <div className="mt-4 p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
              <p className="text-sm font-bold text-slate-900">
                {getStr(searchResult, 'bank')} • {getStr(searchResult, 'accountNumber')}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">{getStr(searchResult, 'accountName')}</p>
              <p className="text-[10px] font-mono text-emerald-700 mt-1">{getCurrencyCode(searchResult)}</p>
            </div>
          )}
        </div>
      </div>

      <CRUDLayout
        title="All Accounts"
        columns={columns}
        data={rows}
        loading={isLoading}
        pageable={pageable}
        onPageChange={(p) => setPageable((prev) => ({ ...prev, page: p }))}
        onSizeChange={(s) => setPageable((prev) => ({ ...prev, size: s, page: 1 }))}
        onRefresh={() => void load(pageable.page - 1, pageable.size)}
        onAdd={openCreate}
        addButtonText="Add Bank Account"
        actions={{
          onView: handleView,
          onEdit: openEdit,
          onDelete: handleDelete,
          renderCustom: () => (
            <button
              type="button"
              disabled={isViewing}
              className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
              title="View details"
            >
              <Eye size={16} />
            </button>
          ),
        }}
      />

      {isModalOpen && (
        <CRUDModal isOpen={true} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Bank Account' : 'Add Bank Account'}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank</label>
                <input
                  value={form.bank}
                  onChange={(e) => setForm((p) => ({ ...p, bank: e.target.value }))}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Currency</label>
                <select
                  value={form.currencyCode}
                  onChange={(e) => setForm((p) => ({ ...p, currencyCode: e.target.value }))}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select…</option>
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Number</label>
                <input
                  value={form.accountNumber}
                  onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Name</label>
                <input
                  value={form.accountName}
                  onChange={(e) => setForm((p) => ({ ...p, accountName: e.target.value }))}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </CRUDModal>
      )}

      {isViewOpen && viewRow && (
        <CRUDModal isOpen={true} onClose={() => setIsViewOpen(false)} title="Account Details">
          <div className="space-y-3 text-sm">
            {Object.entries(viewRow).map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k}</span>
                <span className="font-mono text-xs text-slate-700 break-all">{v === null || v === undefined ? '—' : String(v)}</span>
              </div>
            ))}
          </div>
        </CRUDModal>
      )}
    </div>
  )
}
