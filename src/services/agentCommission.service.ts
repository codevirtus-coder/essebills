// ============================================================================
// Agent Commission Service - Based on API spec /v1/admin/agents/{agentId}/commission-rates
// ============================================================================

import { apiFetch } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'

type UnknownRecord = Record<string, unknown>

// --------------------------------------------------------------------------
// Agent Commission Rates
// --------------------------------------------------------------------------

/** Get all commission rates for an agent */
export async function getAgentCommissionRates(agentId: string | number): Promise<UnknownRecord[]> {
  return apiFetch(API_ENDPOINTS.agentCommission.rates(agentId))
}

/** Create a commission rate for an agent */
export async function createAgentCommissionRate(
  agentId: string | number,
  payload: UnknownRecord,
): Promise<UnknownRecord> {
  return apiFetch(API_ENDPOINTS.agentCommission.rates(agentId), {
    method: 'POST',
    body: payload,
  })
}

/** Update an existing commission rate for an agent */
export async function updateAgentCommissionRate(
  agentId: string | number,
  id: string | number,
  payload: UnknownRecord,
): Promise<UnknownRecord> {
  return apiFetch(API_ENDPOINTS.agentCommission.rateById(agentId, id), {
    method: 'PUT',
    body: payload,
  })
}
