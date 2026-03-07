import React, { useMemo, useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { confirmToast } from '../../../lib/confirmToast'
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
  Activity
} from 'lucide-react'
import { cn } from '../../../lib/utils'

type ParameterModule = 'currencies' | 'countries' | 'holidays' | 'banks' | 'productCategories'
type UnknownRecord = Record<string, unknown>

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
    if (!Number.isFinite(id) && module !== 'holidays') {
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
    
    confirmToast(`Delete ${name}?`, () => {
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
