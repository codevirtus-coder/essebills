import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import { KeyRound, Shield, Calendar, Trash2, Edit, Plus, Info } from 'lucide-react'
import { cn } from '../../../lib/utils'

type UnknownRecord = Record<string, unknown>

interface AdminStyledApiModulePageProps {
  title: string
  description: string
  endpoint: string
  loadData: () => Promise<unknown>
  icon?: string
  createEndpoint?: string
  createData?: (payload: UnknownRecord) => Promise<unknown>
  showCreateButton?: boolean
  showRefreshButton?: boolean
  showEndpointLabel?: boolean
  tableMode?: 'credentials' | 'auto'
  createMode?: 'credentials' | 'json' | 'fields'
  createJsonTemplate?: UnknownRecord
  columns?: Array<{ key: string; label: string }>
  emptyLabel?: string
  createFields?: Array<{
    key: string
    label: string
    type?: 'text' | 'number' | 'checkbox' | 'select'
    optionsLoader?: () => Promise<Array<{ label: string; value: string | number }>>
    options?: Array<{ label: string; value: string | number }>
  }>
  onUpdate?: (id: string | number, payload: UnknownRecord) => Promise<unknown>
  onDelete?: (id: string | number) => Promise<unknown>
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
  createData,
  showCreateButton = true,
  tableMode = 'credentials',
  createMode = 'credentials',
  createJsonTemplate = {},
  columns,
  emptyLabel,
  createFields = [],
  onDelete,
}) => {
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
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
  const [fieldOptions, setFieldOptions] = useState<Record<string, Array<{ label: string; value: string | number }>>>(
    {}
  )

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

  React.useEffect(() => {
    if (!isCreateOpen || createMode !== 'fields') return

    let mounted = true
    const load = async () => {
      const entries = createFields.filter((f) => f.type === 'select' && (f.optionsLoader || f.options))
      if (!entries.length) return

      const next: Record<string, Array<{ label: string; value: string | number }>> = {}
      for (const field of entries) {
        try {
          if (field.options?.length) next[field.key] = field.options
          else if (field.optionsLoader) next[field.key] = await field.optionsLoader()
        } catch (e) {
          // Keep empty; field will render but without options.
          next[field.key] = []
        }
      }

      if (!mounted) return
      setFieldOptions((prev) => ({ ...prev, ...next }))
    }

    void load()
    return () => {
      mounted = false
    }
  }, [createFields, createMode, isCreateOpen])

  const columnKeys = useMemo(() => {
    if (columns?.length) {
      return columns.map((column) => column.key)
    }
    const keySet = new Set<string>()
    rows.slice(0, 20).forEach((row) => {
      Object.keys(row).forEach((key) => keySet.add(key))
    })
    return Array.from(keySet).slice(0, 6)
  }, [rows, columns])

  const handleCreateFields = async () => {
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

  const handleCreate = async () => {
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

  const handleCreateJson = async () => {
    if (!createData) return
    let parsedPayload: UnknownRecord
    try {
      const parsed = JSON.parse(payloadText)
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

  const crudColumns: CRUDColumn<UnknownRecord>[] = useMemo(() => {
    const cols: CRUDColumn<UnknownRecord>[] = []
    
    if (columns?.length) {
      cols.push(...columns.map(col => ({
        key: col.key,
        header: col.label,
        render: (row: UnknownRecord) => {
          const value = getValueByPath(row, col.key)
          return (
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {value === null || value === undefined ? '-' : String(value)}
            </span>
          )
        }
      })))
    } else if (tableMode === 'credentials') {
      cols.push(
        {
          key: 'integrationKey',
          header: 'Integration Key',
          render: (row) => (
            <div className="flex items-center gap-2">
              <KeyRound size={14} className="text-emerald-500" />
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                {String(row.integrationKey ?? row.apiKey ?? row.clientId ?? row.username ?? row.name ?? '-')}
              </span>
            </div>
          )
        },
        {
          key: 'encryptionKey',
          header: 'Encryption Key',
          render: (row) => (
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-slate-400" />
              <span className="font-mono text-[10px] text-slate-500">
                {String(row.encryptionKey ?? row.secretKey ?? row.secret ?? '••••••••')}
              </span>
            </div>
          )
        },
        {
          key: 'createdDate',
          header: 'Created On',
          render: (row) => (
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar size={14} />
              <span className="text-xs font-medium">
                {String(row.createdDate ?? row.createdOn ?? row.createdAt ?? '-')}
              </span>
            </div>
          )
        }
      )
    } else {
      cols.push(...columnKeys.map(key => ({
        key,
        header: key.charAt(0).toUpperCase() + key.slice(1),
        render: (row: UnknownRecord) => (
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {String(row[key] ?? '-')}
          </span>
        )
      })))
    }
    return cols
  }, [columns, columnKeys, tableMode])

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows
    const q = searchQuery.toLowerCase()
    return rows.filter((row) =>
      Object.values(row).some((v) => v != null && String(v).toLowerCase().includes(q))
    )
  }, [rows, searchQuery])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex items-start gap-4">
         <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <Info className="text-emerald-600" size={24} />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">{description}</p>
            <div className="mt-3 flex items-center gap-2">
               <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                  ENDPOINT: {endpoint}
               </span>
            </div>
         </div>
      </div>

      <CRUDLayout
        title=""
        columns={crudColumns}
        data={filteredRows}
        loading={isLoading}
        pageable={{ page: 1, size: 50, totalElements: filteredRows.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onSearch={(q) => setSearchQuery(q)}
        onRefresh={() => void loadRows()}
        onAdd={showCreateButton ? () => setIsCreateOpen(true) : undefined}
        addButtonText="Create New"
        actions={{
          onDelete: onDelete ? (item) => {
            if (window.confirm('Are you sure you want to delete this item?')) {
              void onDelete(item.id as string | number).then(() => void loadRows())
            }
          } : undefined
        }}
      />

      <CRUDModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={`Add ${title}`}
        onSubmit={() => {
          if (createMode === 'credentials') void handleCreate()
          else if (createMode === 'fields') void handleCreateFields()
          else void handleCreateJson()
        }}
        isSubmitting={isCreating}
        submitLabel="Create Item"
      >
        <div className="space-y-5">
          {createMode === 'credentials' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Integration Key</label>
                <input
                  value={integrationKey}
                  onChange={(event) => setIntegrationKey(event.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g. PK_LIVE_..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Encryption Key</label>
                <input
                  value={encryptionKey}
                  onChange={(event) => setEncryptionKey(event.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g. SK_LIVE_..."
                />
              </div>
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Set as Active Credentials</span>
              </label>
            </>
          ) : createMode === 'fields' ? (
            createFields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
                {field.type === 'checkbox' ? (
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(fieldValues[field.key])}
                      onChange={(event) =>
                        setFieldValues((prev) => ({ ...prev, [field.key]: event.target.checked }))
                      }
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600"
                    />
                  </div>
                ) : field.type === 'select' ? (
                  <select
                    value={String(fieldValues[field.key] ?? '')}
                    onChange={(event) =>
                      setFieldValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none"
                  >
                    <option value="">Select...</option>
                    {(fieldOptions[field.key] ?? []).map((opt) => (
                      <option key={`${field.key}-${String(opt.value)}`} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={String(fieldValues[field.key] ?? '')}
                    onChange={(event) =>
                      setFieldValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Payload (JSON)</label>
              <textarea
                value={payloadText}
                onChange={(event) => setPayloadText(event.target.value)}
                rows={10}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}
        </div>
      </CRUDModal>
    </div>
  )
}

export default AdminStyledApiModulePage

const getValueByPath = (row: UnknownRecord, path: string): unknown => {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in (current as UnknownRecord)) {
      return (current as UnknownRecord)[key]
    }
    return undefined
  }, row)
}
