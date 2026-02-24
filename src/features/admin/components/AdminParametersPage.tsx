import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createBank,
  createCountry,
  createCurrency,
  createHoliday,
  getAllBanks,
  getAllHolidays,
  getAllParameterCountries,
  getAllParameterCurrencies,
} from '../services'

type ParameterModule = 'currencies' | 'countries' | 'holidays' | 'banks'
type UnknownRecord = Record<string, unknown>

type FieldConfig = {
  key: string
  label: string
  type?: 'text' | 'number' | 'date'
}

type ColumnConfig = {
  key: string
  label: string
}

type ModuleConfig = {
  title: string
  subtitle: string
  icon: string
  listEndpoint: string
  createEndpoint: string
  list: () => Promise<UnknownRecord[]>
  create: (payload: UnknownRecord) => Promise<unknown>
  fields: FieldConfig[]
  columns: ColumnConfig[]
  detailFields: ColumnConfig[]
  detailsTitle: string
}

const MODULE_CONFIGS: Record<ParameterModule, ModuleConfig> = {
  currencies: {
    title: 'Currencies',
    subtitle: 'Currencies List',
    icon: 'account_balance',
    listEndpoint: '/v1/currencies/all',
    createEndpoint: '/v1/currencies',
    list: getAllParameterCurrencies,
    create: createCurrency,
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'description', label: 'Description' },
      { key: 'rateToDefault', label: 'Rate To Default', type: 'number' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created On' },
    ],
    detailFields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'defaultCurrency', label: 'Is Default Currency?' },
      { key: 'description', label: 'Description' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created Date' },
      { key: 'lastModifiedBy', label: 'Last Modified By' },
      { key: 'lastModifiedDate', label: 'Last Modified Date' },
    ],
    detailsTitle: 'Currencies Details',
  },
  countries: {
    title: 'Countries',
    subtitle: 'Countries List',
    icon: 'account_balance',
    listEndpoint: '/v1/countries/all',
    createEndpoint: '/v1/countries',
    list: getAllParameterCountries,
    create: createCountry,
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Country Code' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Country Code' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created On' },
    ],
    detailFields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Country Code' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created Date' },
      { key: 'lastModifiedBy', label: 'Last Modified By' },
      { key: 'lastModifiedDate', label: 'Last Modified Date' },
    ],
    detailsTitle: 'Countries Details',
  },
  holidays: {
    title: 'Holidays',
    subtitle: 'Holidays List',
    icon: 'target',
    listEndpoint: '/v1/holidays',
    createEndpoint: '/v1/holidays?date=YYYY-MM-DD',
    list: getAllHolidays,
    create: (payload) => createHoliday(String(payload.date ?? '')),
    fields: [{ key: 'date', label: 'Date', type: 'date' }],
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created On' },
    ],
    detailFields: [
      { key: 'date', label: 'Date' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created Date' },
      { key: 'lastModifiedBy', label: 'Last Modified By' },
      { key: 'lastModifiedDate', label: 'Last Modified Date' },
    ],
    detailsTitle: 'Holidays Details',
  },
  banks: {
    title: 'Registry',
    subtitle: 'Financial Institutions List',
    icon: 'business_center',
    listEndpoint: '/v1/banks/all',
    createEndpoint: '/v1/banks',
    list: getAllBanks,
    create: createBank,
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created On' },
    ],
    detailFields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created Date' },
      { key: 'lastModifiedBy', label: 'Last Modified By' },
      { key: 'lastModifiedDate', label: 'Last Modified Date' },
    ],
    detailsTitle: 'Registry Details',
  },
}

interface AdminParametersPageProps {
  module: ParameterModule
}

