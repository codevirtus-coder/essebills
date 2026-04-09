// ============================================================================
// SMS Service - /v1/sms
// ============================================================================

import { apiFetch, toQueryString } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type { PageResponse } from '../types'

export interface SentSMS {
  id: number
  destination: string
  originator?: string
  messageText: string
  deliveryStatus?: string
  messageDate?: string
  smsReference?: string
  providerReference?: string
  createdDate?: string
}

export interface SmsQueryParams {
  // Match `toQueryString()` expectation
  [key: string]: unknown
  page?: number
  size?: number
  search?: string
}

export async function getSmsLogs(params?: SmsQueryParams): Promise<PageResponse<SentSMS>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch<PageResponse<SentSMS>>(`${API_ENDPOINTS.sms.root}${query}`)
}
