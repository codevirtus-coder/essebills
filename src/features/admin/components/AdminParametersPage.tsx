import React, { useMemo, useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { showConfirmDialog } from '../../shared/components/ConfirmDialog'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import {
  createBank,
  createCountry,
  createCurrency,
  createHoliday,
  createProductCategory,
  deleteBank,
  deleteCountry,
  deleteCurrency,
  deleteProductCategory,
  getPaginatedBanks,
  getAllHolidays,
  getPaginatedCountries,
  getPaginatedCurrencies,
  getAllProductCategories,
  updateBank,
  updateCountry,
  updateCurrency,
  updateProductCategory,
  reorderProductCategories,
} from '../services'
import {
  Globe,
  DollarSign,
  Calendar,
  Landmark,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Info,
  CheckCircle2,
  Activity,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Save,
} from 'lucide-react'
import { cn } from '../../../lib/utils'

type ParameterModule = 'currencies' | 'countries' | 'holidays' | 'banks' | 'productCategories'
type UnknownRecord = Record<string, unknown>

// ─── Sortable category row ────────────────────────────────────────────────────

interface SortableCategoryRowProps {
  row: UnknownRecord
  index: number
  total: number
  isDragOver: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
  onDelete: () => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
}

function SortableCategoryRow({
  row, index, total, isDragOver,
  onMoveUp, onMoveDown, onEdit, onDelete,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: SortableCategoryRowProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={cn(
        'flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border rounded-xl transition-all duration-150 select-none',
        isDragOver
          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.01] shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
      )}
    >
      <GripVertical className="w-4 h-4 text-slate-300 shrink-0 cursor-grab active:cursor-grabbing pointer-events-none" />
      <span className="text-lg w-7 text-center shrink-0">{String(row.emoji ?? '📦')}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{String(row.displayName ?? row.name ?? '—')}</p>
        <p className="text-xs text-slate-400 font-mono">{String(row.name ?? '—')}</p>
      </div>
      <span className={cn(
        'text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
        row.active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-400'
      )}>
        {row.active ? 'Active' : 'Hidden'}
      </span>
      <div className="flex items-center gap-1 shrink-0" draggable={false}>
        <button
          draggable={false}
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Move up"
        >
          <ArrowUp className="w-4 h-4 text-slate-500" />
        </button>
        <button
          draggable={false}
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Move down"
        >
          <ArrowDown className="w-4 h-4 text-slate-500" />
        </button>
        <button
          draggable={false}
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          draggable={false}
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

type FieldConfig = {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'checkbox'
}

type ColumnConfig = {
  key: string
  label: string
}

type ModuleConfig = {
  title: string
  subtitle: string
  icon: any
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
    subtitle: 'Manage global settlement and display currencies.',
    icon: DollarSign,
    listEndpoint: '/v1/currencies',
    createEndpoint: '/v1/currencies',
    list: async () => { const r = await getPaginatedCurrencies(); return r?.content ?? [] },
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
      { key: 'createdDate', label: 'Created On' },
    ],
    detailFields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'defaultCurrency', label: 'Is Default Currency?' },
      { key: 'description', label: 'Description' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created Date' },
    ],
    detailsTitle: 'Currency Policy Details',
  },
  countries: {
    title: 'Countries',
    subtitle: 'Define regional operational boundaries.',
    icon: Globe,
    listEndpoint: '/v1/countries',
    createEndpoint: '/v1/countries',
    list: async () => { const r = await getPaginatedCountries(); return r?.content ?? [] },
    create: createCountry,
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Country Code' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Country Code' },
      { key: 'createdDate', label: 'Created On' },
    ],
    detailFields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Country Code' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created Date' },
    ],
    detailsTitle: 'Country Details',
  },
  holidays: {
    title: 'Holidays',
    subtitle: 'Configure non-settlement bank holidays.',
    icon: Calendar,
    listEndpoint: '/v1/holidays',
    createEndpoint: '/v1/holidays?date=YYYY-MM-DD',
    list: getAllHolidays,
    create: (payload) => createHoliday(String(payload.date ?? '')),
    fields: [{ key: 'date', label: 'Date', type: 'date' }],
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'createdDate', label: 'Created On' },
    ],
    detailFields: [
      { key: 'date', label: 'Date' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created Date' },
    ],
    detailsTitle: 'Holiday Policy',
  },
  banks: {
    title: 'Registry',
    subtitle: 'Settlement financial institutions list.',
    icon: Landmark,
    listEndpoint: '/v1/banks',
    createEndpoint: '/v1/banks',
    list: async () => { const r = await getPaginatedBanks(); return r?.content ?? [] },
    create: createBank,
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'createdDate', label: 'Created On' },
    ],
    detailFields: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'createdBy', label: 'Created By' },
      { key: 'createdDate', label: 'Created Date' },
    ],
    detailsTitle: 'Institution Details',
  },
  productCategories: {
    title: 'Product Categories',
    subtitle: 'Global grouping for platform services.',
    icon: Layers,
    listEndpoint: '/v1/product-categories/all',
    createEndpoint: '/v1/product-categories',
    list: getAllProductCategories,
    create: createProductCategory,
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'displayName', label: 'Display Name' },
      { key: 'emoji', label: 'Icon Name' },
      { key: 'sortOrder', label: 'Sort Order', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'displayName', label: 'Display Name' },
      { key: 'createdDate', label: 'Created On' },
    ],
    detailFields: [
      { key: 'name', label: 'Name' },
      { key: 'displayName', label: 'Display Name' },
      { key: 'emoji', label: 'Emoji' },
      { key: 'sortOrder', label: 'Sort Order' },
      { key: 'active', label: 'Active' },
      { key: 'createdDate', label: 'Created Date' },
    ],
    detailsTitle: 'Category Policy Details',
  },
}

