// ============================================================================
// Integrations Service - Based on API spec
// ============================================================================

import { apiFetch } from '../api/client'
import type {
  PesepayIntegrationDetails,
  EconetEvdIntegrationDetails,
  NetoneEvdIntegrationDetails,
  EsolutionsAirtimeProviderIntegrationDetails,
  ZesaEsolutionsIntegrationDetails,
  CGrateIntegrationDetails,
  PageResponse,
} from '../types'

// --------------------------------------------------------------------------
// Query Parameters
// --------------------------------------------------------------------------

export interface IntegrationQueryParams {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  search?: string
}

// Helper to build query string
function buildQueryString(params?: IntegrationQueryParams): string {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set('page', params.page.toString())
  if (params?.size !== undefined) query.set('size', params.size.toString())
  if (params?.sort) query.set('sort', params.sort)
  if (params?.order) query.set('order', params.order)
  if (params?.search) query.set('search', params.search)
  return query.toString()
}

// --------------------------------------------------------------------------
// Pesepay Integration
// --------------------------------------------------------------------------

/** Get paginated Pesepay integration credentials */
export async function getPesepayIntegrations(params?: IntegrationQueryParams): Promise<PageResponse<PesepayIntegrationDetails>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<PesepayIntegrationDetails>>(
    queryString ? `/v1/pesepay-integration-credentials?${queryString}` : '/v1/pesepay-integration-credentials'
  )
}

/** Get all Pesepay integration credentials */
export async function getAllPesepayIntegrations(): Promise<PesepayIntegrationDetails[]> {
  return apiFetch<PesepayIntegrationDetails[]>('/v1/pesepay-integration-credentials/all')
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

// --------------------------------------------------------------------------
// Econet EVD Integration
// --------------------------------------------------------------------------

/** Get paginated Econet EVD integration credentials */
export async function getEconetEvdIntegrations(params?: IntegrationQueryParams): Promise<PageResponse<EconetEvdIntegrationDetails>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<EconetEvdIntegrationDetails>>(
    queryString ? `/v1/econet-evd-integration-credentials?${queryString}` : '/v1/econet-evd-integration-credentials'
  )
}

/** Get all Econet EVD integration credentials */
export async function getAllEconetEvdIntegrations(): Promise<EconetEvdIntegrationDetails[]> {
  return apiFetch<EconetEvdIntegrationDetails[]>('/v1/econet-evd-integration-credentials/all')
}

/** Get Econet EVD integration by ID */
export async function getEconetEvdIntegrationById(id: string | number): Promise<EconetEvdIntegrationDetails> {
  return apiFetch<EconetEvdIntegrationDetails>(`/v1/econet-evd-integration-credentials/${id}`)
}

