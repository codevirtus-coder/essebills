// ============================================================================
// Admin Services - Dashboard, Agents, Billers, Transactions
// ============================================================================

import { adminJsonFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'
import { API_ENDPOINTS } from '../../../api/endpoints'
import type { PaymentTransaction, PageResponse } from '../../../types'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface DashboardStats {
  totalRevenue: number
  totalTransactions: number
  activeUsers: number
  agentEarnings: number
  revenueChange: string
  transactionsChange: string
  usersChange: string
  billersChange?: string
}

// Analytics DTOs based on new API spec
export interface AnalyticsDashboardStats {
  totalRevenue?: number
  totalTransactions?: number
  activeUsers?: number
  agentEarnings?: number
  totalEarnings?: number
  revenueChange?: string
  transactionsChange?: string
  usersChange?: string
  billersCount?: number
  agentsCount?: number
  customersCount?: number
}

export interface TransactionFeedItem {
  id: string | number
  dateTimeOfTransaction?: string
  customerPhoneNumber?: string
  customerEmail?: string
  productName?: string
  amount?: number
  totalAmount?: number
  paymentStatus?: string
  agentCommission?: number
  platformFee?: number
}

export interface PageTransactionFeedDto {
  content?: TransactionFeedItem[]
  totalElements?: number
  totalPages?: number
  number?: number
  size?: number
}

export interface RevenueDataPoint {
  month: string
  revenue: number
}

export interface TopBiller {
  id: string | number
  name: string
  amount: number
  percentage: number
}

export interface TopAgent {
  id: string | number
  name: string
  shopName: string
  location: string
  totalTransactions: number
  totalEarnings: number
}

export interface Agent {
  id: string | number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  shopName: string
  location: string
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  walletBalance: number
  totalEarnings: number
  createdDate: string
  commissionedProducts?: CommissionRate[]
}

export interface CommissionRate {
  id: string | number
  productCategoryId: string
  productCategoryName: string
  rate: number
  isActive: boolean
}

export interface Biller {
  id: string | number
  companyName: string
  email: string
  phoneNumber: string
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  settlementBank?: string
  settlementAccount?: string
  platformFee: number
  agentCommission: number
  createdDate: string
}

export interface BillerSettlement {
  id: string | number
  billerId: string | number
  billerName: string
  periodStart: string
  periodEnd: string
  grossAmount: number
  platformFee: number
  agentCommission: number
  netAmount: number
  status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED'
  settlementDate?: string
  reference: string
}

export interface TransactionStatistics {
  totalCount: number
  totalAmount: number
  successCount: number
  successAmount: number
  pendingCount: number
  pendingAmount: number
  failedCount: number
  failedAmount: number
  byBiller: { billerName: string; count: number; amount: number }[]
}

export interface AdminBankTopUp {
  id: number
  agentId: string | number
  agentName: string
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

export interface AdminFloatTopUpRequest {
  agentId: string | number
  amount: number
  currencyCode: string
  notes?: string
}

// Query Parameters
export interface AdminQueryParams {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  search?: string
  status?: string
  fromDate?: string
  toDate?: string
}

// --------------------------------------------------------------------------
// Dashboard Services
// --------------------------------------------------------------------------

export async function getDashboardStats(): Promise<DashboardStats> {
  return adminJsonFetch<DashboardStats>(API_ENDPOINTS.adminDashboard.stats)
}

export async function getDashboardRevenue(params?: {
  period?: 'daily' | 'monthly' | 'yearly'
  fromDate?: string
  toDate?: string
}): Promise<RevenueDataPoint[]> {
  const query = new URLSearchParams()
  if (params?.period) query.set('period', params.period)
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)
  
  const queryString = query.toString()
  return adminJsonFetch<RevenueDataPoint[]>(
    queryString ? `${API_ENDPOINTS.adminDashboard.revenue}?${queryString}` : API_ENDPOINTS.adminDashboard.revenue
  )
}

export async function getTopBillers(limit = 5): Promise<TopBiller[]> {
  return adminJsonFetch<TopBiller[]>(`${API_ENDPOINTS.adminDashboard.topBillers}?limit=${limit}`)
}

export async function getTopAgents(limit = 5): Promise<TopAgent[]> {
  return adminJsonFetch<TopAgent[]>(`${API_ENDPOINTS.adminDashboard.topAgents}?limit=${limit}`)
}

export async function getActivityFeed(limit = 20): Promise<PaymentTransaction[]> {
  return adminJsonFetch<PaymentTransaction[]>(`${API_ENDPOINTS.adminDashboard.activityFeed}?limit=${limit}`)
}

// --------------------------------------------------------------------------
// Analytics API (New endpoints from API spec)
// --------------------------------------------------------------------------

/**
 * Get admin dashboard stats from analytics endpoint
 * Uses: GET /v1/analytics/admin/dashboard/stats
 */
export async function getAnalyticsDashboardStats(): Promise<AnalyticsDashboardStats> {
  return adminJsonFetch<AnalyticsDashboardStats>(API_ENDPOINTS.analytics.admin.dashboard.stats)
}

/**
 * Get paginated transaction feed from analytics endpoint
 * Uses: GET /v1/analytics/admin/dashboard/transactions
 */
export async function getAnalyticsTransactionFeed(params?: {
  page?: number
  size?: number
  sort?: string
}): Promise<PageTransactionFeedDto> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  
  const queryString = query.toString()
  return adminJsonFetch<PageTransactionFeedDto>(
    queryString 
      ? `${API_ENDPOINTS.analytics.admin.dashboard.transactions}?${queryString}` 
      : API_ENDPOINTS.analytics.admin.dashboard.transactions
  )
}

