import { adminJsonFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

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

export async function getRecentPaymentTransactions(): Promise<DashboardTransaction[]> {
  const result = await adminJsonFetch<DashboardTransaction[] | { content?: DashboardTransaction[] }>(
    '/v1/payment-transactions'
  )
  if (Array.isArray(result)) return result
  return result?.content ?? []
}

export async function getUsersCount(): Promise<number> {
  const result = await adminJsonFetch<unknown[]>(ADMIN_ENDPOINTS.users.all)
  return Array.isArray(result) ? result.length : 0
}
