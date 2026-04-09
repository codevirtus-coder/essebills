import { apiFetch } from '../../../api/client'
import { API_ENDPOINTS } from '../../../api/endpoints'

type UnknownRecord = Record<string, unknown>

export async function getEsolutionsV2Catalog(): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>(API_ENDPOINTS.esolutionsV2.catalog)
}

export async function getEsolutionsV2CatalogByMerchant(merchantCode: string): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>(API_ENDPOINTS.esolutionsV2.catalogByMerchant(merchantCode))
}

export async function getEsolutionsV2ProductsByMerchant(merchantCode: string): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>(API_ENDPOINTS.esolutionsV2.productsByMerchant(merchantCode))
}

export async function postEsolutionsV2Balance(payload: UnknownRecord): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>(API_ENDPOINTS.esolutionsV2.balance, { method: 'POST', body: payload })
}

export async function postEsolutionsV2CatalogSync(merchantCode: string): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>(API_ENDPOINTS.esolutionsV2.catalogSync(merchantCode), { method: 'POST' })
}

export async function postEsolutionsV2Resend(payload: UnknownRecord): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>(API_ENDPOINTS.esolutionsV2.resend, { method: 'POST', body: payload })
}

export async function postEsolutionsV2Transaction(payload: UnknownRecord): Promise<UnknownRecord> {
  return apiFetch<UnknownRecord>(API_ENDPOINTS.esolutionsV2.transaction, { method: 'POST', body: payload })
}

