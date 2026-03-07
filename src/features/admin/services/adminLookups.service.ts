import type { AdminCountryDto, AdminCurrencyDto, PageDto, QueryFilters } from '../dto/admin-api.dto'
import { adminJsonFetch, adminVoidFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

// Currencies
export async function getPaginatedCurrencies(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<AdminCurrencyDto>>(ADMIN_ENDPOINTS.currencies.root, { filters })
}

export async function createCurrency(payload: AdminCurrencyDto) {
  return adminJsonFetch<AdminCurrencyDto>(ADMIN_ENDPOINTS.currencies.root, {
    method: 'POST',
    body: payload,
  })
}

export async function updateCurrency(currencyId: string | number, payload: AdminCurrencyDto) {
  return adminJsonFetch<AdminCurrencyDto>(ADMIN_ENDPOINTS.currencies.byId(currencyId), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteCurrency(currencyId: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.currencies.byId(currencyId), { method: 'DELETE' })
}

// Countries
export async function getPaginatedCountries(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<AdminCountryDto>>(ADMIN_ENDPOINTS.countries.root, { filters })
}

export async function createCountry(payload: AdminCountryDto) {
  return adminJsonFetch<AdminCountryDto>(ADMIN_ENDPOINTS.countries.root, {
    method: 'POST',
    body: payload,
  })
}

export async function updateCountry(id: string | number, payload: AdminCountryDto) {
  return adminJsonFetch<AdminCountryDto>(ADMIN_ENDPOINTS.countries.byId(id), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteCountry(id: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.countries.byId(id), { method: 'DELETE' })
}

// Country-Currency
export async function createCountryCurrency(payload: { countryCode: string; currencyCode: string }) {
  return adminJsonFetch<Record<string, unknown>>(ADMIN_ENDPOINTS.countryCurrencies.root, {
    method: 'POST',
    body: payload,
  })
}
