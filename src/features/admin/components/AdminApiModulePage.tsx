import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { DataTable, type TableColumn } from '../../../components/ui'

type UnknownRecord = Record<string, unknown>

interface AdminApiModulePageProps {
  title: string
  description: string
  endpoint: string
  loadData: () => Promise<unknown>
}

function normalizeRows(payload: unknown): UnknownRecord[] {
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
    return [payload as UnknownRecord]
  }

  return []
}

const AdminApiModulePage: React.FC<AdminApiModulePageProps> = ({
  title,
  description,
  endpoint,
  loadData,
}) => {
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true)
        const payload = await loadData()
        setRows(normalizeRows(payload))
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load module data')
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }, [endpoint])

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return rows

    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(term))
  }, [rows, query])

  const columnKeys = useMemo(() => {
    const keySet = new Set<string>()
    filteredRows.slice(0, 20).forEach((row) => {
      Object.keys(row).forEach((key) => keySet.add(key))
    })
    return Array.from(keySet).slice(0, 6)
  }, [filteredRows])

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] border border-neutral-light shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">{title}</h2>
            <p className="text-sm text-neutral-text mt-1">{description}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">
              Endpoint: {endpoint}
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
            Rows: {filteredRows.length}
          </div>
        </div>

        <div className="mt-6 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-text text-lg">
            search
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search records..."
            className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl pl-11 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
          />
        </div>
      </div>

      <DataTable
        columns={useMemo(() => 
          columnKeys.map(key => ({
            key,
            header: key,
            render: (row: UnknownRecord) => {
              const value = row[key]
              return (
                <span className="text-sm text-dark-text">
                  {value === null || value === undefined
                    ? '-'
                    : typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                </span>
              )
            }
          })),
        [columnKeys])}
        data={filteredRows}
        rowKey={(row: UnknownRecord) => String(row.id ?? Math.random())}
        loading={isLoading}
        emptyMessage="No data returned by endpoint"
        emptyIcon="data_object"
      />
    </div>
  )
}

export default AdminApiModulePage
