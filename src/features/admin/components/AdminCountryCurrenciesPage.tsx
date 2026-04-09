import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Link2, RefreshCw, Eye } from 'lucide-react'
import { cn } from '../../../lib/utils'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import { showConfirmDialog } from '../../shared/components/ConfirmDialog'
import {
  createCountryCurrency,
  deleteAllCountryCurrenciesByCountry,
  deleteCountryCurrencyById,
  getAllCountryCurrencies,
  getAllCountryCurrenciesByCountry,
  getCountryCurrencyById,
  getPaginatedCountries,
  getPaginatedCurrencies,
} from '../services'

type UnknownRecord = Record<string, unknown>

function getStr(row: UnknownRecord, key: string): string {
  const value = row[key]
  return value === null || value === undefined ? '—' : String(value)
}

export default function AdminCountryCurrenciesPage() {
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [countryCode, setCountryCode] = useState('')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createForm, setCreateForm] = useState({ countryCode: '', currencyCode: '' })

  const [isViewOpen, setIsViewOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState<UnknownRecord | null>(null)
  const [isViewing, setIsViewing] = useState(false)

  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([])
  const [currencies, setCurrencies] = useState<Array<{ code: string; name: string }>>([])

  const loadLookups = useCallback(async () => {
    try {
      const [countriesPage, currenciesPage] = await Promise.all([
        getPaginatedCountries({ size: 250 }),
        getPaginatedCurrencies({ size: 250 }),
      ])

      const countryList = Array.isArray(countriesPage?.content) ? countriesPage.content : []
      const currencyList = Array.isArray(currenciesPage?.content) ? currenciesPage.content : []

      setCountries(
        countryList
          .map((c: any) => ({ code: String(c.code ?? ''), name: String(c.name ?? c.code ?? '') }))
          .filter((c) => c.code),
      )
      setCurrencies(
        currencyList
          .map((c: any) => ({ code: String(c.code ?? ''), name: String(c.name ?? c.code ?? '') }))
          .filter((c) => c.code),
      )
    } catch {
      setCountries([])
      setCurrencies([])
    }
  }, [])

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const cc = countryCode.trim().toUpperCase()
      const list = cc ? await getAllCountryCurrenciesByCountry(cc) : await getAllCountryCurrencies()
      setRows(Array.isArray(list) ? list : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load country currencies')
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }, [countryCode])

  useEffect(() => {
    void loadLookups()
  }, [loadLookups])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setCreateForm({
      countryCode: countryCode.trim().toUpperCase(),
      currencyCode: '',
    })
    setIsCreateOpen(true)
  }

  const handleCreate = async () => {
    const cc = createForm.countryCode.trim().toUpperCase()
    const cur = createForm.currencyCode.trim().toUpperCase()
    if (!cc) return toast.error('Country code is required')
    if (!cur) return toast.error('Currency code is required')

    try {
      setIsCreating(true)
      await createCountryCurrency({ countryCode: cc, currencyCode: cur })
      toast.success('Binding created')
      setIsCreateOpen(false)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create binding')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = (row: UnknownRecord) => {
    const id = row.id
    if (id === null || id === undefined) return toast.error('Missing id')
    const label = `${getStr(row, 'countryCode')} → ${getStr(row, 'currencyCode')}`

    showConfirmDialog(`Delete ${label}?`, () => {
      deleteCountryCurrencyById(String(id))
        .then(async () => {
          toast.success('Deleted')
          await load()
        })
        .catch((err) => toast.error(err?.message ?? 'Delete failed'))
    })
  }

  const handleDeleteAllForCountry = () => {
    const cc = countryCode.trim().toUpperCase()
    if (!cc) return toast.error('Enter a country code first')

    showConfirmDialog(`Delete ALL currency bindings for ${cc}?`, () => {
      deleteAllCountryCurrenciesByCountry(cc)
        .then(async () => {
          toast.success('Deleted')
          await load()
        })
        .catch((err) => toast.error(err?.message ?? 'Delete failed'))
    })
  }

  const handleView = async (row: UnknownRecord) => {
    const id = row.id
    if (id === null || id === undefined) return toast.error('Missing id')

    try {
      setIsViewing(true)
      const record = await getCountryCurrencyById(String(id))
      setViewRecord(record && typeof record === 'object' ? (record as UnknownRecord) : {})
      setIsViewOpen(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load record')
    } finally {
      setIsViewing(false)
    }
  }

  const columns: CRUDColumn<UnknownRecord>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        render: (r) => <span className="font-mono text-xs text-slate-500">{getStr(r, 'id')}</span>,
      },
      {
        key: 'countryCode',
        header: 'Country',
        render: (r) => (
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {getStr(r, 'countryCode')}
          </span>
        ),
      },
      {
        key: 'currencyCode',
        header: 'Currency',
        render: (r) => (
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {getStr(r, 'currencyCode')}
          </span>
        ),
      },
      {
        key: 'createdDate',
        header: 'Created',
        render: (r) => <span className="text-xs text-slate-500">{getStr(r, 'createdDate')}</span>,
      },
    ],
    [],
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
          <Link2 className="text-emerald-600" size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Country Currencies</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Bind currencies to countries (settlement + display rules).</p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Country Code Filter</label>
              <input
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="e.g. ZW"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void load()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={16} className={cn(isLoading ? 'animate-spin' : '')} />
                Refresh
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
              >
                <Plus size={16} />
                Add Binding
              </button>
              <button
                type="button"
                onClick={handleDeleteAllForCountry}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-white text-sm font-bold text-red-700 hover:bg-red-50"
                title="Delete all bindings for the filtered country code"
              >
                <Trash2 size={16} />
                Delete All
              </button>
            </div>
          </div>
        </div>
      </div>

      <CRUDLayout
        title=""
        columns={columns}
        data={rows}
        loading={isLoading}
        pageable={{ page: 1, size: rows.length || 1, totalElements: rows.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        searchable={true}
        enableClientSideFilter={true}
        actions={{
          onView: handleView,
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

      {isCreateOpen && (
        <CRUDModal isOpen={true} onClose={() => setIsCreateOpen(false)} title="Add Country Currency">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Country</label>
                <select
                  value={createForm.countryCode}
                  onChange={(e) => setCreateForm((p) => ({ ...p, countryCode: e.target.value }))}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select…</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Currency</label>
                <select
                  value={createForm.currencyCode}
                  onChange={(e) => setCreateForm((p) => ({ ...p, currencyCode: e.target.value }))}
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
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={isCreating}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </CRUDModal>
      )}

      {isViewOpen && viewRecord && (
        <CRUDModal isOpen={true} onClose={() => setIsViewOpen(false)} title="Binding Details">
          <div className="space-y-3 text-sm">
            {Object.entries(viewRecord).map(([k, v]) => (
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

