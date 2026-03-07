// ============================================================================
// Transactions Service - Based on API spec
// ============================================================================

import { apiFetch } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type { ZesaTransaction, EconetAirtimeTransaction, NetoneAirtimeTransaction, PageResponse, PaymentTransaction } from '../types'

// --------------------------------------------------------------------------
// Query Parameters
// --------------------------------------------------------------------------

export interface TransactionQueryParams {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC' | 'asc' | 'desc'
  search?: string
}

function buildQueryString(params?: TransactionQueryParams): string {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order.toUpperCase())
  if (params?.search) query.set('search', params.search)
  return query.toString()
}

// --------------------------------------------------------------------------
// Unified Transactions (Replacing ZESA, Econet, Netone specific endpoints)
// --------------------------------------------------------------------------

/** Get paginated ZESA transactions (filtered from payments) */
export async function getZesaTransactions(params?: TransactionQueryParams): Promise<PageResponse<ZesaTransaction>> {
  const search = params?.search ? `${params.search} ZESA` : 'ZESA'
  const query = buildQueryString({ ...params, search })
  
  return apiFetch<PageResponse<ZesaTransaction>>(
    `${API_ENDPOINTS.payments.root}?${query}`
  )
}

/** Get ZESA transaction by reference number */
export async function getZesaTransactionByReference(referenceNumber: string): Promise<ZesaTransaction> {
  return apiFetch<ZesaTransaction>(
    `${API_ENDPOINTS.payments.root}?search=${encodeURIComponent(referenceNumber)}`
  )
}

/** Retry ZESA transaction - Placeholder as it might be handled differently now */
export async function retryZesaTransaction(_transactionId: string | number): Promise<ZesaTransaction> {
  throw new Error("Retry endpoint refactored. Use unified payment retry if available.")
}

/** Resend ZESA transaction - Placeholder */
export async function resendZesaTransaction(_transactionId: string | number): Promise<ZesaTransaction> {
  throw new Error("Resend endpoint refactored.")
}

/** Resend all ZESA transactions - Placeholder */
export async function resendAllZesaTransactions(_referenceNumber: string): Promise<ZesaTransaction> {
  throw new Error("Resend all endpoint refactored.")
}

// --------------------------------------------------------------------------
// Econet Airtime Transactions
// --------------------------------------------------------------------------

/** Get paginated Econet airtime transactions */
export async function getEconetAirtimeTransactions(params?: TransactionQueryParams): Promise<PageResponse<EconetAirtimeTransaction>> {
  const search = params?.search ? `${params.search} ECONET` : 'ECONET'
  const query = buildQueryString({ ...params, search })

  return apiFetch<PageResponse<EconetAirtimeTransaction>>(
    `${API_ENDPOINTS.payments.root}?${query}`
  )
}

/** Get Econet airtime transaction by reference number */
export async function getEconetAirtimeTransactionByReference(referenceNumber: string): Promise<EconetAirtimeTransaction> {
  return apiFetch<EconetAirtimeTransaction>(
    `${API_ENDPOINTS.payments.root}?search=${encodeURIComponent(referenceNumber)}`
  )
}

// --------------------------------------------------------------------------
// Netone Transactions
// --------------------------------------------------------------------------

/** Get paginated Netone transactions */
export async function getNetoneTransactions(params?: TransactionQueryParams): Promise<PageResponse<NetoneAirtimeTransaction>> {
  const search = params?.search ? `${params.search} NETONE` : 'NETONE'
  const query = buildQueryString({ ...params, search })

  return apiFetch<PageResponse<NetoneAirtimeTransaction>>(
    `${API_ENDPOINTS.payments.root}?${query}`
  )
}

/** Get Netone transaction by reference number */
export async function getNetoneTransactionByReference(referenceNumber: string): Promise<NetoneAirtimeTransaction> {
  return apiFetch<NetoneAirtimeTransaction>(
    `${API_ENDPOINTS.payments.root}?search=${encodeURIComponent(referenceNumber)}`
  )
}

/** Get all payment transactions */
export async function getPaymentTransactions(params?: TransactionQueryParams): Promise<PageResponse<PaymentTransaction>> {
  const query = buildQueryString(params)
  return apiFetch<PageResponse<PaymentTransaction>>(
    query ? `${API_ENDPOINTS.payments.root}?${query}` : API_ENDPOINTS.payments.root
  )
}
