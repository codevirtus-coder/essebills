import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, RefreshCw, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import {
  listBankTopUps,
  confirmTopUp,
  rejectTopUp,
  getProofOfPaymentUrl,
  type AdminBankTopUp,
} from '../services/adminBankTopUps.service'

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Rejected', value: 'REJECTED' },
]

function StatusBadge({ status }: { status: AdminBankTopUp['status'] }) {
  const styles = {
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    CONFIRMED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    REJECTED: 'bg-red-50 text-red-600 border-red-100',
  }
  const icons = {
    PENDING: <Clock size={11} />,
    CONFIRMED: <CheckCircle size={11} />,
    REJECTED: <XCircle size={11} />,
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  )
}

interface RejectModalProps {
  item: AdminBankTopUp
  onConfirm: (reason: string) => void
  onCancel: () => void
  loading: boolean
}

function RejectModal({ item, onConfirm, onCancel, loading }: RejectModalProps) {
  const [reason, setReason] = useState('')
  return (
    <CRUDModal isOpen={true} onClose={onCancel} title="Reject Bank Top-Up">
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-xl">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Agent</p>
              <p className="font-semibold text-slate-900">{item.user?.firstName} {item.user?.lastName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Amount</p>
              <p className="font-bold text-emerald-600">{item.currencyCode} {Number(item.amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Bank</p>
              <p className="font-medium text-slate-700">{item.eseBillsAccount?.bank ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Reference</p>
              <p className="font-mono text-xs text-emerald-600">{item.depositReference ?? '—'}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rejection Reason</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || loading}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </CRUDModal>
  )
}

interface ViewModalProps {
  item: AdminBankTopUp
  onClose: () => void
  onConfirm: () => void
  onReject: () => void
  onViewProof: () => void
  confirmLoading: boolean
  rejectLoading: boolean
  proofLoading: boolean
}

function ViewModal({ item, onClose, onConfirm, onReject, onViewProof, confirmLoading, rejectLoading, proofLoading }: ViewModalProps) {
  return (
    <CRUDModal isOpen={true} onClose={onClose} title="Bank Top-Up Details">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agent</p>
            <p className="font-semibold text-slate-900">{item.user?.firstName} {item.user?.lastName}</p>
            <p className="text-xs text-slate-500">{item.user?.email ?? ''}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Amount</p>
            <p className="text-2xl font-black text-emerald-700">{item.currencyCode} {Number(item.amount).toFixed(2)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank</p>
            <p className="font-semibold text-slate-900">{item.eseBillsAccount?.bank ?? '—'}</p>
            <p className="text-xs font-mono text-slate-600">{item.eseBillsAccount?.accountNumber ?? ''}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reference</p>
            <p className="font-mono text-sm text-emerald-600">{item.depositReference ?? '—'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Submitted</p>
            <p className="text-sm text-slate-700">{item.createdDate ? new Date(item.createdDate).toLocaleString() : '—'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
            <StatusBadge status={item.status} />
          </div>
        </div>
        {item.status === 'REJECTED' && item.rejectionReason && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700">{item.rejectionReason}</p>
          </div>
        )}
        {item.status === 'PENDING' && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onViewProof}
              disabled={proofLoading}
              className="flex-1 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              title="Open uploaded proof of payment"
            >
              <Eye size={16} />
              Proof
            </button>
            <button
              onClick={onReject}
              disabled={rejectLoading}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmLoading}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        )}
        {item.status !== 'PENDING' && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onViewProof}
              disabled={proofLoading}
              className="flex-1 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              title="Open uploaded proof of payment"
            >
              <Eye size={16} />
              Proof
            </button>
          </div>
        )}
      </div>
    </CRUDModal>
  )
}

