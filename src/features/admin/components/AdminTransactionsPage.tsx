import React, { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import CRUDLayout, { type CRUDColumn, type PageableState } from '../../shared/components/CRUDLayout'
import { adminJsonFetch } from '../services'
import { ADMIN_ENDPOINTS } from '../services/admin.endpoints'
import { 
  ArrowLeftRight, 
  Search, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  MoreVertical,
  Calendar,
  User,
  Hash
} from 'lucide-react'
import { cn } from '../../../lib/utils'

type UnknownRecord = Record<string, unknown>

function toRows(payload: unknown): UnknownRecord[] {
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
  }
  return []
}

const AdminTransactionsPage: React.FC = () => {
  const [rows, setRows] = useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pageable, setPageable] = useState<PageableState>({
    page: 1,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  })

  const load = useCallback(async (pageIndex = 0, size = 20, q = '') => {
    try {
      setIsLoading(true)
      const payload: any = await adminJsonFetch<unknown>(ADMIN_ENDPOINTS.paymentTransactions.root, {
        filters: { page: pageIndex, size, search: q || undefined },
      })
      
      const content = toRows(payload)
      setRows(content)
      
      if (payload && typeof payload === 'object') {
        setPageable({
          page: (payload.number ?? 0) + 1,
          size: payload.size ?? size,
          totalElements: payload.totalElements ?? content.length,
          totalPages: payload.totalPages ?? 1,
        })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load transactions')
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(pageable.page - 1, pageable.size, searchTerm)
  }, [load, pageable.page, pageable.size])

  const columns: CRUDColumn<UnknownRecord>[] = [
    {
      key: 'dateTimeOfTransaction',
      header: 'Date & Time',
      render: (row) => {
        const raw = row.dateTimeOfTransaction ?? row.createdDate
        if (!raw) return <span className="text-slate-400">—</span>
        const date = new Date(String(raw))
        return (
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )
      },
    },
    {
      key: 'productReferenceNumber',
      header: 'Reference',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Hash size={12} className="text-slate-400" />
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {String(row.productReferenceNumber ?? row.pesepayReferenceNumber ?? '-')}
          </span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {String(row.customerEmail ?? row.customerPhoneNumber ?? '-')}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          ${(Number(row.amount ?? row.totalAmount) || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      className: 'text-center',
      render: (row) => {
        const status = String(row.paymentStatus ?? '').toUpperCase()
        const isSuccess = status === 'SUCCESS' || status === 'COMPLETED'
        const isPending = status === 'PENDING'
        
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            isSuccess 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" 
              : isPending
              ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
              : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {isSuccess ? <CheckCircle size={12} /> : isPending ? <Clock size={12} /> : <XCircle size={12} />}
            {status || 'UNKNOWN'}
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Volume", value: pageable.totalElements, icon: ArrowLeftRight, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Successful", value: "94.2%", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Recent Change", value: "+12.5%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "System Health", value: "Normal", icon: Activity, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <CRUDLayout
        title="Transaction Ledger"
        columns={columns}
        data={rows}
        loading={isLoading}
        pageable={pageable}
        onPageChange={(p) => setPageable(prev => ({ ...prev, page: p }))}
        onSizeChange={(s) => setPageable(prev => ({ ...prev, size: s, page: 1 }))}
        onSearch={setSearchTerm}
        onRefresh={() => void load(pageable.page - 1, pageable.size, searchTerm)}
        actions={{
          renderCustom: () => (
            <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors">
              <MoreVertical size={16} />
            </button>
          )
        }}
      />
    </div>
  )
}

export default AdminTransactionsPage
