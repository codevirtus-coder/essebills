import { apiFetch } from '../../../api/apiClient'
import { API_ENDPOINTS } from '../../../api/endpoints'

export interface WalletBalance {
  balance: number
  currency: string
}

export interface WalletHistoryEntry {
  id?: string | number
  date?: string
  amount?: number
  method?: string
  status?: string
  [key: string]: unknown
}

export async function getAgentWalletBalance(): Promise<WalletBalance> {
  return apiFetch<WalletBalance>(API_ENDPOINTS.agent.wallet.balance)
}

export async function getAgentWalletHistory(): Promise<WalletHistoryEntry[]> {
  const result = await apiFetch<WalletHistoryEntry[] | { content?: WalletHistoryEntry[] }>(
    API_ENDPOINTS.agent.wallet.history
  )
  if (Array.isArray(result)) return result
  return (result as { content?: WalletHistoryEntry[] })?.content ?? []
}
