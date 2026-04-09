import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Network, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '../../../lib/utils'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import EsolutionsAdminPanel from './EsolutionsAdminPanel'
import { disableProvider, enableProvider, getProviders, type ProviderCode } from '../services'

type UnknownRecord = Record<string, unknown>

function getStr(row: UnknownRecord, key: string): string {
  const value = row[key]
  return value === null || value === undefined ? '—' : String(value)
}

export default function AdminProvidersPage() {
  const [tab, setTab] = useState<'providers' | 'esolutions'>('providers')
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const list = await getProviders()
      setRows(Array.isArray(list) ? list : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load providers')
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const toggleProvider = async (row: UnknownRecord) => {
    const code = String(row.provider ?? '') as ProviderCode
    if (!code) return
    const enabled = Boolean(row.enabled)
    try {
      if (enabled) await disableProvider(code)
      else await enableProvider(code)
      toast.success(`${code} ${enabled ? 'disabled' : 'enabled'}`)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed')
    }
  }

  const columns: CRUDColumn<UnknownRecord>[] = useMemo(
    () => [
      {
        key: 'provider',
        header: 'Provider',
        render: (r) => <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{getStr(r, 'provider')}</span>,
      },
      {
        key: 'enabled',
        header: 'Enabled',
        className: 'text-center',
        render: (r) => {
          const enabled = Boolean(r.enabled)
          return (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border',
              enabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
            )}>
              {enabled ? 'Yes' : 'No'}
            </span>
          )
        },
      },
      {
        key: 'activeProducts',
        header: 'Active Products',
        className: 'text-right',
        render: (r) => <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{getStr(r, 'activeProducts')}</span>,
      },
      {
        key: 'totalProducts',
        header: 'Total Products',
        className: 'text-right',
        render: (r) => <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{getStr(r, 'totalProducts')}</span>,
      },
    ],
    [],
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <Network className="text-emerald-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Providers</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Enable/disable upstream providers and monitor catalogue coverage.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(
            [
              { id: 'providers', label: 'Provider Switches' },
              { id: 'esolutions', label: 'eSolutions' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors',
                tab === t.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'providers' ? (
        <CRUDLayout
          title="Provider Status"
          columns={columns}
          data={rows}
          loading={isLoading}
          pageable={{ page: 1, size: rows.length || 1, totalElements: rows.length, totalPages: 1 }}
          onPageChange={() => {}}
          onSizeChange={() => {}}
          searchable={false}
          actions={{
            renderCustom: (item) => {
              const enabled = Boolean((item as any).enabled)
              return (
                <button
                  type="button"
                  onClick={() => void toggleProvider(item as any)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors',
                    enabled
                      ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700',
                  )}
                  title={enabled ? 'Disable provider' : 'Enable provider'}
                >
                  {enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {enabled ? 'Disable' : 'Enable'}
                </button>
              )
            },
          }}
        />
      ) : (
        <EsolutionsAdminPanel />
      )}
    </div>
  )
}
