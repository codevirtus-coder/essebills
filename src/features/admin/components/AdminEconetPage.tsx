import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createEconetBundlePlanType,
  createEconetDataBundleType,
  createNetoneBundlePlan,
  createNetoneDataBundleType,
  getAllEconetBundlePlanTypes,
  getAllEconetDataBundleTypes,
  getAllNetoneBundlePlans,
  getAllNetoneDataBundleTypes,
} from '../services'

type Provider = 'econet' | 'netone'
type Module = 'bundlePlanTypes' | 'dataBundleTypes'
type UnknownRecord = Record<string, unknown>

type ModuleConfig = {
  title: string
  subtitle: string
  listEndpoint: string
  createEndpoint: string
  list: () => Promise<UnknownRecord[]>
  create: (payload: UnknownRecord) => Promise<unknown>
}

const TELECOM_CONFIG: Record<Provider, Record<Module, ModuleConfig>> = {
  econet: {
    bundlePlanTypes: {
      title: 'Bundle Plan Types',
      subtitle: 'Econet Bundle Plan Types List',
      listEndpoint: '/v1/bundle-plan-types/all',
      createEndpoint: '/v1/bundle-plan-types',
      list: getAllEconetBundlePlanTypes,
      create: createEconetBundlePlanType,
    },
    dataBundleTypes: {
      title: 'Data Bundle Types',
      subtitle: 'Econet Data Bundle Types List',
      listEndpoint: '/v1/data-bundle-types/all',
      createEndpoint: '/v1/data-bundle-types',
      list: getAllEconetDataBundleTypes,
      create: createEconetDataBundleType,
    },
  },
  netone: {
    bundlePlanTypes: {
      title: 'Bundle Plan Types',
      subtitle: 'Netone Bundle Plan Types List',
      listEndpoint: '/v1/netone-bundle-plans/all',
      createEndpoint: '/v1/netone-bundle-plans',
      list: getAllNetoneBundlePlans,
      create: createNetoneBundlePlan,
    },
    dataBundleTypes: {
      title: 'Data Bundle Types',
      subtitle: 'Netone Data Bundle Types List',
      listEndpoint: '/v1/netone-data-bundle-types/all',
      createEndpoint: '/v1/netone-data-bundle-types',
      list: getAllNetoneDataBundleTypes,
      create: createNetoneDataBundleType,
    },
  },
}

interface AdminEconetPageProps {
  provider?: Provider
  module: Module
}

const AdminEconetPage: React.FC<AdminEconetPageProps> = ({
  provider = 'econet',
  module,
}) => {
  const config = TELECOM_CONFIG[provider][module]
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [active, setActive] = useState(true)

  const loadRows = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await config.list()
      setRows(Array.isArray(response) ? response : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load Econet data')
    } finally {
      setIsLoading(false)
    }
  }, [config])

  React.useEffect(() => {
    void loadRows()
  }, [loadRows])

  const normalizedRows = useMemo(() => rows, [rows])

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      toast.error('Name is required')
      return
    }

    try {
      setIsCreating(true)
      await config.create({
        name: trimmedName,
        active,
      })
      toast.success(`${config.title} item created`)
      setName('')
      setActive(true)
      setIsCreateOpen(false)
      await loadRows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create item')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <section className="bg-white rounded-xl border border-neutral-light p-6 min-h-[112px]">
        <h2 className="text-4 leading-none font-medium text-dark-text dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px]">account_balance</span>
          {config.title}
        </h2>
        <p className="text-sm text-neutral-text mt-8">{config.subtitle}</p>
      </section>

      <section className="bg-white rounded-xl border border-neutral-light p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded border border-[#7E57C2] text-[#7E57C2] text-lg font-medium uppercase tracking-wide hover:bg-[#7E57C2]/5 transition-colors"
          >
            + Create
          </button>
          <button
            type="button"
            onClick={() => void loadRows()}
            className="px-4 py-2 rounded border border-[#7E57C2] text-[#7E57C2] text-lg font-medium uppercase tracking-wide hover:bg-[#7E57C2]/5 transition-colors"
          >
            Refresh
          </button>
          <span className="ml-auto text-xs text-neutral-text">
            List: <code>{config.listEndpoint}</code>
          </span>
        </div>

        <div className="border border-neutral-light rounded overflow-hidden bg-white">
          <div className="bg-[#7E57C2] text-white border-b border-neutral-light">
            <div className="grid grid-cols-3">
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Name</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Status</div>
              <div className="px-4 py-3 text-sm font-semibold">Created on</div>
            </div>
          </div>
          <div className="min-h-[260px] bg-white">
            {isLoading ? (
              <div className="p-8 text-center text-neutral-text">Loading...</div>
            ) : normalizedRows.length === 0 ? (
              <div className="p-8 text-center text-neutral-text">No records found</div>
            ) : (
              normalizedRows.map((row, index) => {
                const isActive = row.active === true || String(row.status ?? '').toUpperCase() === 'ACTIVE'
                return (
                  <div
                    key={String(row.id ?? `${row.name ?? 'econet'}-${index}`)}
                    className="grid grid-cols-3 border-t border-neutral-light hover:bg-neutral-light/40 transition-colors"
                  >
                    <div className="px-4 py-3 text-sm text-dark-text">{String(row.name ?? '-')}</div>
                    <div className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs border ${
                          isActive
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-red-100 text-red-700 border-red-300'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="px-4 py-3 text-sm text-dark-text">{String(row.createdDate ?? '-')}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsCreateOpen(false)}
            className="absolute inset-0 bg-slate-900/45"
            aria-label="Close create modal"
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-neutral-light shadow-2xl p-6">
            <h3 className="text-lg font-bold text-dark-text">Create {config.title}</h3>
            <p className="text-xs text-neutral-text mt-1">
              Endpoint: <code>{config.createEndpoint}</code>
            </p>
            <form className="mt-5 space-y-4" onSubmit={(event) => void handleCreate(event)}>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                />
                <span className="text-sm text-neutral-text">Active</span>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-light text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
                >
                  {isCreating ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminEconetPage
