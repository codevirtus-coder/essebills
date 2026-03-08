// ============================================================================
// Customer Services - Transactions, Payments, Profile
// ============================================================================

import { apiFetch } from '../../../api/apiClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import type { PageResponse } from '../../../types'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface CustomerProfile {
  id: string | number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  preferredCurrency?: string
}

export interface CustomerTransaction {
  id: number
  uid?: string
  transactionDate: string
  amount: number
  productName: string
  productReference: string
  paymentStatus: string
  paymentMethod?: string
}

export interface TransactionStatistics {
  totalSpent: number
  transactionCount: number
  averageTransaction: number
  lastTransactionDate: string
  byMonth: { month: string; amount: number; count: number }[]
  byService: { serviceName: string; amount: number; count: number }[]
}

export interface CustomerProduct {
  id: string | number
  name: string
  category: string
  categoryId: string
  isActive: boolean
}

export interface ProductValidation {
  isValid: boolean
  customerName?: string
  customerAddress?: string
  balance?: number
  message?: string
}

export interface SavedAccount {
  id: string | number
  productId: string | number
  productName: string
  accountReference: string
  accountNickname?: string
  isDefault: boolean
  lastPaymentDate?: string
  lastPaymentAmount?: number
}

export interface QuickPayRequest {
  savedAccountId: string | number
  amount: number
}

export interface PaymentRequest {
  productId: string | number
  accountReference: string
  amount: number
  currency?: string
}

export interface PaymentResponse {
  id: string | number
  status: string
  amount: number
  productName: string
  customerReference: string
  token?: string
  message?: string
  transactionDate: string
}

export interface ProductCategory {
  id: string | number
  name: string
  icon?: string
}

// Query Parameters
export interface CustomerQueryParams {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  fromDate?: string
  toDate?: string
}

// --------------------------------------------------------------------------
// Profile Services
// --------------------------------------------------------------------------

export async function getCustomerProfile(): Promise<CustomerProfile> {
  return apiFetch<CustomerProfile>(API_ENDPOINTS.customer.profile)
}

export async function updateCustomerProfile(profile: Partial<CustomerProfile>): Promise<CustomerProfile> {
  return apiFetch<CustomerProfile>(API_ENDPOINTS.customer.updateProfile, {
    method: 'PUT',
    body: profile,
  })
}

// --------------------------------------------------------------------------
// Transaction Services
// --------------------------------------------------------------------------

export async function getCustomerTransactions(params?: CustomerQueryParams): Promise<PageResponse<CustomerTransaction>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.fromDate) query.set('fromDate', params.fromDate)
  if (params?.toDate) query.set('toDate', params.toDate)

  const queryString = query.toString()
  return apiFetch<PageResponse<CustomerTransaction>>(
    queryString 
      ? `${API_ENDPOINTS.customer.transactions.root}?${queryString}` 
      : API_ENDPOINTS.customer.transactions.root
  )
}

export async function getCustomerTransactionById(id: string | number): Promise<CustomerTransaction> {
  return apiFetch<CustomerTransaction>(API_ENDPOINTS.customer.transactions.byId(id))
}

export async function getCustomerTransactionStatistics(): Promise<TransactionStatistics> {
  return apiFetch<TransactionStatistics>(API_ENDPOINTS.customer.transactions.statistics)
}

// --------------------------------------------------------------------------
// Payment Services
// --------------------------------------------------------------------------

export async function makePayment(payment: PaymentRequest): Promise<PaymentResponse> {
  return apiFetch<PaymentResponse>(API_ENDPOINTS.customer.payments.root, {
    method: 'POST',
    body: payment,
  })
}

export async function getQuickPayAccounts(): Promise<SavedAccount[]> {
  return apiFetch<SavedAccount[]>(API_ENDPOINTS.customer.payments.quickPay)
}

export async function quickPay(quickPayRequest: QuickPayRequest): Promise<PaymentResponse> {
  return apiFetch<PaymentResponse>(API_ENDPOINTS.customer.payments.quickPay, {
    method: 'POST',
    body: quickPayRequest,
  })
}

export async function validatePayment(payment: {
  productId: string | number
  accountReference: string
}): Promise<ProductValidation> {
  return apiFetch<ProductValidation>(API_ENDPOINTS.customer.payments.validate, {
    method: 'POST',
    body: payment,
  })
}

// --------------------------------------------------------------------------
// Products/Services Services
// --------------------------------------------------------------------------

export async function getCustomerProducts(params?: {
  categoryId?: string
}): Promise<CustomerProduct[]> {
  const query = new URLSearchParams()
  if (params?.categoryId) query.set('categoryId', params.categoryId)

  const queryString = query.toString()
  return apiFetch<CustomerProduct[]>(
    queryString 
      ? `${API_ENDPOINTS.customer.products.root}?${queryString}` 
      : API_ENDPOINTS.customer.products.root
  )
}

export async function validateCustomerProduct(
  productId: string | number,
  accountReference: string
): Promise<ProductValidation> {
  return apiFetch<ProductValidation>(API_ENDPOINTS.customer.products.validate(productId))
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  return apiFetch<ProductCategory[]>(API_ENDPOINTS.customer.products.categories)
}

// --------------------------------------------------------------------------
// Saved Accounts Services
// --------------------------------------------------------------------------

export async function getSavedAccounts(): Promise<SavedAccount[]> {
  return apiFetch<SavedAccount[]>(API_ENDPOINTS.customer.savedAccounts.root)
}

export async function saveAccount(account: {
  productId: string | number
  accountReference: string
  accountNickname?: string
  isDefault?: boolean
}): Promise<SavedAccount> {
  return apiFetch<SavedAccount>(API_ENDPOINTS.customer.savedAccounts.root, {
    method: 'POST',
    body: account,
  })
}

export async function updateSavedAccount(
  id: string | number,
  account: {
    accountNickname?: string
    isDefault?: boolean
  }
): Promise<SavedAccount> {
  return apiFetch<SavedAccount>(API_ENDPOINTS.customer.savedAccounts.byId(id), {
    method: 'PUT',
    body: account,
  })
}

export async function deleteSavedAccount(id: string | number): Promise<{ success: boolean }> {
  return apiFetch(API_ENDPOINTS.customer.savedAccounts.byId(id), {
    method: 'DELETE',
  })
}
