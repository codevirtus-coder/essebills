import { adminJsonFetch, adminVoidFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

type UnknownRecord = Record<string, unknown>

export async function getAllRongekaAccounts() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.rongekaAccounts.all)
}

export async function createRongekaAccount(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.rongekaAccounts.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllZambiaVouchers() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.vouchers.zambiaProducts.all)
}

export async function createZambiaVoucher(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.vouchers.zambiaProducts.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllZimVouchers() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.vouchers.zimProducts.all)
}

export async function createZimVoucher(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.vouchers.zimProducts.root, {
    method: 'POST',
    body: payload,
  })
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

export async function deleteHoliday(id: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.holidays.byId(id), {
    method: 'DELETE',
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

export async function updateCurrency(currencyId: string | number, payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.currencies.byId(currencyId), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteCurrency(currencyId: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.currencies.byId(currencyId), {
    method: 'DELETE',
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

export async function updateCountry(id: string | number, payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.countries.byId(id), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteCountry(id: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.countries.byId(id), {
    method: 'DELETE',
  })
}

export async function updateBank(bankId: string | number, payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.banks.byId(bankId), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteBank(bankId: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.banks.byId(bankId), {
    method: 'DELETE',
  })
}

export async function getAllSmsMessages() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.sms.root)
}

export async function createSmsMessage(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.sms.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllSmsCharges() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.sms.charges)
}

export async function createSmsCharge(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.sms.charges, {
    method: 'POST',
    body: payload,
  })
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

export async function createNetoneBundlePlan(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.netone.bundlePlans.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllNetoneDataBundleTypes() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.netone.dataBundleTypes.all)
}

export async function createNetoneDataBundleType(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.netone.dataBundleTypes.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllPesepayCredentials() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.credentials.pesepay.all)
}

export async function createPesepayCredentials(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.pesepay.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllCgrateCredentials() {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.cgrate.root)
}

export async function createCgrateCredentials(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.cgrate.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllZesaCredentials() {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.zesa.root)
}

export async function createZesaCredentials(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.zesa.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllEconetCredentials() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.econet.credentials.all)
}

export async function createEconetCredentials(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.econet.credentials.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllEsolutionsSmsCredentials() {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.esolutionsSms.root)
}

export async function createEsolutionsSmsCredentials(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.esolutionsSms.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllNetoneEvdCredentials() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.netone.credentials.all)
}

export async function createNetoneEvdCredentials(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.netone.credentials.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllEsolutionsAirtimeCredentials() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.credentials.esolutionsAirtime.all)
}

export async function createEsolutionsAirtimeCredentials(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.credentials.esolutionsAirtime.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllTuitionTransactions() {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.tuition.transactions.all)
}

export async function getAllTuitionInstitutions() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.tuition.institutions.all)
}

export async function createTuitionInstitution(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.tuition.institutions.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllTuitionFeeTypes() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.tuition.feeTypes.all)
}

export async function createTuitionFeeType(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.tuition.feeTypes.root, {
    method: 'POST',
    body: payload,
  })
}

export async function getAllTuitionProcessingFees() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.tuition.processingFees.all)
}

export async function createTuitionProcessingFee(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.tuition.processingFees.root, {
    method: 'POST',
    body: payload,
  })
}
