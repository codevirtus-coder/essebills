import type { AdminCountryDto, AdminCurrencyDto } from '../dto/admin-api.dto'
import { adminJsonFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

export async function getAllCountries() {
  return adminJsonFetch<AdminCountryDto[]>(ADMIN_ENDPOINTS.countries.all)
}

export async function getAllCurrencies() {
  return adminJsonFetch<AdminCurrencyDto[]>(ADMIN_ENDPOINTS.currencies.all)
}
