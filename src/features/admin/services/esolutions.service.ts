import { apiFetch } from '../../../api/client'
import { API_ENDPOINTS } from '../../../api/endpoints'

export interface VendorBalanceSummary {
  accountName: string | null
  accountNumber: string | null
  currencyCode: string | null
  balanceUsd: number
  rawVendorBalance: string | null
  responseCode: string
  narrative: string | null
}

export interface EsolutionsCatalogItem {
  id: number
  merchantCode: string
  merchantName: string | null
  productCode: string
  productName: string
  productShortName: string | null
  minimumAmount: number | null
  maximumAmount: number | null
  price: number | null
  serviceId: string | null
  lastSyncedAt: string
  active: boolean
}

export async function getEsolutionsBalance(): Promise<Record<string, VendorBalanceSummary>> {
  return apiFetch<Record<string, VendorBalanceSummary>>(API_ENDPOINTS.esolutionsAdmin.balance)
}

export async function getEsolutionsBalanceBy(param: string): Promise<VendorBalanceSummary> {
  return apiFetch<VendorBalanceSummary>(API_ENDPOINTS.esolutionsAdmin.balanceBy(param))
}

export async function getEsolutionsCatalog(): Promise<EsolutionsCatalogItem[]> {
  return apiFetch<EsolutionsCatalogItem[]>(API_ENDPOINTS.esolutionsAdmin.catalog)
}

export async function getEsolutionsMerchantCatalog(merchantCode: string): Promise<EsolutionsCatalogItem[]> {
  return apiFetch<EsolutionsCatalogItem[]>(API_ENDPOINTS.esolutionsAdmin.catalogByMerchant(merchantCode))
}

export async function triggerEsolutionsSyncAll(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(API_ENDPOINTS.esolutionsAdmin.syncAll, { method: 'POST' })
}

export async function triggerEsolutionsSyncMerchant(merchantCode: string): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(API_ENDPOINTS.esolutionsAdmin.syncMerchant(merchantCode), { method: 'POST' })
}

export interface EsolutionsMerchant {
  id: number
  code: string
  name: string | null
  active: boolean
  createdDate?: string
}

export interface EsolutionsMerchantCommand {
  code: string
  name?: string
  active: boolean
}

export async function getEsolutionsMerchants(): Promise<EsolutionsMerchant[]> {
  return apiFetch<EsolutionsMerchant[]>(API_ENDPOINTS.esolutionsAdmin.merchants)
}

export async function createEsolutionsMerchant(cmd: EsolutionsMerchantCommand): Promise<EsolutionsMerchant> {
  return apiFetch<EsolutionsMerchant>(API_ENDPOINTS.esolutionsAdmin.merchants, { method: 'POST', body: cmd })
}

export async function updateEsolutionsMerchant(id: number, cmd: EsolutionsMerchantCommand): Promise<EsolutionsMerchant> {
  return apiFetch<EsolutionsMerchant>(API_ENDPOINTS.esolutionsAdmin.merchantById(id), { method: 'PUT', body: cmd })
}

export async function deleteEsolutionsMerchant(id: number): Promise<void> {
  return apiFetch<void>(API_ENDPOINTS.esolutionsAdmin.merchantById(id), { method: 'DELETE' })
}
