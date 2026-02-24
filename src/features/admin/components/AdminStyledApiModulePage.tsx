import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

type UnknownRecord = Record<string, unknown>

interface AdminStyledApiModulePageProps {
  title: string
  description: string
  endpoint: string
  loadData: () => Promise<unknown>
  createEndpoint?: string
  createData?: (payload: UnknownRecord) => Promise<unknown>
  tableMode?: 'credentials' | 'auto'
  createMode?: 'credentials' | 'json' | 'fields'
  createJsonTemplate?: UnknownRecord
  columns?: Array<{ key: string; label: string }>
  emptyLabel?: string
  createFields?: Array<{ key: string; label: string; type?: 'text' | 'number' | 'checkbox' }>
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

const AdminStyledApiModulePage: React.FC<AdminStyledApiModulePageProps> = ({
  title,
  description,
  endpoint,
  loadData,
  createEndpoint,
  createData,
  tableMode = 'credentials',
  createMode = 'credentials',
  createJsonTemplate = {},
  columns,
  emptyLabel,
  createFields = [],
}) => {
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [integrationKey, setIntegrationKey] = useState('')
  const [encryptionKey, setEncryptionKey] = useState('')
  const [active, setActive] = useState(true)
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(createJsonTemplate, null, 2) || '{\n\n}',
  )
  const [fieldValues, setFieldValues] = useState<Record<string, string | number | boolean>>({})

