import { apiFetch } from '../../../api/apiClient'

export interface EsebillsConfig {
  esolutionsIntegrationDetailsId?: number
  password: string
  vendorNumber: string
  username: string
  vendorTerminalId: string
  merchantName: string
  accountNumber: string
  productName: string
  currencyCode: string
  apiVersion: string
  active?: boolean
  createdDate?: string
  lastModifiedDate?: string
}

export async function getAllEsebills(): Promise<EsebillsConfig[]> {
  return apiFetch<EsebillsConfig[]>('/v1/esolutions')
}

export async function createEsebillsConfig(
  payload: Omit<EsebillsConfig, 'esolutionsIntegrationDetailsId' | 'createdDate' | 'lastModifiedDate'>,
): Promise<EsebillsConfig> {
  return apiFetch<EsebillsConfig>('/v1/esolutions', {
    method: 'POST',
    body: payload,
  })
}

export async function updateEsebillsConfig(
  id: number,
  payload: Partial<EsebillsConfig>,
): Promise<EsebillsConfig> {
  return apiFetch<EsebillsConfig>(`/v1/esolutions/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteEsebillsConfig(id: number): Promise<void> {
  return apiFetch(`/v1/esolutions/${id}`, {
    method: 'DELETE',
  })
}