export default function BankTopUps() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING')
  const [page, setPage] = useState(0)
  const [viewItem, setViewItem] = useState<AdminBankTopUp | null>(null)
  const [rejectItem, setRejectItem] = useState<AdminBankTopUp | null>(null)
  const [proofLoading, setProofLoading] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-bank-top-ups', statusFilter, page],
    queryFn: () => listBankTopUps(statusFilter === 'ALL' ? undefined : statusFilter, page, 20),
  })

  const confirmMutation = useMutation({
    mutationFn: (id: number) => confirmTopUp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bank-top-ups'] })
      setViewItem(null)
      setRejectItem(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectTopUp(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bank-top-ups'] })
      setRejectItem(null)
    },
  })

  const items = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = Math.ceil(totalElements / 20) || 1

  function userName(u?: AdminBankTopUp['user']) {
    if (!u) return '—'
    return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || String(u.id)
  }

  function formatDate(d?: string) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const columns: CRUDColumn<AdminBankTopUp>[] = [
    {
      key: 'user',
      header: 'Agent',
      render: (item) => (
        <div>
          <p className="font-semibold text-slate-900">{userName(item.user)}</p>
          <p className="text-[11px] text-slate-400">{item.user?.email ?? ''}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'bankAccount',
      header: 'Bank Account',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-700">{item.eseBillsAccount?.bank ?? '—'}</p>
          <p className="text-[11px] text-slate-400 font-mono">{item.eseBillsAccount?.accountNumber ?? ''}</p>
        </div>
      ),
    },
    {
      key: 'currencyCode',
      header: 'Currency',
      render: (item) => <span className="font-bold text-slate-700">{item.currencyCode}</span>,
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => <span className="font-bold text-emerald-600">{Number(item.amount).toFixed(2)}</span>,
      sortable: true,
    },
    {
      key: 'depositReference',
      header: 'Reference',
      render: (item) => <span className="font-mono text-xs text-emerald-600">{item.depositReference ?? '—'}</span>,
    },
    {
      key: 'createdDate',
      header: 'Submitted',
      render: (item) => <span className="text-slate-500 text-xs whitespace-nowrap">{formatDate(item.createdDate)}</span>,
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={item.status} />
          {item.status === 'REJECTED' && item.rejectionReason && (
            <p className="text-[10px] text-red-500 max-w-[140px] truncate" title={item.rejectionReason}>{item.rejectionReason}</p>
          )}
        </div>
      ),
      sortable: true,
    },
  ]

  const openProof = async (id: number) => {
    try {
      setProofLoading(true)
      const res: any = await getProofOfPaymentUrl(id)
      const url =
        typeof res === 'string'
          ? res
          : typeof res?.url === 'string'
            ? res.url
            : typeof res?.proofOfPaymentUrl === 'string'
              ? res.proofOfPaymentUrl
              : res && typeof res === 'object'
                ? (Object.values(res).find((v) => typeof v === 'string') as string | undefined)
                : undefined

      if (!url) {
        toast.error('No proof-of-payment URL returned')
        return
      }

      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load proof-of-payment')
    } finally {
      setProofLoading(false)
    }
  }

  const StatusFilterComponent = (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
      {STATUS_TABS.map((t) => (
        <button
          key={t.value}
          onClick={() => { setStatusFilter(t.value); setPage(0) }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            statusFilter === t.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <CRUDLayout
        title="Bank Top-Up Requests"
        columns={columns}
        data={items}
        loading={isLoading}
        pageable={{ page: page + 1, size: 20, totalElements, totalPages }}
        onPageChange={(p) => setPage(p - 1)}
        onSizeChange={() => {}}
        onRefresh={refetch}
        filterComponent={StatusFilterComponent}
        filterable
        actions={{
          onView: (item) => setViewItem(item),
          onEdit: (item) => {
            if (item.status === 'PENDING') {
              confirmMutation.mutate(item.id)
            }
          },
          renderCustom: (item) => {
            if (item.status !== 'PENDING') return null
            return (
              <button
                onClick={() => setRejectItem(item)}
                className="p-1 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
                title="Reject"
              >
                <XCircle size={14} />
              </button>
            )
          },
        }}
      />

      {viewItem && (
        <ViewModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onConfirm={() => confirmMutation.mutate(viewItem.id)}
          onReject={() => setRejectItem(viewItem)}
          onViewProof={() => void openProof(viewItem.id)}
          confirmLoading={confirmMutation.isPending}
          rejectLoading={rejectMutation.isPending}
          proofLoading={proofLoading}
        />
      )}

      {rejectItem && (
        <RejectModal
          item={rejectItem}
          onConfirm={(reason) => rejectMutation.mutate({ id: rejectItem.id, reason })}
          onCancel={() => setRejectItem(null)}
          loading={rejectMutation.isPending}
        />
      )}
    </div>
  )
}