interface AdminParametersPageProps {
  module: ParameterModule
}

const AdminParametersPage: React.FC<AdminParametersPageProps> = ({ module }) => {
  const config = MODULE_CONFIGS[module]
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string | boolean>>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedRow, setSelectedRow] = useState<UnknownRecord | null>(null)
  
  const canEdit = module !== 'holidays'
  const canDelete = module !== 'holidays'

  // ── Category sort order + drag state ───────────────────────────────────────
  const [sortedRows, setSortedRows] = useState<UnknownRecord[]>([])
  const [orderDirty, setOrderDirty] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    if (module === 'productCategories') {
      setSortedRows([...rows].sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)))
      setOrderDirty(false)
    }
  }, [rows, module])

  const moveCategoryUp = (index: number) => {
    if (index === 0) return
    setSortedRows(prev => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
    setOrderDirty(true)
  }

  const moveCategoryDown = (index: number) => {
    setSortedRows(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
    setOrderDirty(true)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragFromIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (index !== dragOverIndex) setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (dragFromIndex === null || dragFromIndex === toIndex) return
    setSortedRows(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragFromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
    setOrderDirty(true)
    setDragFromIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragFromIndex(null)
    setDragOverIndex(null)
  }

  const saveOrder = async () => {
    try {
      setIsSavingOrder(true)
      const entries = sortedRows.map((row, i) => ({ id: Number(row.id), sortOrder: i + 1 }))
      await reorderProductCategories(entries)
      toast.success('Category order saved')
      setOrderDirty(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save order')
    } finally {
      setIsSavingOrder(false)
    }
  }

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await config.list()
      setRows(Array.isArray(response) ? response : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [config])

  useEffect(() => {
    void load()
  }, [load, module])

  const handleCreate = async () => {
    for (const field of config.fields) {
      if (field.type === 'checkbox') continue
      if (!String(form[field.key] ?? '').trim()) {
        toast.error(`${field.label} is required`)
        return
      }
    }

    try {
      setIsSubmitting(true)
      if (module === 'productCategories') {
        await createProductCategory({
          name: String(form.name ?? ''),
          displayName: String(form.displayName ?? ''),
          emoji: String(form.emoji ?? ''),
          sortOrder: Number(form.sortOrder ?? 0),
          active: Boolean(form.active),
        })
      } else {
        await config.create(form as UnknownRecord)
      }
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

  const handleUpdate = async () => {
    if (!selectedRow || !canEdit) return

    const id = Number(selectedRow.id)
    if (!Number.isFinite(id)) {
      toast.error('Record ID is missing')
      return
    }

    try {
      setIsUpdating(true)
      if (module === 'currencies') {
        await updateCurrency(id, {
          id,
          name: String(editForm.name ?? ''),
          code: String(editForm.code ?? ''),
          description: String(editForm.description ?? ''),
          rateToDefault: Number(editForm.rateToDefault || 1),
        })
      } else if (module === 'countries') {
        await updateCountry(id, { id, name: String(editForm.name ?? ''), code: String(editForm.code ?? '') })
      } else if (module === 'banks') {
        await updateBank(id, { name: String(editForm.name ?? ''), code: String(editForm.code ?? '') })
      } else if (module === 'productCategories') {
        await updateProductCategory(id, {
          name: String(editForm.name ?? ''),
          displayName: String(editForm.displayName ?? ''),
          emoji: String(editForm.emoji ?? ''),
          sortOrder: Number(editForm.sortOrder ?? 0),
          active: Boolean(editForm.active),
        })
      }

      toast.success('Record updated')
      setIsEditOpen(false)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = (row: UnknownRecord) => {
    if (!canDelete) return
    const id = Number(row.id)
    const name = String(row.name ?? row.code ?? row.date ?? `#${id}`)
    
    showConfirmDialog(`Delete ${name}?`, () => {
      let action: Promise<any>
      if (module === 'currencies') action = deleteCurrency(id)
      else if (module === 'countries') action = deleteCountry(id)
      else if (module === 'banks') action = deleteBank(id)
      else if (module === 'productCategories') action = deleteProductCategory(id)
      else return

      action.then(() => {
        toast.success('Deleted successfully')
        return load()
      }).catch(err => toast.error(err.message))
    })
  }

  const crudColumns: CRUDColumn<UnknownRecord>[] = useMemo(() => [
    ...config.columns.map(col => ({
      key: col.key,
      header: col.label,
      render: (row: UnknownRecord) => (
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{String(row[col.key] ?? '—')}</span>
      )
    }))
  ], [config])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex items-start gap-4">
         <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <config.icon className="text-emerald-600" size={24} />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{config.title}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">{config.subtitle}</p>
         </div>
      </div>

      {module === 'productCategories' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">Drag order determines display order on landing and services pages.</p>
            <div className="flex items-center gap-2">
              {orderDirty && (
                <button
                  onClick={saveOrder}
                  disabled={isSavingOrder}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingOrder ? 'Saving…' : 'Save Order'}
                </button>
              )}
              <button
                onClick={() => { setForm({}); setIsCreateOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-colors hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-10 text-slate-400 text-sm">Loading…</div>
          ) : sortedRows.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No categories yet.</div>
          ) : (
            <div className="space-y-2">
              {sortedRows.map((row, i) => (
                <SortableCategoryRow
                  key={String(row.id ?? i)}
                  row={row}
                  index={i}
                  total={sortedRows.length}
                  isDragOver={dragOverIndex === i}
                  onMoveUp={() => moveCategoryUp(i)}
                  onMoveDown={() => moveCategoryDown(i)}
                  onEdit={() => {
                    setSelectedRow(row)
                    const nextForm: any = {}
                    config.fields.forEach(f => nextForm[f.key] = f.type === 'checkbox' ? Boolean(row[f.key]) : String(row[f.key] ?? ''))
                    setEditForm(nextForm)
                    setIsEditOpen(true)
                  }}
                  onDelete={() => handleDelete(row)}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <CRUDLayout
          title=""
          columns={crudColumns}
          data={rows}
          loading={isLoading}
          pageable={{ page: 1, size: 50, totalElements: rows.length, totalPages: 1 }}
          onPageChange={() => {}}
          onSizeChange={() => {}}
          onRefresh={load}
          onAdd={() => { setForm({}); setIsCreateOpen(true); }}
          addButtonText={`Add ${config.title.slice(0, -1)}`}
          actions={{
            onEdit: canEdit ? (row) => {
              setSelectedRow(row)
              const nextForm: any = {}
              config.fields.forEach(f => nextForm[f.key] = f.type === 'checkbox' ? Boolean(row[f.key]) : String(row[f.key] ?? ''))
              setEditForm(nextForm)
              setIsEditOpen(true)
            } : undefined,
            onDelete: canDelete ? handleDelete : undefined
          }}
        />
      )}

      <CRUDModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={`New ${config.title.slice(0, -1)}`}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        submitLabel="Create Policy"
      >
        <div className="space-y-5">
          {config.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
              {field.type === 'checkbox' ? (
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.key])}
                    onChange={(e) => setForm(p => ({ ...p, [field.key]: e.target.checked }))}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
              ) : (
                <input
                  type={field.type ?? 'text'}
                  value={String(form[field.key] ?? '')}
                  onChange={(e) => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              )}
            </div>
          ))}
        </div>
      </CRUDModal>

      <CRUDModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Update ${config.title.slice(0, -1)}`}
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
        submitLabel="Save Changes"
      >
        <div className="space-y-5">
          {config.fields.map((field) => (
            <div key={`edit-${field.key}`} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
              {field.type === 'checkbox' ? (
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm[field.key])}
                    onChange={(e) => setEditForm(p => ({ ...p, [field.key]: e.target.checked }))}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600"
                  />
                </div>
              ) : (
                <input
                  type={field.type ?? 'text'}
                  value={String(editForm[field.key] ?? '')}
                  onChange={(e) => setEditForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              )}
            </div>
          ))}
        </div>
      </CRUDModal>
    </div>
  )
}

export default AdminParametersPage
