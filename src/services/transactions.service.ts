// ============================================================================
// Transactions Service - Based on API spec
// ============================================================================

import { apiFetch } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type { ZesaTransaction, EconetAirtimeTransaction, NetoneAirtimeTransaction, PageResponse } from '../types'

// --------------------------------------------------------------------------
// Query Parameters
// --------------------------------------------------------------------------

export interface TransactionQueryParams {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  search?: string
}

// --------------------------------------------------------------------------
// ZESA Transactions
// --------------------------------------------------------------------------

/** Get paginated ZESA transactions */
export async function getZesaTransactions(params?: TransactionQueryParams): Promise<PageResponse<ZesaTransaction>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.search) query.set('search', params.search)

  const queryString = query.toString()
  return apiFetch<PageResponse<ZesaTransaction>>(
    queryString ? `${API_ENDPOINTS.zesaTransactions.root}?${queryString}` : API_ENDPOINTS.zesaTransactions.root
  )
}

/** Get ZESA transaction by reference number */
export async function getZesaTransactionByReference(referenceNumber: string): Promise<ZesaTransaction> {
  return apiFetch<ZesaTransaction>(
    `${API_ENDPOINTS.zesaTransactions.byReference}?referenceNumber=${encodeURIComponent(referenceNumber)}`
  )
}

/** Retry ZESA transaction */
export async function retryZesaTransaction(transactionId: string | number): Promise<ZesaTransaction> {
  return apiFetch<ZesaTransaction>(API_ENDPOINTS.zesaTransactions.retry(transactionId), {
    method: 'POST',
  })
}

/** Resend ZESA transaction */
export async function resendZesaTransaction(transactionId: string | number): Promise<ZesaTransaction> {
  return apiFetch<ZesaTransaction>(API_ENDPOINTS.zesaTransactions.resend(transactionId), {
    method: 'POST',
  })
}

/** Resend all ZESA transactions */
export async function resendAllZesaTransactions(referenceNumber: string): Promise<ZesaTransaction> {
  return apiFetch<ZesaTransaction>(
    `${API_ENDPOINTS.zesaTransactions.resendAll}?referenceNumber=${encodeURIComponent(referenceNumber)}`,
    {
      method: 'POST',
    }
  )
}

// --------------------------------------------------------------------------
// Econet Airtime Transactions
// --------------------------------------------------------------------------

/** Get paginated Econet airtime transactions */
export async function getEconetAirtimeTransactions(params?: TransactionQueryParams): Promise<PageResponse<EconetAirtimeTransaction>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.search) query.set('search', params.search)

  const queryString = query.toString()
  return apiFetch<PageResponse<EconetAirtimeTransaction>>(
    queryString ? `${API_ENDPOINTS.econetAirtime.root}?${queryString}` : API_ENDPOINTS.econetAirtime.root
  )
}

/** Get Econet airtime transaction by reference number */
export async function getEconetAirtimeTransactionByReference(referenceNumber: string): Promise<EconetAirtimeTransaction> {
  return apiFetch<EconetAirtimeTransaction>(
    `${API_ENDPOINTS.econetAirtime.byReference}?referenceNumber=${encodeURIComponent(referenceNumber)}`
  )
}

// --------------------------------------------------------------------------
// Netone Transactions
// --------------------------------------------------------------------------

/** Get paginated Netone transactions */
export async function getNetoneTransactions(params?: TransactionQueryParams): Promise<PageResponse<NetoneAirtimeTransaction>> {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.search) query.set('search', params.search)

  const queryString = query.toString()
  return apiFetch<PageResponse<NetoneAirtimeTransaction>>(
    queryString ? `${API_ENDPOINTS.netoneTransactions.root}?${queryString}` : API_ENDPOINTS.netoneTransactions.root
  )
}

/** Get Netone transaction by reference number */
export async function getNetoneTransactionByReference(referenceNumber: string): Promise<NetoneAirtimeTransaction> {
  return apiFetch<NetoneAirtimeTransaction>(
    `${API_ENDPOINTS.netoneTransactions.byReference}?referenceNumber=${encodeURIComponent(referenceNumber)}`
  )
}
