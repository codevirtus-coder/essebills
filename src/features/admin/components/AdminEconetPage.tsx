import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { confirmToast } from '../../../lib/confirmToast'
import { DataTable, TableColumn } from '../../../components/ui/DataTable'
import {
  changeEconetBundlePlanTypeStatus,
  changeEconetDataBundleTypeStatus,
  changeNetoneBundlePlanStatus,
  changeNetoneDataBundleTypeStatus,
  createEconetBundlePlanType,
  createEconetDataBundleType,
  createNetoneBundlePlan,
  createNetoneDataBundleType,
  deleteEconetBundlePlanType,
  deleteEconetDataBundleType,
  deleteNetoneBundlePlan,
  deleteNetoneDataBundleType,
  getAllEconetBundlePlanTypes,
  getAllEconetDataBundleTypes,
  getAllNetoneBundlePlans,
  getAllNetoneDataBundleTypes,
  updateEconetBundlePlanType,
  updateEconetDataBundleType,
  updateNetoneBundlePlan,
  updateNetoneDataBundleType,
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
  update: (id: string | number, payload: UnknownRecord) => Promise<unknown>
  remove: (id: string | number) => Promise<unknown>
  changeStatus: (id: string | number, active: boolean) => Promise<unknown>
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
      update: updateEconetBundlePlanType,
      remove: deleteEconetBundlePlanType,
      changeStatus: changeEconetBundlePlanTypeStatus,
    },
    dataBundleTypes: {
      title: 'Data Bundle Types',
      subtitle: 'Econet Data Bundle Types List',
      listEndpoint: '/v1/data-bundle-types/all',
      createEndpoint: '/v1/data-bundle-types',
      list: getAllEconetDataBundleTypes,
      create: createEconetDataBundleType,
      update: updateEconetDataBundleType,
      remove: deleteEconetDataBundleType,
      changeStatus: changeEconetDataBundleTypeStatus,
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
      update: updateNetoneBundlePlan,
      remove: deleteNetoneBundlePlan,
      changeStatus: changeNetoneBundlePlanStatus,
    },
    dataBundleTypes: {
      title: 'Data Bundle Types',
      subtitle: 'Netone Data Bundle Types List',
      listEndpoint: '/v1/netone-data-bundle-types/all',
      createEndpoint: '/v1/netone-data-bundle-types',
      list: getAllNetoneDataBundleTypes,
      create: createNetoneDataBundleType,
      update: updateNetoneDataBundleType,
      remove: deleteNetoneDataBundleType,
      changeStatus: changeNetoneDataBundleTypeStatus,
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
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null)
  const [isStatusUpdatingId, setIsStatusUpdatingId] = useState<string | number | null>(null)
  const [selectedRow, setSelectedRow] = useState<UnknownRecord | null>(null)
  const [name, setName] = useState('')
  const [active, setActive] = useState(true)
  const [editName, setEditName] = useState('')
  const [editActive, setEditActive] = useState(true)

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

  const openEditModal = (row: UnknownRecord) => {
    setSelectedRow(row)
    setEditName(String(row.name ?? ''))
    setEditActive(row.active !== false && String(row.status ?? '').toUpperCase() !== 'INACTIVE')
    setIsEditOpen(true)
  }

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

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = editName.trim()
    const id = selectedRow?.id as string | number | undefined
    if (!id && id !== 0) {
      toast.error('Record ID is missing')
      return
    }
    if (!trimmedName) {
      toast.error('Name is required')
      return
    }

    try {
      setIsUpdating(true)
      await config.update(id, {
        ...selectedRow,
        name: trimmedName,
        active: editActive,
      })
      toast.success(`${config.title} item updated`)
      setIsEditOpen(false)
      setSelectedRow(null)
      await loadRows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update item')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = (row: UnknownRecord) => {
    const id = row.id as string | number | undefined
    if (!id && id !== 0) {
      toast.error('Record ID is missing')
      return
    }

    confirmToast(`Delete "${String(row.name ?? id)}"?`, () => {
      setIsDeletingId(id!)
      config.remove(id!)
        .then(() => {
          toast.success('Record deleted')
          return loadRows()
        })
        .catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : 'Failed to delete item')
        })
        .finally(() => {
          setIsDeletingId(null)
        })
    })
  }

  const handleToggleStatus = async (row: UnknownRecord) => {
    const id = row.id as string | number | undefined
    if (!id && id !== 0) {
      toast.error('Record ID is missing')
      return
    }
    const isCurrentlyActive =
      row.active === true || String(row.status ?? '').toUpperCase() === 'ACTIVE'
    try {
      setIsStatusUpdatingId(id)
      await config.changeStatus(id, !isCurrentlyActive)
      toast.success(!isCurrentlyActive ? 'Activated' : 'Deactivated')
      await loadRows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setIsStatusUpdatingId(null)
    }
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-dark-text">{config.title}</h2>
        <p className="text-sm text-neutral-text mt-1">{config.subtitle}</p>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
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

        <DataTable
          columns={useMemo<TableColumn<UnknownRecord>[]>(() => [
            {
              key: 'name',
              header: 'Name',
              render: (row) => String(row.name ?? '-')
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => {
                const isActive = row.active === true || String(row.status ?? '').toUpperCase() === 'ACTIVE'
                return (
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs border ${
                      isActive
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    }`}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                )
              }
            },
            {
              key: 'createdDate',
              header: 'Created on',
              render: (row) => String(row.createdDate ?? '-')
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'center',
              render: (row) => {
                const isActive = row.active === true || String(row.status ?? '').toUpperCase() === 'ACTIVE'
                return (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(row)}
                      className="h-8 px-3 rounded-lg border border-[#7E57C2]/40 text-[#7E57C2] text-xs font-semibold hover:bg-[#7E57C2]/5"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggleStatus(row)}
                      disabled={isStatusUpdatingId === row.id}
                      className={`h-8 px-3 rounded-lg border text-xs font-semibold disabled:opacity-60 ${
                        isActive
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'border-green-200 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {isStatusUpdatingId === row.id ? '...' : isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(row)}
                      disabled={isDeletingId === row.id}
                      className="h-8 px-3 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                    >
                      {isDeletingId === row.id ? '...' : 'Delete'}
                    </button>
                  </div>
                )
              }
            }
          ], [isStatusUpdatingId, isDeletingId])}
          data={normalizedRows}
          rowKey={(row) => String(row.id ?? `${row.name ?? 'econet'}-${Math.random()}`)}
          loading={isLoading}
          emptyMessage="No records found"
          emptyIcon="filter_alt_off"
        />
      </div>

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

      {isEditOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsEditOpen(false)}
            className="absolute inset-0 bg-slate-900/45"
            aria-label="Close edit modal"
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-neutral-light shadow-2xl p-6">
            <h3 className="text-lg font-bold text-dark-text">Edit {config.title}</h3>
            <p className="text-xs text-neutral-text mt-1">
              Endpoint: <code>{config.createEndpoint}/{String(selectedRow?.id ?? '')}</code>
            </p>
            <form className="mt-5 space-y-4" onSubmit={(event) => void handleUpdate(event)}>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">Name</span>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(event) => setEditActive(event.target.checked)}
                />
                <span className="text-sm text-neutral-text">Active</span>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-light text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
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
