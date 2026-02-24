import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

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

      <div className="bg-white rounded-[2rem] border border-neutral-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-neutral-light/20">
                {columnKeys.map((key) => (
                  <th
                    key={key}
                    className="px-6 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={Math.max(columnKeys.length, 1)}
                    className="px-6 py-8 text-sm font-semibold text-neutral-text text-center"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(columnKeys.length, 1)}
                    className="px-6 py-8 text-sm font-semibold text-neutral-text text-center"
                  >
                    No data returned by endpoint
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr key={String(row.id ?? index)} className="border-t border-neutral-light">
                    {columnKeys.map((key) => {
                      const value = row[key]
                      return (
                        <td key={`${index}-${key}`} className="px-6 py-4 text-sm text-dark-text">
                          {value === null || value === undefined
                            ? '-'
                            : typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminApiModulePage
