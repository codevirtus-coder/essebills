import { apiFetch } from '../../../api/apiClient'
import { API_ENDPOINTS } from '../../../api/endpoints'

export interface AdminBankTopUp {
  id: number
  currencyCode: string
  amount: number
  depositReference?: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  rejectionReason?: string
  walletCreditRef?: string
  createdDate?: string
  processedAt?: string
  user?: { id: number; username?: string; firstName?: string; lastName?: string; email?: string }
  eseBillsAccount?: { bank?: string; accountNumber?: string; accountName?: string }
  processedBy?: { id: number; username?: string }
}

export async function listBankTopUps(
  status?: string,
  page = 0,
  size = 20
): Promise<{ content: AdminBankTopUp[]; totalElements: number }> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (status) params.set('status', status)
  const result = await apiFetch<{ content?: AdminBankTopUp[]; totalElements?: number }>(
    `${API_ENDPOINTS.adminBankTopUps.root}?${params}`
  )
  return { content: result?.content ?? [], totalElements: result?.totalElements ?? 0 }
}

export async function confirmTopUp(id: number): Promise<AdminBankTopUp> {
  return apiFetch<AdminBankTopUp>(API_ENDPOINTS.adminBankTopUps.confirm(id), { method: 'POST' })
}

export async function rejectTopUp(id: number, reason: string): Promise<AdminBankTopUp> {
  return apiFetch<AdminBankTopUp>(API_ENDPOINTS.adminBankTopUps.reject(id), {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}