const AdminParametersPage: React.FC<AdminParametersPageProps> = ({ module }) => {
  const config = MODULE_CONFIGS[module]
  const [rows, setRows] = React.useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)

  const getRowId = React.useCallback(
    (row: UnknownRecord, index: number) => String(row.id ?? row.code ?? row.name ?? index),
    [],
  )

  const load = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await config.list()
      const nextRows = Array.isArray(response) ? response : []
      setRows(nextRows)
      if (nextRows.length === 0) {
        setSelectedRowId(null)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [config, getRowId])

  React.useEffect(() => {
    void load()
  }, [load])

  const tableRows = useMemo(() => rows, [rows])
  const selectedRow = useMemo(() => {
    if (!selectedRowId) return null
    const rowIndex = tableRows.findIndex((row, index) => getRowId(row, index) === selectedRowId)
    if (rowIndex < 0) return null
    return tableRows[rowIndex]
  }, [tableRows, selectedRowId, getRowId])

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    for (const field of config.fields) {
      if (!String(form[field.key] ?? '').trim()) {
        toast.error(`${field.label} is required`)
        return
      }
    }

    try {
      setIsSubmitting(true)
      await config.create(form)
      toast.success(`${config.title} entry created`)
      setIsCreateOpen(false)
      setForm({})
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <section className="bg-white rounded-xl border border-neutral-light p-6 min-h-[112px]">
        <h2 className="text-4 leading-none font-medium text-dark-text dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px]">{config.icon}</span>
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
            onClick={() => void load()}
            className="px-4 py-2 rounded border border-[#7E57C2] text-[#7E57C2] text-lg font-medium uppercase tracking-wide hover:bg-[#7E57C2]/5 transition-colors"
          >
            Refresh
          </button>
          <span className="ml-auto text-xs text-neutral-text">
            List: <code>{config.listEndpoint}</code>
          </span>
        </div>

        {!selectedRow ? (
          <div className="border border-neutral-light rounded overflow-hidden bg-white">
            <div className="bg-[#7E57C2] text-white border-b border-neutral-light">
              <div
                className="grid"
                style={{ gridTemplateColumns: `repeat(${config.columns.length}, minmax(0, 1fr)) 64px` }}
              >
                {config.columns.map((column) => (
                  <div key={column.key} className="px-4 py-3 text-sm font-semibold border-r border-white/20 last:border-r-0">
                    {column.label}
                  </div>
                ))}
                <div className="px-4 py-3 text-sm font-semibold text-center">View</div>
              </div>
            </div>
            <div className="min-h-[260px] bg-white">
              {isLoading ? (
                <div className="p-8 text-center text-neutral-text">Loading...</div>
              ) : tableRows.length === 0 ? (
                <div className="p-8 text-center text-neutral-text">No records found</div>
              ) : (
                tableRows.map((row, rowIndex) => {
                  const rowId = getRowId(row, rowIndex)
                  return (
                    <div
                      key={rowId}
                      className="w-full grid text-left border-t border-neutral-light transition-colors hover:bg-neutral-light/50"
                      style={{ gridTemplateColumns: `repeat(${config.columns.length}, minmax(0, 1fr)) 64px` }}
                    >
                      {config.columns.map((column) => (
                        <div key={`${rowId}-${column.key}`} className="px-4 py-3 text-sm text-dark-text truncate">
                          {String(row[column.key] ?? '-')}
                        </div>
                      ))}
                      <div className="px-2 py-1 flex items-center justify-center bg-white">
                        <button
                          type="button"
                          onClick={() => setSelectedRowId(rowId)}
                          className="w-9 h-9 rounded-lg border transition-colors flex items-center justify-center bg-white text-neutral-text border-neutral-light hover:border-primary/40 hover:text-primary"
                          title="View details"
                          aria-label="View details"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          <div className="border border-neutral-light rounded overflow-hidden bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-light bg-[#7E57C2] text-white">
              <h3 className="text-lg font-semibold text-white">{config.detailsTitle}</h3>
              <button
                type="button"
                onClick={() => setSelectedRowId(null)}
                className="w-9 h-9 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                title="Back to table"
                aria-label="Back to table"
              >
                <span className="material-symbols-outlined text-lg">table_rows</span>
              </button>
            </div>
            <div className="divide-y divide-neutral-light bg-white">
              {config.detailFields.map((field) => (
                <div key={field.key} className="grid grid-cols-2 bg-white">
                  <div className="px-4 py-3 text-sm font-semibold text-neutral-text border-r border-neutral-light bg-white">
                    {field.label}
                  </div>
                  <div className="px-4 py-3 text-sm text-dark-text bg-white">
                    {String(selectedRow[field.key] ?? '-')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
              {config.fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="text-xs font-semibold text-neutral-text">{field.label}</span>
                  <input
                    type={field.type ?? 'text'}
                    value={form[field.key] ?? ''}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                    className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              ))}
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
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminParametersPage
