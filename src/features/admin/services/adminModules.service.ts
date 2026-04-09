import { adminJsonFetch, adminVoidFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'
import type { PageDto, QueryFilters } from '../dto/admin-api.dto'

type UnknownRecord = Record<string, unknown>

// Banks
export async function getPaginatedBanks(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<UnknownRecord>>(ADMIN_ENDPOINTS.banks.root, { filters })
}

export async function createBank(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.banks.root, { method: 'POST', body: payload })
}

export async function updateBank(bankId: string | number, payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.banks.byId(bankId), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteBank(bankId: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.banks.byId(bankId), { method: 'DELETE' })
}

// Holidays
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
  return adminVoidFetch(ADMIN_ENDPOINTS.holidays.byId(id), { method: 'DELETE' })
}

// EseBills Accounts
export async function getPaginatedEsebillsAccounts(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<UnknownRecord>>(ADMIN_ENDPOINTS.esebillsAccounts.root, { filters })
}

export async function getEsebillsAccountById(accountId: string | number) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.esebillsAccounts.byId(accountId))
}

export async function getDefaultEsebillsAccount() {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.esebillsAccounts.default)
}

export async function searchEsebillsAccount(args: { bank: string; accountNumber: string }) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.esebillsAccounts.search, {
    filters: { bank: args.bank, accountNumber: args.accountNumber },
  })
}

export async function createEsebillsAccount(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.esebillsAccounts.root, {
    method: 'POST',
    body: payload,
  })
}

export async function updateEsebillsAccount(accountId: string | number, payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.esebillsAccounts.byId(accountId), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteEsebillsAccount(accountId: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.esebillsAccounts.byId(accountId), { method: 'DELETE' })
}

// Providers (ESOLUTIONS, ECONET_DIRECT, NETONE_DIRECT, ZESA_DIRECT)
export async function getProviders() {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.providers.root)
}

// Providers (ESOLUTIONS, ECONET_DIRECT, NETONE_DIRECT, ZESA_DIRECT)
export type ProviderCode = 'ESOLUTIONS' | 'ECONET_DIRECT' | 'NETONE_DIRECT' | 'ZESA_DIRECT'

export async function enableProvider(provider: ProviderCode) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.providers.enable(provider), { method: 'POST' })
}

export async function disableProvider(provider: ProviderCode) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.providers.disable(provider), { method: 'POST' })
}

// Pesepay Credentials
export async function getPaginatedPesepayCredentials(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<UnknownRecord>>(ADMIN_ENDPOINTS.pesepayCredentials.root, { filters })
}

export async function createPesepayCredentials(payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.pesepayCredentials.root, {
    method: 'POST',
    body: payload,
  })
}

export async function updatePesepayCredentials(id: string | number, payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.pesepayCredentials.byId(id), {
    method: 'PUT',
    body: payload,
  })
}

export async function deletePesepayCredentials(id: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.pesepayCredentials.byId(id), { method: 'DELETE' })
}

// Agent Commission Rates
export async function getAgentCommissionRates(agentId: string | number) {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.agentCommission.rates(agentId))
}

export async function createAgentCommissionRate(agentId: string | number, payload: UnknownRecord) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.agentCommission.rates(agentId), {
    method: 'POST',
    body: payload,
  })
}

export async function updateAgentCommissionRate(
  agentId: string | number,
  rateId: string | number,
  payload: UnknownRecord,
) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.agentCommission.rateById(agentId, rateId), {
    method: 'PUT',
    body: payload,
  })
}

export async function getAgentCommissionRateById(agentId: string | number, rateId: string | number) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.agentCommission.rateById(agentId, rateId))
}

// WhatsApp (via backend API spec)
export async function getWhatsappSessions(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<UnknownRecord>>(ADMIN_ENDPOINTS.whatsapp.sessions, { filters })
}

export async function getWhatsappMessages(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<UnknownRecord>>(ADMIN_ENDPOINTS.whatsapp.messages, { filters })
}

export async function getWhatsappSessionById(id: string | number) {
  return adminJsonFetch<UnknownRecord>(ADMIN_ENDPOINTS.whatsapp.sessionsById(id))
}

export async function getWhatsappMessagesBySession(sessionId: string | number) {
  return adminJsonFetch<UnknownRecord[]>(ADMIN_ENDPOINTS.whatsapp.messagesBySession(sessionId))
}

export async function getWhatsappMessagesByPhone(phoneNumber: string, filters?: QueryFilters) {
  return adminJsonFetch<PageDto<UnknownRecord>>(ADMIN_ENDPOINTS.whatsapp.messagesByPhone(phoneNumber), { filters })
}
