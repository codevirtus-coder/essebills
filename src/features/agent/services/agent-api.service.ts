// ============================================================================
// Agent Services - Wallet, Payments, Commissions
// ============================================================================

import { apiFetch } from '../../../api/apiClient'
import { API_ENDPOINTS } from '../../../api/endpoints'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface AgentProfile {
  id: string | number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  shopName: string
  location: string
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
}

export interface AgentWalletBalance {
  id: number
  currencyCode: string
  balance: number
  reservedBalance: number
  availableBalance: number
}

export interface AgentWalletTransaction {
  id: number
  currencyCode: string
  amount: number
  transactionType: 'TOP_UP' | 'COMMISSION_EARNED' | 'PAYOUT' | 'ADJUSTMENT'
  description?: string
  paymentTransactionRef?: string
  productCode?: string
  runningBalance: number
  createdDate: string
}

export interface AgentBankTopUp {
  id: number
  currencyCode: string
  amount: number
  bankName: string
  accountNumber: string
  depositReference: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  rejectionReason?: string
  createdDate: string
  processedDate?: string
}

export interface AgentBankAccount {
  id: number
  bankName: string
  accountNumber: string
  accountName: string
  isActive: boolean
}

export interface AgentCommissionBalance {
  totalEarned: number
  pendingPayout: number
  availableBalance: number
}

export interface AgentCommissionHistory {
  id: number
  amount: number
  type: 'EARNED' | 'PAID_OUT'
  description: string
  createdDate: string
  runningBalance: number
}

export interface AgentCommissionRate {
  id: number
  productCategoryId: string
  productCategoryName: string
  rate: number
  isActive: boolean
}

export interface AgentPayoutRequest {
  id: number
  amount: number
  currencyCode: string
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED'
  rejectionReason?: string
  createdDate: string
  processedDate?: string
}

export interface AgentPaymentProduct {
  id: string | number
  name: string
  category: string
  categoryId: string
  isActive: boolean
  commissionRate: number
}

export interface AgentSaleRequest {
  productId: string | number
  customerReference: string
  amount: number
  currency?: string
}

export interface AgentSaleResponse {
  id: string | number
  status: string
  amount: number
  productName: string
  customerReference: string
  token?: string
  units?: string
  message?: string
  transactionDate: string
}

export interface Sale {
  id: string
  biller: string
  customer: string
  amount: number
  commission: number
  time: string
  icon: string
  token?: string
  units?: string
}

// Query Parameters
export interface AgentQueryParams {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  status?: string
  fromDate?: string
  toDate?: string
}

// --------------------------------------------------------------------------
// Profile Services
// --------------------------------------------------------------------------

export async function getAgentProfile(): Promise<AgentProfile> {
  return apiFetch<AgentProfile>(API_ENDPOINTS.agent.profile)
}

export async function updateAgentProfile(profile: Partial<AgentProfile>): Promise<AgentProfile> {
  return apiFetch<AgentProfile>(API_ENDPOINTS.agent.updateProfile, {
    method: 'PUT',
    body: profile,
  })
}

export async function getShopDetails(): Promise<{
  shopName: string
  location: string
  agentCode: string
}> {
  return apiFetch(API_ENDPOINTS.agent.shopDetails)
}

// --------------------------------------------------------------------------
// Wallet Services
// --------------------------------------------------------------------------

export async function getAgentWalletBalances(): Promise<AgentWalletBalance[]> {
  return apiFetch<AgentWalletBalance[]>(API_ENDPOINTS.agent.wallet.balances)
}

