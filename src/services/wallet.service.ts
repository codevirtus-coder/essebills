// ============================================================================
// Wallet Service - Shared for Agents and Customers
// ============================================================================

import { apiFetch, toQueryString, multipartFetch } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type { PageResponse } from '../types'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface WalletBalance {
  id: number
  currencyCode: string
  balance: number
  reservedBalance?: number
  availableBalance?: number
}

export interface WalletTransaction {
  id: number
  currencyCode: string
  amount: number
  transactionType: 'TOP_UP' | 'COMMISSION_EARNED' | 'PAYOUT' | 'ADJUSTMENT' | 'PURCHASE'
  description?: string
  paymentTransactionRef?: string
  productCode?: string
  runningBalance: number
  createdDate: string
}

export interface BankTopUpRequest {
  eseBillsAccountId: number
  amount: number
  currencyCode: string
  depositReference: string
}

export interface BankTopUp {
  id: number
  currencyCode: string
  amount: number
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  depositReference?: string
  rejectionReason?: string
  walletCreditRef?: string
  createdDate?: string
  processedAt?: string
  eseBillsAccount?: { 
    id: number
    bank?: string
    accountNumber?: string
    accountName?: string 
  }
}

export interface EseBillsAccount {
  id: number
  bank: string
  accountNumber: string
  accountName: string
  currencyCode: string
  // Some environments return `active`, others only `deleted` on the account itself.
  active: boolean
}

// --------------------------------------------------------------------------
// Wallet Queries
// --------------------------------------------------------------------------

/** Get current user's wallet balances */
export async function getMyWalletBalances(role: 'agent' | 'customer'): Promise<WalletBalance[]> {
  const endpoint = role === 'agent' 
    ? API_ENDPOINTS.agent.wallet.balances 
    : API_ENDPOINTS.customer.wallet.balances
  return apiFetch<WalletBalance[]>(endpoint)
}

/** Get wallet transaction history */
export async function getMyWalletHistory(
  role: 'agent' | 'customer',
  params?: { page?: number; size?: number }
): Promise<PageResponse<WalletTransaction>> {
  const endpoint = role === 'agent' 
    ? API_ENDPOINTS.agent.wallet.history 
    : API_ENDPOINTS.customer.wallet.history
  const query = params ? toQueryString(params) : ''
  return apiFetch<PageResponse<WalletTransaction>>(`${endpoint}${query}`)
}

// --------------------------------------------------------------------------
// Bank Top-up Actions
// --------------------------------------------------------------------------

/** Get EseBills bank accounts for manual deposit */
export async function getEseBillsAccounts(currencyCode?: string): Promise<EseBillsAccount[]> {
  const query = currencyCode ? toQueryString({ currencyCode }) : ''
  // OpenAPI: GET /v1/esebills-accounts is paginated (PageEseBillsAccount).
  // Some environments may still return a plain array, so support both.
  const res = await apiFetch<unknown>(`${API_ENDPOINTS.esebillsAccounts.root}${query}`)
  const rawList: unknown[] = Array.isArray(res)
    ? res
    : res && typeof res === 'object' && Array.isArray((res as any).content)
      ? ((res as any).content as unknown[])
      : []

  return rawList
    .filter((r) => r && typeof r === 'object')
    .map((r) => {
      const row = r as any
      const currency = row.currency
      const currencyCodeValue =
        typeof row.currencyCode === 'string'
          ? row.currencyCode
          : currency && typeof currency === 'object' && typeof currency.code === 'string'
            ? currency.code
            : ''

      // Treat missing `active` as active unless explicitly deleted.
      const activeValue =
        typeof row.active === 'boolean' ? row.active : row.deleted === true ? false : true

      return {
        id: Number(row.id),
        bank: String(row.bank ?? ''),
        accountNumber: String(row.accountNumber ?? ''),
        accountName: String(row.accountName ?? ''),
        currencyCode: String(currencyCodeValue),
        active: Boolean(activeValue),
      } satisfies EseBillsAccount
    })
    .filter((a) => a.id && a.bank && a.accountNumber && a.accountName && a.currencyCode)
}

/** Notify system of a bank deposit */
export async function initiateBankTopUp(topUp: BankTopUpRequest): Promise<BankTopUp> {
  return apiFetch<BankTopUp>(API_ENDPOINTS.wallet.bankTopUps, {
    method: 'POST',
    body: topUp,
  })
}

/** Upload proof of payment (deposit slip) for a pending top-up */
export async function uploadProofOfPayment(topUpId: number, file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  
  const explicitUrl = `/v1/user/bank-top-ups/${topUpId}/proof-of-payment`
  return multipartFetch<void>(explicitUrl, formData)
}

/** Get list of user's bank top-ups */
export async function getMyBankTopUps(params?: { page?: number; size?: number }): Promise<PageResponse<BankTopUp>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch<PageResponse<BankTopUp>>(`${API_ENDPOINTS.wallet.bankTopUps}${query}`)
}
