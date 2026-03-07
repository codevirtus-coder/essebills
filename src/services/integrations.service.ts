// ============================================================================
// Integrations Service - Pesepay only (per API spec)
// ============================================================================

import { apiFetch } from '../api/client'
import type { PesepayIntegrationDetails, PageResponse } from '../types'

export interface IntegrationQueryParams {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  search?: string
}

function buildQueryString(params?: IntegrationQueryParams): string {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.search) query.set('search', params.search)
  return query.toString()
}

/** Get paginated Pesepay integration credentials */
export async function getPesepayIntegrations(params?: IntegrationQueryParams): Promise<PageResponse<PesepayIntegrationDetails>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<PesepayIntegrationDetails>>(
    queryString ? `/v1/pesepay-integration-credentials?${queryString}` : '/v1/pesepay-integration-credentials'
  )
}

/** Get Pesepay integration by ID */
export async function getPesepayIntegrationById(id: string | number): Promise<PesepayIntegrationDetails> {
  return apiFetch<PesepayIntegrationDetails>(`/v1/pesepay-integration-credentials/${id}`)
}

/** Create Pesepay integration */
export async function createPesepayIntegration(data: { encryptionKey: string; integrationKey: string }): Promise<PesepayIntegrationDetails> {
  return apiFetch<PesepayIntegrationDetails>('/v1/pesepay-integration-credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update Pesepay integration */
export async function updatePesepayIntegration(data: { encryptionKey: string; integrationKey: string; id: number }): Promise<PesepayIntegrationDetails> {
  return apiFetch<PesepayIntegrationDetails>(`/v1/pesepay-integration-credentials/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** Delete Pesepay integration */
export async function deletePesepayIntegration(id: string | number): Promise<void> {
  return apiFetch<void>(`/v1/pesepay-integration-credentials/${id}`, {
    method: 'DELETE',
  })
}
