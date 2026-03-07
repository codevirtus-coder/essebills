import { adminJsonFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'
import type { PaymentTransaction } from '../../../types'

export interface DashboardTransaction {
  id: string | number
  date?: string
  time?: string
  customerName?: string
  customerInitials?: string
  biller?: string
  amount?: number
  status?: string
  agentCommission?: number
  platformFee?: number
  [key: string]: unknown
}

function normalizeTx(tx: PaymentTransaction): DashboardTransaction {
  const dt = tx.dateTimeOfTransaction ? new Date(tx.dateTimeOfTransaction) : null
  const customerIdentifier = tx.customerEmail ?? tx.customerPhoneNumber ?? '—'
  return {
    ...tx,
    id: tx.id ?? Math.random(),
    date: dt ? dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    time: dt ? dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
    customerName: customerIdentifier,
    customerInitials: customerIdentifier.slice(0, 2).toUpperCase(),
    biller: tx.productName ?? '—',
    amount: tx.amount ?? tx.totalAmount ?? 0,
    status: tx.paymentStatus ?? '—',
  }
}

export async function getRecentPaymentTransactions(): Promise<DashboardTransaction[]> {
  const result = await adminJsonFetch<PaymentTransaction[] | { content?: PaymentTransaction[] }>(
    ADMIN_ENDPOINTS.paymentTransactions.root,
  )
  const raw = Array.isArray(result) ? result : (result?.content ?? [])
  return raw.map(normalizeTx)
}

export async function getUsersCount(): Promise<number> {
  const result = await adminJsonFetch<{ totalElements?: number; content?: unknown[] }>(
    ADMIN_ENDPOINTS.users.root,
    { filters: { size: 1 } },
  )
  return result?.totalElements ?? (Array.isArray(result) ? (result as unknown[]).length : 0)
}
