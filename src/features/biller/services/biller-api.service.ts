// ============================================================================
// Biller Services - Collections, Settlements, Analytics
// ============================================================================

import { apiFetch } from '../../../api/apiClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import type { PaymentTransaction, PageResponse } from '../../../types'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface BillerProfile {
  id: string | number
  companyName: string
  email: string
  phoneNumber: string
  address: string
  settlementBank: string
  settlementAccount: string
  settlementAccountName: string
  platformFee: number
  agentCommission: number
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
}

export interface Collection {
  id: string | number
  transactionDate: string
  amount: number
  productName: string
  customerReference: string
  agentId: string
  agentName: string
  status: string
  fees: number
  netAmount: number
}

export interface CollectionsSummary {
  grossCollections: number
  totalFees: number
  netCollections: number
  transactionCount: number
  previousPeriodGross: number
  grossChange: number
}

export interface CollectionStatistics {
  totalCount: number
  totalAmount: number
  successCount: number
  pendingCount: number
  failedCount: number
  byProduct: { productName: string; count: number; amount: number }[]
  byAgent: { agentName: string; count: number; amount: number }[]
  hourlyDistribution: { hour: number; count: number; amount: number }[]
}

export interface Settlement {
  id: string | number
  periodStart: string
  periodEnd: string
  grossAmount: number
  platformFee: number
  agentCommission: number
  netAmount: number
  status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED'
  settlementDate?: string
  reference: string
  bankName: string
  accountNumber: string
}

export interface SettlementSummary {
  pendingAmount: number
  processingAmount: number
  settledAmount: number
  lastSettlementDate?: string
  nextSettlementDate?: string
}

export interface PaymentPoint {
  id: string | number
  agentName: string
  shopName: string
  location: string
  transactionCount: number
  totalAmount: number
  lastTransactionDate: string
  isActive: boolean
}

export interface BillerProduct {
  id: string | number
  name: string
  category: string
  isActive: boolean
  transactionCount: number
  totalAmount: number
}

export interface BillerAnalytics {
  daily: { date: string; collections: number; transactions: number }[]
  weekly: { week: string; collections: number; transactions: number }[]
  monthly: { month: string; collections: number; transactions: number }[]
  topProducts: { name: string; count: number; amount: number }[]
  summary: {
    totalCollections: number
    totalTransactions: number
    averageTransaction: number
    peakHour: number
  }
}

export interface NotificationSettings {
  dailySummary: boolean
  lowFloatAlerts: boolean
  payoutAlerts: boolean
  systemUpdates: boolean
}

// Query Parameters
export interface BillerQueryParams {
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

export async function getBillerProfile(): Promise<BillerProfile> {
  return apiFetch<BillerProfile>(API_ENDPOINTS.biller.profile)
}

export async function updateBillerProfile(profile: Partial<BillerProfile>): Promise<BillerProfile> {
  return apiFetch<BillerProfile>(API_ENDPOINTS.biller.updateProfile, {
    method: 'PUT',
    body: profile,
  })
}

// --------------------------------------------------------------------------
// Collections Services
// --------------------------------------------------------------------------

export async function getCollections(params?: BillerQueryParams): Promise<PageResponse<Collection>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)

  const queryString = query.toString()
  return apiFetch<PageResponse<Collection>>(
    queryString 
      ? `${API_ENDPOINTS.biller.collections.root}?${queryString}` 
      : API_ENDPOINTS.biller.collections.root
  )
}

export async function getCollectionsSummary(): Promise<CollectionsSummary> {
  return apiFetch<CollectionsSummary>(API_ENDPOINTS.biller.collections.summary)
}

export async function getCollectionById(id: string | number): Promise<Collection> {
  return apiFetch<Collection>(API_ENDPOINTS.biller.collections.byId(id))
}

export async function getCollectionStatistics(params?: {
  fromDate?: string
  toDate?: string
}): Promise<CollectionStatistics> {
  const query = new URLSearchParams()
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)

  const queryString = query.toString()
  return apiFetch<CollectionStatistics>(
    queryString 
      ? `${API_ENDPOINTS.biller.collections.statistics}?${queryString}` 
      : API_ENDPOINTS.biller.collections.statistics
  )
}

// --------------------------------------------------------------------------
// Settlements Services
// --------------------------------------------------------------------------

export async function getSettlements(params?: BillerQueryParams): Promise<PageResponse<Settlement>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.status) query.set('status', params.status)

  const queryString = query.toString()
  return apiFetch<PageResponse<Settlement>>(
    queryString 
      ? `${API_ENDPOINTS.biller.settlements.root}?${queryString}` 
      : API_ENDPOINTS.biller.settlements.root
  )
}

