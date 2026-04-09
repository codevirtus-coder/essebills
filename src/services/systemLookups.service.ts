// ============================================================================
// System Lookups Service - /system/v1/*
// ============================================================================

import { apiFetch, toQueryString } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type { Bank, Currency } from '../types'

export async function getBankByCode(bankCode: string): Promise<Bank> {
  const query = toQueryString({ bankCode })
  return apiFetch<Bank>(`${API_ENDPOINTS.system.banksByCode}${query}`)
}

export async function getCurrencyByCode(currencyCode: string): Promise<Currency> {
  const query = toQueryString({ currencyCode })
  return apiFetch<Currency>(`${API_ENDPOINTS.system.currenciesByCode}${query}`)
}