export async function getAgentWalletHistory(params?: AgentQueryParams): Promise<{
  content: AgentWalletTransaction[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.agent.wallet.history}?${queryString}` 
      : API_ENDPOINTS.agent.wallet.history
  )
}

export async function getAgentWalletBalanceByCurrency(currency: string): Promise<AgentWalletBalance> {
  return apiFetch<AgentWalletBalance>(API_ENDPOINTS.agent.wallet.balanceByCurrency(currency))
}

// --------------------------------------------------------------------------
// Bank Top-up Services
// --------------------------------------------------------------------------

export async function getAgentBankTopUps(params?: AgentQueryParams): Promise<{
  content: AgentBankTopUp[]
  totalElements: number
  totalPages: number
}> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.status) query.set('status', params.status)

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.agent.bankTopups}?${queryString}` 
      : API_ENDPOINTS.agent.bankTopups
  )
}

export async function getAgentBankTopUpById(id: string | number): Promise<AgentBankTopUp> {
  return apiFetch<AgentBankTopUp>(API_ENDPOINTS.agent.bankTopupById(id))
}

export async function requestBankTopUp(topUp: {
  bankAccountId: number
  amount: number
  currencyCode: string
  depositReference: string
}): Promise<AgentBankTopUp> {
  return apiFetch<AgentBankTopUp>(API_ENDPOINTS.agent.bankTopups, {
    method: 'POST',
    body: topUp,
  })
}

export async function getAgentBankAccounts(): Promise<AgentBankAccount[]> {
  return apiFetch<AgentBankAccount[]>(API_ENDPOINTS.agent.bankAccounts)
}

// --------------------------------------------------------------------------
// Payment/Sales Services
// --------------------------------------------------------------------------

export async function processAgentPayment(payment: AgentSaleRequest): Promise<AgentSaleResponse> {
  return apiFetch<AgentSaleResponse>(API_ENDPOINTS.agent.payments.process, {
    method: 'POST',
    body: payment,
  })
}

export async function getAgentRecentPayments(limit = 10): Promise<Sale[]> {
  return apiFetch<Sale[]>(`${API_ENDPOINTS.agent.payments.recent}?limit=${limit}`)
}

export async function getAgentPaymentHistory(params?: AgentQueryParams): Promise<{
  content: Sale[]
  totalElements: number
  totalPages: number
}> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.agent.payments.history}?${queryString}` 
      : API_ENDPOINTS.agent.payments.history
  )
}

export async function getAgentPaymentById(id: string | number): Promise<Sale> {
  return apiFetch<Sale>(API_ENDPOINTS.agent.payments.byId(id))
}

export async function getAgentPaymentProducts(): Promise<AgentPaymentProduct[]> {
  return apiFetch<AgentPaymentProduct[]>(API_ENDPOINTS.agent.payments.products)
}

// --------------------------------------------------------------------------
// Commission Services
// --------------------------------------------------------------------------

export async function getAgentCommissionBalance(): Promise<AgentCommissionBalance> {
  return apiFetch<AgentCommissionBalance>(API_ENDPOINTS.agent.commissions.balance)
}

export async function getAgentCommissionHistory(params?: AgentQueryParams): Promise<{
  content: AgentCommissionHistory[]
  totalElements: number
  totalPages: number
}> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.agent.commissions.history}?${queryString}` 
      : API_ENDPOINTS.agent.commissions.history
  )
}

export async function getAgentCommissionRates(): Promise<AgentCommissionRate[]> {
  return apiFetch<AgentCommissionRate[]>(API_ENDPOINTS.agent.commissions.rates)
}

export async function requestCommissionPayout(request: {
  amount: number
  currencyCode: string
}): Promise<AgentPayoutRequest> {
  return apiFetch<AgentPayoutRequest>(API_ENDPOINTS.agent.commissions.payoutRequest, {
    method: 'POST',
    body: request,
  })
}

export async function getAgentPayoutHistory(params?: AgentQueryParams): Promise<{
  content: AgentPayoutRequest[]
  totalElements: number
  totalPages: number
}> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.status) query.set('status', params.status)

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.agent.commissions.payoutHistory}?${queryString}` 
      : API_ENDPOINTS.agent.commissions.payoutHistory
  )
}