  const loadRows = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const payload = await loadData()
      setRows(normalizeRows(payload))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load module data')
    } finally {
      setIsLoading(false)
    }
  }, [loadData])

  React.useEffect(() => {
    void loadRows()
  }, [loadRows])

  const columnKeys = useMemo(() => {
    if (columns?.length) {
      return columns.map((column) => column.label)
    }

    if (tableMode === 'credentials') {
      return ['Integration Key', 'Encryption Key', 'Created on']
    }

    const keySet = new Set<string>()
    rows.slice(0, 20).forEach((row) => {
      Object.keys(row).forEach((key) => keySet.add(key))
    })
    return Array.from(keySet).slice(0, 6)
  }, [rows, tableMode])

  const mapIntegrationKey = (row: UnknownRecord) =>
    String(
      row.integrationKey ??
        row.apiKey ??
        row.clientId ??
        row.username ??
        row.name ??
        '-',
    )

  const mapEncryptionKey = (row: UnknownRecord) =>
    String(
      row.encryptionKey ??
        row.secretKey ??
        row.secret ??
        row.password ??
        row.token ??
        '-',
    )

  const mapCreatedOn = (row: UnknownRecord) =>
    String(row.createdDate ?? row.createdOn ?? row.createdAt ?? '-')

  const handleCreateFields = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!createData || !createFields.length) return

    const payload: UnknownRecord = {}

    for (const field of createFields) {
      const rawValue = fieldValues[field.key]
      if (field.type === 'checkbox') {
        payload[field.key] = Boolean(rawValue)
        continue
      }

      const textValue = String(rawValue ?? '').trim()
      if (!textValue) {
        toast.error(`${field.label} is required`)
        return
      }

      payload[field.key] = field.type === 'number' ? Number(textValue) : textValue
    }

    try {
      setIsCreating(true)
      await createData(payload)
      toast.success(`${title} created`)
      setIsCreateOpen(false)
      setFieldValues({})
      await loadRows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create item')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!createData) return

    const trimmedIntegrationKey = integrationKey.trim()
    const trimmedEncryptionKey = encryptionKey.trim()

    if (!trimmedIntegrationKey || !trimmedEncryptionKey) {
      toast.error('Integration key and encryption key are required')
      return
    }

    try {
      setIsCreating(true)
      await createData({
        integrationKey: trimmedIntegrationKey,
        encryptionKey: trimmedEncryptionKey,
        apiKey: trimmedIntegrationKey,
        secretKey: trimmedEncryptionKey,
        name: trimmedIntegrationKey,
        active,
      })
      toast.success(`${title} created`)
      setIntegrationKey('')
      setEncryptionKey('')
      setActive(true)
      setIsCreateOpen(false)
      await loadRows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create credentials')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateJson = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!createData) return

    let parsedPayload: UnknownRecord
    try {
      const parsed = JSON.parse(payloadText)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        toast.error('Payload must be a JSON object')
        return
      }
      parsedPayload = parsed as UnknownRecord
    } catch {
      toast.error('Invalid JSON payload')
      return
    }

    try {
      setIsCreating(true)
      await createData(parsedPayload)
      toast.success(`${title} created`)
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
          <span className="material-symbols-outlined text-[28px]">vpn_key</span>
          {title}
        </h2>
        <p className="text-sm text-neutral-text mt-8">{description}</p>
      </section>

      <section className="bg-white rounded-xl border border-neutral-light p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              if (!createData) {
                toast('Create endpoint is not configured for this credentials module yet.')
                return
              }
              setIsCreateOpen(true)
            }}
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
            List: <code>{endpoint}</code>
          </span>
        </div>

        <div className="border border-neutral-light rounded overflow-hidden bg-white">
          <div className="bg-[#7E57C2] text-white border-b border-neutral-light">
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${Math.max(columnKeys.length, 1)}, minmax(0, 1fr))` }}
            >
              {(columnKeys.length ? columnKeys : ['Data']).map((key, index) => (
                <div
                  key={key}
                  className={`px-4 py-3 text-sm font-semibold ${index < Math.max(columnKeys.length, 1) - 1 ? 'border-r border-white/20' : ''}`}
                >
                  {key}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white">
            {isLoading ? (
              <div className="p-8 text-center text-neutral-text min-h-[160px] flex items-center justify-center">
                Loading...
              </div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-neutral-text flex flex-col items-center justify-center min-h-[160px]">
                <span className="material-symbols-outlined text-[48px] text-primary/40">filter_alt_off</span>
                {emptyLabel ? <p className="mt-4 text-[28px] text-neutral-text/60">{emptyLabel}</p> : null}
              </div>
            ) : (
              rows.map((row, rowIndex) => (
                <div
                  key={String(row.id ?? `row-${rowIndex}`)}
                  className="grid border-t border-neutral-light hover:bg-neutral-light/40 transition-colors"
                  style={{ gridTemplateColumns: `repeat(${Math.max(columnKeys.length, 1)}, minmax(0, 1fr))` }}
                >
                  {columns?.length ? (
                    columns.map((column) => (
                      <div key={`${rowIndex}-${column.key}`} className="px-4 py-3 text-sm text-dark-text break-words">
                        {row[column.key] === null || row[column.key] === undefined
                          ? '-'
                          : typeof row[column.key] === 'object'
                            ? JSON.stringify(row[column.key])
                            : String(row[column.key])}
                      </div>
                    ))
                  ) : tableMode === 'credentials' ? (
                    <>
                      <div className="px-4 py-3 text-sm text-dark-text break-words">{mapIntegrationKey(row)}</div>
                      <div className="px-4 py-3 text-sm text-dark-text break-words">{mapEncryptionKey(row)}</div>
                      <div className="px-4 py-3 text-sm text-dark-text break-words">{mapCreatedOn(row)}</div>
                    </>
                  ) : (
                    columnKeys.map((key) => (
                      <div key={`${rowIndex}-${key}`} className="px-4 py-3 text-sm text-dark-text break-words">
                        {row[key] === null || row[key] === undefined
                          ? '-'
                          : typeof row[key] === 'object'
                            ? JSON.stringify(row[key])
                            : String(row[key])}
                      </div>
                    ))
                  )}
                </div>
              ))
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
            <h3 className="text-lg font-bold text-dark-text">Create {title}</h3>
            <p className="text-xs text-neutral-text mt-1">
              Endpoint: <code>{createEndpoint ?? '-'}</code>
            </p>
            <form
              className="mt-5 space-y-4"
              onSubmit={(event) =>
                void (createMode === 'credentials'
                  ? handleCreate(event)
                  : createMode === 'fields'
                    ? handleCreateFields(event)
                    : handleCreateJson(event))
              }
            >
              {createMode === 'credentials' ? (
                <>
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-text">Integration Key</span>
                    <input
                      value={integrationKey}
                      onChange={(event) => setIntegrationKey(event.target.value)}
                      className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-text">Encryption Key</span>
                    <input
                      value={encryptionKey}
                      onChange={(event) => setEncryptionKey(event.target.value)}
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
                </>
              ) : createMode === 'fields' ? (
                createFields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="text-xs font-semibold text-neutral-text">{field.label}</span>
                    {field.type === 'checkbox' ? (
                      <div className="mt-2">
                        <input
                          type="checkbox"
                          checked={Boolean(fieldValues[field.key])}
                          onChange={(event) =>
                            setFieldValues((prev) => ({ ...prev, [field.key]: event.target.checked }))
                          }
                        />
                      </div>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={String(fieldValues[field.key] ?? '')}
                        onChange={(event) =>
                          setFieldValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                        }
                        className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </label>
                ))
              ) : (
                <label className="block">
                  <span className="text-xs font-semibold text-neutral-text">Payload (JSON)</span>
                  <textarea
                    value={payloadText}
                    onChange={(event) => setPayloadText(event.target.value)}
                    rows={10}
                    className="mt-1 w-full rounded-lg border border-neutral-light px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              )}
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

export default AdminStyledApiModulePage
