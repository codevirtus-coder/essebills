import { API_ENDPOINTS } from '../../../api/endpoints'
import { apiFetch } from '../../../api/client'

export interface AgentWalletBalance {
  id: number
  currencyCode: string
  balance: number
}

export interface AgentWalletTransaction {
  id: number
  currencyCode: string
  amount: number
  transactionType: 'COMMISSION_EARNED' | 'TOP_UP'
  description?: string
  paymentTransactionRef?: string
  productCode?: string
  runningBalance?: number
  createdDate?: string
}

export interface PendingBankTopUp {
  id: number
  currencyCode: string
  amount: number
  depositReference?: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  rejectionReason?: string
  walletCreditRef?: string
  createdDate?: string
  processedAt?: string
  eseBillsAccount?: { bank?: string; accountNumber?: string; accountName?: string }
}

// Kept for backward compat with existing code that imports WalletBalance
export type WalletBalance = AgentWalletBalance

// Kept for backward compat
export type WalletHistoryEntry = AgentWalletTransaction & Record<string, unknown>

export async function getAgentWalletBalances(): Promise<AgentWalletBalance[]> {
  const result = await apiFetch<AgentWalletBalance[]>(API_ENDPOINTS.agent.wallet.balances)
  return Array.isArray(result) ? result : []
}

export async function getAgentWalletHistory(page = 0, size = 20): Promise<{ content: AgentWalletTransaction[]; totalElements: number }> {
  const result = await apiFetch<{ content?: AgentWalletTransaction[]; totalElements?: number }>(
    `${API_ENDPOINTS.agent.wallet.history}?page=${page}&size=${size}`
  )
  return { content: result?.content ?? [], totalElements: result?.totalElements ?? 0 }
}

export async function getMyBankTopUps(page = 0, size = 20): Promise<{ content: PendingBankTopUp[]; totalElements: number }> {
  const result = await apiFetch<{ content?: PendingBankTopUp[]; totalElements?: number }>(
    `${API_ENDPOINTS.wallet.bankTopUps}?page=${page}&size=${size}`
  )
  return { content: result?.content ?? [], totalElements: result?.totalElements ?? 0 }
}