export async function getPendingSettlements(): Promise<{
  content: Settlement[]
  totalElements: number
}> {
  return apiFetch(API_ENDPOINTS.biller.settlements.pending)
}

export async function getSettlementById(id: string | number): Promise<Settlement> {
  return apiFetch<Settlement>(API_ENDPOINTS.biller.settlements.byId(id))
}

export async function getSettlementSummary(): Promise<SettlementSummary> {
  return apiFetch<SettlementSummary>(API_ENDPOINTS.biller.settlements.summary)
}

// --------------------------------------------------------------------------
// Analytics Services
// --------------------------------------------------------------------------

export async function getBillerDailyAnalytics(params?: {
  days?: number
}): Promise<{ date: string; collections: number; transactions: number }[]> {
  const query = new URLSearchParams()
  if (params?.days) query.set('days', params.days.toString())

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.biller.analytics.daily}?${queryString}` 
      : API_ENDPOINTS.biller.analytics.daily
  )
}

export async function getBillerWeeklyAnalytics(params?: {
  weeks?: number
}): Promise<{ week: string; collections: number; transactions: number }[]> {
  const query = new URLSearchParams()
  if (params?.weeks) query.set('weeks', params.weeks.toString())

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.biller.analytics.weekly}?${queryString}` 
      : API_ENDPOINTS.biller.analytics.weekly
  )
}

export async function getBillerMonthlyAnalytics(params?: {
  months?: number
}): Promise<{ month: string; collections: number; transactions: number }[]> {
  const query = new URLSearchParams()
  if (params?.months) query.set('months', params.months.toString())

  const queryString = query.toString()
  return apiFetch(
    queryString 
      ? `${API_ENDPOINTS.biller.analytics.monthly}?${queryString}` 
      : API_ENDPOINTS.biller.analytics.monthly
  )
}

export async function getBillerTopProducts(limit = 10): Promise<{
  name: string
  count: number
  amount: number
}[]> {
  return apiFetch(`${API_ENDPOINTS.biller.analytics.topProducts}?limit=${limit}`)
}

export async function getBillerFullAnalytics(): Promise<BillerAnalytics> {
  return apiFetch<BillerAnalytics>(`${API_ENDPOINTS.biller.analytics.daily}`)
}

// --------------------------------------------------------------------------
// Payment Points (Agents) Services
// --------------------------------------------------------------------------

export async function getPaymentPoints(params?: BillerQueryParams): Promise<PageResponse<PaymentPoint>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())

  const queryString = query.toString()
  return apiFetch<PageResponse<PaymentPoint>>(
    queryString 
      ? `${API_ENDPOINTS.biller.paymentPoints.root}?${queryString}` 
      : API_ENDPOINTS.biller.paymentPoints.root
  )
}

export async function getPaymentPointTransactions(
  pointId: string | number,
  params?: BillerQueryParams
): Promise<PageResponse<Collection>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)

  const queryString = query.toString()
  return apiFetch<PageResponse<Collection>>(
    queryString 
      ? `${API_ENDPOINTS.biller.paymentPoints.transactions(pointId)}?${queryString}` 
      : API_ENDPOINTS.biller.paymentPoints.transactions(pointId)
  )
}

// --------------------------------------------------------------------------
// Products Services
// --------------------------------------------------------------------------

export async function getBillerProducts(): Promise<BillerProduct[]> {
  return apiFetch<BillerProduct[]>(API_ENDPOINTS.biller.products.root)
}

export async function updateBillerProductStatus(
  productId: string | number,
  isActive: boolean
): Promise<{ success: boolean }> {
  return apiFetch(API_ENDPOINTS.biller.products.updateStatus(productId), {
    method: 'PUT',
    body: { isActive },
  })
}

// --------------------------------------------------------------------------
// Settings Services
// --------------------------------------------------------------------------

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return apiFetch<NotificationSettings>(API_ENDPOINTS.biller.settings.notifications)
}

export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  return apiFetch<NotificationSettings>(API_ENDPOINTS.biller.settings.notifications, {
    method: 'PUT',
    body: settings,
  })
}

export async function getSettlementBankDetails(): Promise<{
  bankName: string
  accountNumber: string
  accountName: string
}> {
  return apiFetch(API_ENDPOINTS.biller.settings.settlementBank)
}

export async function updateSettlementBankDetails(details: {
  bankName: string
  accountNumber: string
  accountName: string
}): Promise<{ success: boolean }> {
  return apiFetch(API_ENDPOINTS.biller.settings.settlementBank, {
    method: 'PUT',
    body: details,
  })
}