/** Create Econet EVD integration */
export async function createEconetEvdIntegration(data: { password: string; username: string; accountTypeCode?: number; accountTypeName?: string }): Promise<EconetEvdIntegrationDetails> {
  return apiFetch<EconetEvdIntegrationDetails>('/v1/econet-evd-integration-credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update Econet EVD integration */
export async function updateEconetEvdIntegration(data: { password: string; username: string; accountTypeCode?: number; accountTypeName?: string; id: number }): Promise<EconetEvdIntegrationDetails> {
  return apiFetch<EconetEvdIntegrationDetails>(`/v1/econet-evd-integration-credentials/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** Delete Econet EVD integration */
export async function deleteEconetEvdIntegration(id: string | number): Promise<void> {
  return apiFetch<void>(`/v1/econet-evd-integration-credentials/${id}`, {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Netone EVD Integration
// --------------------------------------------------------------------------

/** Get paginated Netone EVD integration credentials */
export async function getNetoneEvdIntegrations(params?: IntegrationQueryParams): Promise<PageResponse<NetoneEvdIntegrationDetails>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<NetoneEvdIntegrationDetails>>(
    queryString ? `/v1/netone-evd-integration-credentials?${queryString}` : '/v1/netone-evd-integration-credentials'
  )
}

/** Get all Netone EVD integration credentials */
export async function getAllNetoneEvdIntegrations(): Promise<NetoneEvdIntegrationDetails[]> {
  return apiFetch<NetoneEvdIntegrationDetails[]>('/v1/netone-evd-integration-credentials/all')
}

/** Get Netone EVD integration by ID */
export async function getNetoneEvdIntegrationById(id: string | number): Promise<NetoneEvdIntegrationDetails> {
  return apiFetch<NetoneEvdIntegrationDetails>(`/v1/netone-evd-integration-credentials/${id}`)
}

/** Create Netone EVD integration */
export async function createNetoneEvdIntegration(data: { password: string; username: string }): Promise<NetoneEvdIntegrationDetails> {
  return apiFetch<NetoneEvdIntegrationDetails>('/v1/netone-evd-integration-credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update Netone EVD integration */
export async function updateNetoneEvdIntegration(data: { password: string; username: string; id: number }): Promise<NetoneEvdIntegrationDetails> {
  return apiFetch<NetoneEvdIntegrationDetails>(`/v1/netone-evd-integration-credentials/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** Delete Netone EVD integration */
export async function deleteNetoneEvdIntegration(id: string | number): Promise<void> {
  return apiFetch<void>(`/v1/netone-evd-integration-credentials/${id}`, {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Esolutions Airtime Integration
// --------------------------------------------------------------------------

/** Get paginated Esolutions airtime integration credentials */
export async function getEsolutionsAirtimeIntegrations(params?: IntegrationQueryParams): Promise<PageResponse<EsolutionsAirtimeProviderIntegrationDetails>> {
  const queryString = buildQueryString(params)
  return apiFetch<PageResponse<EsolutionsAirtimeProviderIntegrationDetails>>(
    queryString ? `/v1/esolution-airtime-integration-credentials?${queryString}` : '/v1/esolution-airtime-integration-credentials'
  )
}

/** Get all Esolutions airtime integration credentials */
export async function getAllEsolutionsAirtimeIntegrations(): Promise<EsolutionsAirtimeProviderIntegrationDetails[]> {
  return apiFetch<EsolutionsAirtimeProviderIntegrationDetails[]>('/v1/esolution-airtime-integration-credentials/all')
}

/** Get Esolutions airtime integration by ID */
export async function getEsolutionsAirtimeIntegrationById(id: string | number): Promise<EsolutionsAirtimeProviderIntegrationDetails> {
  return apiFetch<EsolutionsAirtimeProviderIntegrationDetails>(`/v1/esolution-airtime-integration-credentials/${id}`)
}

/** Create Esolutions airtime integration */
export async function createEsolutionsAirtimeIntegration(data: { password: string; serviceId: string; username: string }): Promise<EsolutionsAirtimeProviderIntegrationDetails> {
  return apiFetch<EsolutionsAirtimeProviderIntegrationDetails>('/v1/esolution-airtime-integration-credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update Esolutions airtime integration */
export async function updateEsolutionsAirtimeIntegration(data: { password: string; serviceId: string; username: string; id: number }): Promise<EsolutionsAirtimeProviderIntegrationDetails> {
  return apiFetch<EsolutionsAirtimeProviderIntegrationDetails>(`/v1/esolution-airtime-integration-credentials/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** Delete Esolutions airtime integration */
export async function deleteEsolutionsAirtimeIntegration(id: string | number): Promise<void> {
  return apiFetch<void>(`/v1/esolution-airtime-integration-credentials/${id}`, {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Zesa Esolutions Integration
// --------------------------------------------------------------------------

/** Get Zesa Esolutions integration credentials */
export async function getZesaEsolutionsIntegrations(): Promise<ZesaEsolutionsIntegrationDetails> {
  return apiFetch<ZesaEsolutionsIntegrationDetails>('/v1/zesa-esolutions')
}

/** Create Zesa Esolutions integration */
export async function createZesaEsolutionsIntegration(data: { password: string; vendorNumber: string; username: string; vendorTerminalId: string; merchantName: string; accountNumber: string; productName: string; currencyCode: string }): Promise<ZesaEsolutionsIntegrationDetails> {
  return apiFetch<ZesaEsolutionsIntegrationDetails>('/v1/zesa-esolutions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update Zesa Esolutions integration */
export async function updateZesaEsolutionsIntegration(data: { password: string; vendorNumber: string; username: string; vendorTerminalId: string; merchantName: string; accountNumber: string; productName: string; currencyCode: string; id: number }): Promise<ZesaEsolutionsIntegrationDetails> {
  return apiFetch<ZesaEsolutionsIntegrationDetails>(`/v1/zesa-esolutions/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// --------------------------------------------------------------------------
// CGrate Integration
// --------------------------------------------------------------------------

/** Get CGrate integration credentials */
export async function getCGrateIntegrations(): Promise<CGrateIntegrationDetails> {
  return apiFetch<CGrateIntegrationDetails>('/v1/cgrate/credentials')
}

/** Create CGrate integration */
export async function createCGrateIntegration(data: { password: string; username: string }): Promise<CGrateIntegrationDetails> {
  return apiFetch<CGrateIntegrationDetails>('/v1/cgrate/credentials', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update CGrate integration */
export async function updateCGrateIntegration(data: { password: string; username: string; id: number }): Promise<CGrateIntegrationDetails> {
  return apiFetch<CGrateIntegrationDetails>(`/v1/cgrate/credentials/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
