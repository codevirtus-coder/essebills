import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import {
  listBankTopUps,
  confirmTopUp,
  rejectTopUp,
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
    PENDING:   'bg-amber-50 text-amber-600 border-amber-100',
    CONFIRMED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    REJECTED:  'bg-red-50 text-red-600 border-red-100',
  }
  const icons = {
    PENDING:   <Clock size={11} />,
    CONFIRMED: <CheckCircle size={11} />,
    REJECTED:  <XCircle size={11} />,
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  )
}

function RejectModal({ onConfirm, onCancel, loading }: { onConfirm: (reason: string) => void; onCancel: () => void; loading: boolean }) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Reject Top-Up</h3>
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
        <div className="flex gap-3">
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
    </div>
  )
}

export default function BankTopUps() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING')
  const [page, setPage] = useState(0)
  const [rejectTarget, setRejectTarget] = useState<AdminBankTopUp | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-bank-top-ups', statusFilter, page],
    queryFn: () => listBankTopUps(statusFilter === 'ALL' ? undefined : statusFilter, page, 20),
  })

  const confirmMutation = useMutation({
    mutationFn: (id: number) => confirmTopUp(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bank-top-ups'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectTopUp(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bank-top-ups'] })
      setRejectTarget(null)
    },
  })

  const items = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = Math.ceil(totalElements / 20)

  function userName(u?: AdminBankTopUp['user']) {
    if (!u) return '—'
    return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || String(u.id)
  }

  function formatDate(d?: string) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Bank Top-Up Requests</h2>
          <p className="text-sm text-slate-500 mt-0.5">Review and process agent wallet top-up submissions</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <CheckCircle size={32} className="text-slate-200" />
            <span className="text-sm font-medium">No top-up requests found</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Agent', 'Bank Account', 'Currency', 'Amount', 'Reference', 'Submitted', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{userName(item.user)}</p>
                      <p className="text-[11px] text-slate-400">{item.user?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p className="font-medium">{item.eseBillsAccount?.bank ?? '—'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{item.eseBillsAccount?.accountNumber ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">{item.currencyCode}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{Number(item.amount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-emerald-600">{item.depositReference ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(item.createdDate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                      {item.status === 'REJECTED' && item.rejectionReason && (
                        <p className="text-[10px] text-red-500 mt-1 max-w-[140px] truncate" title={item.rejectionReason}>{item.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmMutation.mutate(item.id)}
                            disabled={confirmMutation.isPending}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setRejectTarget(item)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 text-[11px] font-bold hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">{formatDate(item.processedAt)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">{totalElements} total</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          onConfirm={(reason) => rejectMutation.mutate({ id: rejectTarget.id, reason })}
          onCancel={() => setRejectTarget(null)}
          loading={rejectMutation.isPending}
        />
      )}
    </div>
  )
}