/**
 * Get revenue chart data from analytics endpoint
 * Uses: GET /v1/analytics/admin/dashboard/revenue
 */
export async function getAnalyticsRevenueChart(params?: {
  period?: string
  startDate?: string
  endDate?: string
}): Promise<RevenueDataPoint[]> {
  const query = new URLSearchParams()
  if (params?.period) query.set('period', params.period)
  if (params?.startDate) query.set('startDate', params.startDate)
  if (params?.endDate) query.set('endDate', params.endDate)
  
  const queryString = query.toString()
  const baseUrl = API_ENDPOINTS.analytics.admin.dashboard.revenue({})
  return adminJsonFetch<RevenueDataPoint[]>(
    queryString 
      ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}` 
      : baseUrl
  )
}

/**
 * Get donations summary from analytics endpoint
 * Uses: GET /v1/analytics/donations/summary
 */
export async function getDonationsSummary(): Promise<Record<string, unknown>> {
  return adminJsonFetch<Record<string, unknown>>(API_ENDPOINTS.analytics.donations.summary)
}

/**
 * Get WhatsApp sessions summary from analytics endpoint
 * Uses: GET /v1/analytics/whatsapp-sessions/summary
 */
export async function getWhatsAppSessionsSummary(): Promise<Record<string, unknown>> {
  return adminJsonFetch<Record<string, unknown>>(API_ENDPOINTS.analytics.whatsappSessions.summary)
}

// --------------------------------------------------------------------------
// Admin Transactions
// --------------------------------------------------------------------------

export async function getAdminTransactions(params?: AdminQueryParams): Promise<PageResponse<PaymentTransaction>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.search) query.set('search', params.search)
  if (params?.status) query.set('status', params.status)
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)

  const queryString = query.toString()
  return adminJsonFetch<PageResponse<PaymentTransaction>>(
    queryString ? `${API_ENDPOINTS.adminTransactions.root}?${queryString}` : API_ENDPOINTS.adminTransactions.root
  )
}

export async function getAdminTransactionById(id: string | number): Promise<PaymentTransaction> {
  return adminJsonFetch<PaymentTransaction>(API_ENDPOINTS.adminTransactions.byId(id))
}

export async function updateTransactionStatus(
  id: string | number,
  status: string,
  reason?: string
): Promise<PaymentTransaction> {
  return adminJsonFetch<PaymentTransaction>(API_ENDPOINTS.adminTransactions.updateStatus(id), {
    method: 'PUT',
    body: { status, reason },
  })
}

export async function getTransactionStatistics(params?: {
  fromDate?: string
  toDate?: string
}): Promise<TransactionStatistics> {
  const query = new URLSearchParams()
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)
  
  const queryString = query.toString()
  return adminJsonFetch<TransactionStatistics>(
    queryString ? `${API_ENDPOINTS.adminTransactions.statistics}?${queryString}` : API_ENDPOINTS.adminTransactions.statistics
  )
}

// --------------------------------------------------------------------------
// Admin Agents
// --------------------------------------------------------------------------

export async function getAgents(params?: AdminQueryParams): Promise<PageResponse<Agent>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.search) query.set('search', params.search)
  if (params?.status) query.set('status', params.status)

  const queryString = query.toString()
  return adminJsonFetch<PageResponse<Agent>>(
    queryString ? `${API_ENDPOINTS.adminAgents.root}?${queryString}` : API_ENDPOINTS.adminAgents.root
  )
}

export async function getAgentById(agentId: string | number): Promise<Agent> {
  return adminJsonFetch<Agent>(API_ENDPOINTS.adminAgents.byId(agentId))
}

export async function createAgent(agent: Partial<Agent>): Promise<Agent> {
  return adminJsonFetch<Agent>(API_ENDPOINTS.adminAgents.root, {
    method: 'POST',
    body: agent,
  })
}

export async function updateAgent(agentId: string | number, agent: Partial<Agent>): Promise<Agent> {
  return adminJsonFetch<Agent>(API_ENDPOINTS.adminAgents.byId(agentId), {
    method: 'PUT',
    body: agent,
  })
}

export async function updateAgentStatus(
  agentId: string | number,
  status: 'ACTIVE' | 'SUSPENDED'
): Promise<Agent> {
  return adminJsonFetch<Agent>(API_ENDPOINTS.adminAgents.updateStatus(agentId), {
    method: 'PUT',
    body: { status },
  })
}

export async function getAgentWallet(agentId: string | number): Promise<{
  currencyCode: string
  balance: number
  reservedBalance: number
}[]> {
  return adminJsonFetch(API_ENDPOINTS.adminAgents.wallet(agentId))
}

export async function getAgentTransactions(
  agentId: string | number,
  params?: AdminQueryParams
): Promise<PageResponse<PaymentTransaction>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())

  const queryString = query.toString()
  return adminJsonFetch<PageResponse<PaymentTransaction>>(
    queryString 
      ? `${API_ENDPOINTS.adminAgents.transactions(agentId)}?${queryString}` 
      : API_ENDPOINTS.adminAgents.transactions(agentId)
  )
}

export async function getAgentCommissions(agentId: string | number): Promise<{
  totalEarnings: number
  pendingPayout: number
  transactions: { date: string; amount: number; description: string }[]
}> {
  return adminJsonFetch(API_ENDPOINTS.adminAgents.commissions(agentId))
}

export async function addAgentFloat(
  agentId: string | number,
  topUp: AdminFloatTopUpRequest
): Promise<{ success: boolean; newBalance: number }> {
  return adminJsonFetch(API_ENDPOINTS.adminAgents.floatTopup(agentId), {
    method: 'POST',
    body: topUp,
  })
}

export async function getAgentBankTopUps(
  agentId: string | number,
  params?: AdminQueryParams
): Promise<PageResponse<AdminBankTopUp>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.status) query.set('status', params.status)

  const queryString = query.toString()
  return adminJsonFetch<PageResponse<AdminBankTopUp>>(
    queryString 
      ? `${API_ENDPOINTS.adminAgents.bankTopups(agentId)}?${queryString}` 
      : API_ENDPOINTS.adminAgents.bankTopups(agentId)
  )
}

export async function confirmAgentBankTopUp(
  agentId: string | number,
  topUpId: string | number
): Promise<{ success: boolean }> {
  return adminJsonFetch(API_ENDPOINTS.adminAgents.bankTopupConfirm(agentId, topUpId), {
    method: 'PUT',
  })
}

export async function rejectAgentBankTopUp(
  agentId: string | number,
  topUpId: string | number,
  reason: string
): Promise<{ success: boolean }> {
  return adminJsonFetch(API_ENDPOINTS.adminAgents.bankTopupReject(agentId, topUpId), {
    method: 'PUT',
    body: { reason },
  })
}

export async function getAgentCommissionRates(agentId: string | number): Promise<CommissionRate[]> {
  return adminJsonFetch<CommissionRate[]>(API_ENDPOINTS.adminAgents.commissionRates(agentId))
}

export async function setAgentCommissionRate(
  agentId: string | number,
  rate: Partial<CommissionRate>
): Promise<CommissionRate> {
  return adminJsonFetch<CommissionRate>(API_ENDPOINTS.adminAgents.commissionRates(agentId), {
    method: 'POST',
    body: rate,
  })
}

export async function updateAgentCommissionRate(
  agentId: string | number,
  rateId: string | number,
  rate: Partial<CommissionRate>
): Promise<CommissionRate> {
  return adminJsonFetch<CommissionRate>(API_ENDPOINTS.adminAgents.commissionRateById(agentId, rateId), {
    method: 'PUT',
    body: rate,
  })
}

// --------------------------------------------------------------------------
// Admin Billers
// --------------------------------------------------------------------------

export async function getBillers(params?: AdminQueryParams): Promise<PageResponse<Biller>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.search) query.set('search', params.search)
  if (params?.status) query.set('status', params.status)

  const queryString = query.toString()
  return adminJsonFetch<PageResponse<Biller>>(
    queryString ? `${API_ENDPOINTS.adminBillers.root}?${queryString}` : API_ENDPOINTS.adminBillers.root
  )
}

export async function getBillerById(billerId: string | number): Promise<Biller> {
  return adminJsonFetch<Biller>(API_ENDPOINTS.adminBillers.byId(billerId))
}

export async function createBiller(biller: Partial<Biller>): Promise<Biller> {
  return adminJsonFetch<Biller>(API_ENDPOINTS.adminBillers.root, {
    method: 'POST',
    body: biller,
  })
}

export async function updateBiller(billerId: string | number, biller: Partial<Biller>): Promise<Biller> {
  return adminJsonFetch<Biller>(API_ENDPOINTS.adminBillers.byId(billerId), {
    method: 'PUT',
    body: biller,
  })
}

export async function updateBillerStatus(
  billerId: string | number,
  status: 'ACTIVE' | 'SUSPENDED'
): Promise<Biller> {
  return adminJsonFetch<Biller>(API_ENDPOINTS.adminBillers.updateStatus(billerId), {
    method: 'PUT',
    body: { status },
  })
}

export async function getBillerProducts(billerId: string | number): Promise<{
  id: string | number
  name: string
  category: string
  isActive: boolean
}[]> {
  return adminJsonFetch(API_ENDPOINTS.adminBillers.products(billerId))
}

export async function getBillerTransactions(
  billerId: string | number,
  params?: AdminQueryParams
): Promise<PageResponse<PaymentTransaction>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())

  const queryString = query.toString()
  return adminJsonFetch<PageResponse<PaymentTransaction>>(
    queryString 
      ? `${API_ENDPOINTS.adminBillers.transactions(billerId)}?${queryString}` 
      : API_ENDPOINTS.adminBillers.transactions(billerId)
  )
}

export async function getBillerSettlements(
  billerId: string | number,
  params?: AdminQueryParams
): Promise<PageResponse<BillerSettlement>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())

  const queryString = query.toString()
  return adminJsonFetch<PageResponse<BillerSettlement>>(
    queryString 
      ? `${API_ENDPOINTS.adminBillers.settlements(billerId)}?${queryString}` 
      : API_ENDPOINTS.adminBillers.settlements(billerId)
  )
}

export async function getBillerAnalytics(billerId: string | number): Promise<{
  totalCollections: number
  totalFees: number
  totalNet: number
  transactionCount: number
  topProducts: { name: string; count: number; amount: number }[]
}> {
  return adminJsonFetch(API_ENDPOINTS.adminBillers.analytics(billerId))
}

export async function processBillerSettlement(
  billerId: string | number,
  settlement: { periodStart: string; periodEnd: string }
): Promise<BillerSettlement> {
  return adminJsonFetch<BillerSettlement>(API_ENDPOINTS.adminBillers.settlement(billerId), {
    method: 'POST',
    body: settlement,
  })
}

// --------------------------------------------------------------------------
// Admin Bank Top-ups
// --------------------------------------------------------------------------

export async function getAllBankTopUps(params?: AdminQueryParams): Promise<PageResponse<AdminBankTopUp>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.status) query.set('status', params.status)

  const queryString = query.toString()
  return adminJsonFetch<PageResponse<AdminBankTopUp>>(
    queryString ? `${API_ENDPOINTS.adminBankTopUps.root}?${queryString}` : API_ENDPOINTS.adminBankTopUps.root
  )
}

export async function getPendingBankTopUps(params?: AdminQueryParams): Promise<PageResponse<AdminBankTopUp>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())

  const queryString = query.toString()
  return adminJsonFetch<PageResponse<AdminBankTopUp>>(
    queryString ? `${API_ENDPOINTS.adminBankTopUps.pending}?${queryString}` : API_ENDPOINTS.adminBankTopUps.pending
  )
}

export async function confirmBankTopUp(id: string | number): Promise<{ success: boolean }> {
  return adminJsonFetch(API_ENDPOINTS.adminBankTopUps.confirm(id), {
    method: 'PUT',
  })
}

export async function rejectBankTopUp(
  id: string | number,
  reason: string
): Promise<{ success: boolean }> {
  return adminJsonFetch(API_ENDPOINTS.adminBankTopUps.reject(id), {
    method: 'PUT',
    body: { reason },
  })
}

// --------------------------------------------------------------------------
// Admin Reports
// --------------------------------------------------------------------------

export async function getRevenueReport(params?: {
  fromDate?: string
  toDate?: string
  groupBy?: 'day' | 'week' | 'month'
}): Promise<{ date: string; revenue: number; transactions: number }[]> {
  const query = new URLSearchParams()
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)
  if (params?.groupBy) query.set('groupBy', params.groupBy)

  const queryString = query.toString()
  return adminJsonFetch(
    queryString ? `${API_ENDPOINTS.adminReports.revenue}?${queryString}` : API_ENDPOINTS.adminReports.revenue
  )
}

export async function getAgentsReport(params?: AdminQueryParams): Promise<Agent[]> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)

  const queryString = query.toString()
  return adminJsonFetch(
    queryString ? `${API_ENDPOINTS.adminReports.agents}?${queryString}` : API_ENDPOINTS.adminReports.agents
  )
}

export async function getBillersReport(params?: AdminQueryParams): Promise<Biller[]> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())

  const queryString = query.toString()
  return adminJsonFetch(
    queryString ? `${API_ENDPOINTS.adminReports.billers}?${queryString}` : API_ENDPOINTS.adminReports.billers
  )
}

export async function getCommissionsReport(params?: {
  fromDate?: string
  toDate?: string
}): Promise<{
  totalPaid: number
  totalPending: number
  byAgent: { agentName: string; amount: number }[]
}> {
  const query = new URLSearchParams()
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)

  const queryString = query.toString()
  return adminJsonFetch(
    queryString ? `${API_ENDPOINTS.adminReports.commissions}?${queryString}` : API_ENDPOINTS.adminReports.commissions
  )
}

// --------------------------------------------------------------------------
// Admin Settings
// --------------------------------------------------------------------------

export async function getPlatformSettings(): Promise<{
  platformName: string
  primaryColor: string
  globalCommission: number
  allowAgentRegistrations: boolean
  maintenanceMode: boolean
  minWithdrawal: number
  maxDailyTransaction: number
}> {
  return adminJsonFetch(API_ENDPOINTS.adminSettings.platform)
}

export async function updatePlatformSettings(settings: {
  platformName?: string
  primaryColor?: string
  globalCommission?: number
  allowAgentRegistrations?: boolean
  maintenanceMode?: boolean
  minWithdrawal?: number
  maxDailyTransaction?: number
}): Promise<{ success: boolean }> {
  return adminJsonFetch(API_ENDPOINTS.adminSettings.platform, {
    method: 'PUT',
    body: settings,
  })
}
