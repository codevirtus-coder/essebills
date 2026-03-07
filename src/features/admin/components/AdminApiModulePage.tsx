import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import { Info, KeyRound, Shield, Calendar } from 'lucide-react'

type UnknownRecord = Record<string, unknown>

interface AdminApiModulePageProps {
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
  createData,
  showCreateButton = true,
}) => {
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [integrationKey, setIntegrationKey] = useState('')
  const [encryptionKey, setEncryptionKey] = useState('')

  const loadRows = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const payload = await loadData()
      setRows(normalizeRows(payload))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [loadData])

  React.useEffect(() => {
    void loadRows()
  }, [loadRows])

  const handleCreate = async () => {
    if (!createData) return
    if (!integrationKey.trim() || !encryptionKey.trim()) {
      toast.error('Keys are required')
      return
    }

    try {
      setIsCreating(true)
      await createData({
        integrationKey: integrationKey.trim(),
        encryptionKey: encryptionKey.trim(),
      })
      toast.success('Record created')
      setIsCreateOpen(false)
      await loadRows()
    } catch (error) {
      toast.error('Failed to create')
    } finally {
      setIsCreating(false)
    }
  }

  const columns: CRUDColumn<UnknownRecord>[] = [
    {
      key: 'integrationKey',
      header: 'Integration Key',
      render: (row) => (
        <div className="flex items-center gap-2">
          <KeyRound size={14} className="text-emerald-500" />
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
            {String(row.integrationKey ?? row.apiKey ?? '-')}
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
            {String(row.encryptionKey ?? row.secretKey ?? '••••••••')}
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
          <span className="text-xs font-medium">{String(row.createdDate ?? '-')}</span>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex items-start gap-4">
         <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <Info className="text-emerald-600" size={24} />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">{description}</p>
            <div className="mt-3">
               <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500">
                  {endpoint}
               </span>
            </div>
         </div>
      </div>

      <CRUDLayout
        title=""
        columns={columns}
        data={rows}
        loading={isLoading}
        pageable={{ page: 1, size: 50, totalElements: rows.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onRefresh={() => void loadRows()}
        onAdd={showCreateButton ? () => setIsCreateOpen(true) : undefined}
      />

      <CRUDModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={`New ${title}`}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Integration Key</label>
            <input 
              value={integrationKey}
              onChange={e => setIntegrationKey(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Encryption Key</label>
            <input 
              value={encryptionKey}
              onChange={e => setEncryptionKey(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold"
            />
          </div>
        </div>
      </CRUDModal>
    </div>
  )
}

export default AdminApiModulePage
