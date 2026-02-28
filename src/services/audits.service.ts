// ============================================================================
// Audits Service - Based on API spec /v1/audits and /v1/my-audits
// ============================================================================

import { apiFetch, toQueryString } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type { PageResponse } from '../types'

type UnknownRecord = Record<string, unknown>

export interface AuditQueryParams {
  page?: number
  size?: number
  search?: string
  [key: string]: unknown
}

export interface MyAuditQueryParams {
  page?: number
  size?: number
  fromDate?: string
  toDate?: string
  [key: string]: unknown
}

export interface PerformerAuditQueryParams {
  page?: number
  size?: number
  fromDate?: string
  toDate?: string
  performerId?: string | number
  [key: string]: unknown
}

// --------------------------------------------------------------------------
// Audit Queries
// --------------------------------------------------------------------------

/** Get paginated audit log */
export async function getAudits(params?: AuditQueryParams): Promise<PageResponse<UnknownRecord>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch(`${API_ENDPOINTS.audits.root}${query}`)
}

/** Get a single audit entry by ID */
export async function getAuditById(id: string | number): Promise<UnknownRecord> {
  return apiFetch(API_ENDPOINTS.audits.byId(id))
}

/** Get audit entries performed by the current user within a date range */
export async function getMyAudits(params?: MyAuditQueryParams): Promise<PageResponse<UnknownRecord>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch(`${API_ENDPOINTS.audits.myAudits}${query}`)
}

/** Get audit entries by performer within a date range */
export async function getAuditsByPerformerPeriod(params?: PerformerAuditQueryParams): Promise<PageResponse<UnknownRecord>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch(`${API_ENDPOINTS.audits.byPerformerPeriod}${query}`)
}
