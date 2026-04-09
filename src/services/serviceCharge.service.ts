// ============================================================================
// Service Charge Admin Service - /v1/service-charges
// ============================================================================

import { apiFetch } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'

export interface ServiceCharge {
  id?: number
  userGroup: string
  ratePercent: number
  description?: string
  active: boolean
}

/** Admin: list all configured service charge rates */
export async function getAllServiceCharges(): Promise<ServiceCharge[]> {
  return apiFetch<ServiceCharge[]>(API_ENDPOINTS.serviceCharges.root)
}

/** Admin: create a new service charge rate */
export async function createServiceCharge(payload: Omit<ServiceCharge, 'id'>): Promise<ServiceCharge> {
  return apiFetch<ServiceCharge>(API_ENDPOINTS.serviceCharges.root, {
    method: 'POST',
    body: payload,
  })
}

/** Admin: update an existing service charge rate */
export async function updateServiceCharge(id: number, payload: Omit<ServiceCharge, 'id'>): Promise<ServiceCharge> {
  return apiFetch<ServiceCharge>(API_ENDPOINTS.serviceCharges.byId(id), {
    method: 'PUT',
    body: payload,
  })
}

/** Admin: delete a service charge rate */
export async function deleteServiceCharge(id: number): Promise<void> {
  return apiFetch(API_ENDPOINTS.serviceCharges.byId(id), { method: 'DELETE' })
}

/** Admin: fetch a service charge rate by id */
export async function getServiceChargeById(id: number): Promise<ServiceCharge> {
  return apiFetch<ServiceCharge>(API_ENDPOINTS.serviceCharges.byId(id))
}
