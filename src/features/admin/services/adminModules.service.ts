import { adminJsonFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

type UnknownRecord = Record<string, unknown>

export async function getAllRongekaAccounts() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.rongekaAccounts.all)
}

export async function getAllBanks() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.banks.all)
}

export async function createBank(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.banks.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllHolidays() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.holidays.root)
}

export async function createHoliday(date: string) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.holidays.root, {
    method: 'POST',
    body: {},
    filters: { date },
  })
}

export async function getAllParameterCurrencies() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.currencies.all)
}

export async function createCurrency(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.currencies.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllParameterCountries() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.countries.all)
}

export async function createCountry(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.countries.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllSmsMessages() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.sms.root)
}

export async function getAllSmsCharges() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.sms.charges)
}

export async function getAllEconetBundlePlanTypes() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.econet.bundlePlanTypes.all)
}

export async function createEconetBundlePlanType(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.econet.bundlePlanTypes.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllEconetDataBundleTypes() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.econet.dataBundleTypes.all)
}

export async function createEconetDataBundleType(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.econet.dataBundleTypes.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllNetoneBundlePlans() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.netone.bundlePlans.all)
}

export async function getAllNetoneDataBundleTypes() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.netone.dataBundleTypes.all)
}

export async function getAllPesepayCredentials() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.credentials.pesepay.all)
}

export async function getAllCgrateCredentials() {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.cgrate.root)
}

export async function getAllZesaCredentials() {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.zesa.root)
}

export async function getAllEconetCredentials() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.econet.credentials.all)
}

export async function getAllEsolutionsSmsCredentials() {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.esolutionsSms.root)
}

export async function getAllNetoneEvdCredentials() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.netone.credentials.all)
}

export async function getAllEsolutionsAirtimeCredentials() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.credentials.esolutionsAirtime.all)
}
