// ============================================================================
// Bulk Payments Service - Based on API spec
// ============================================================================

import { apiFetch, toQueryString } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type {
  BulkPaymentGroup,
  CreateBulkPaymentGroupRequest,
  BulkInitiateRequest,
  BulkPaymentRequest,
  BulkPaymentSchedule,
  ScheduleRequest,
} from '../types/bulkPayments'

// --------------------------------------------------------------------------
// Recipient Groups
// --------------------------------------------------------------------------

/** Get all recipient groups for the current user */
export async function getBulkPaymentGroups(): Promise<BulkPaymentGroup[]> {
  return apiFetch<BulkPaymentGroup[]>(API_ENDPOINTS.bulkPayments.groups.root)
}

/** Get a recipient group by ID */
export async function getBulkPaymentGroupById(groupId: string | number): Promise<BulkPaymentGroup> {
  return apiFetch<BulkPaymentGroup>(API_ENDPOINTS.bulkPayments.groups.byId(groupId))
}

/** Create a new recipient group */
export async function createBulkPaymentGroup(group: CreateBulkPaymentGroupRequest): Promise<BulkPaymentGroup> {
  return apiFetch<BulkPaymentGroup>(API_ENDPOINTS.bulkPayments.groups.root, {
    method: 'POST',
    body: group,
  })
}

/** Update an existing recipient group */
export async function updateBulkPaymentGroup(
  groupId: string | number,
  group: Partial<CreateBulkPaymentGroupRequest>
): Promise<BulkPaymentGroup> {
  return apiFetch<BulkPaymentGroup>(API_ENDPOINTS.bulkPayments.groups.byId(groupId), {
    method: 'PUT',
    body: group,
  })
}

/** Delete a recipient group */
export async function deleteBulkPaymentGroup(groupId: string | number): Promise<void> {
  return apiFetch(API_ENDPOINTS.bulkPayments.groups.byId(groupId), {
    method: 'DELETE',
  })
}

// --------------------------------------------------------------------------
// Bulk Execution
// --------------------------------------------------------------------------

/** Initiate a one-off bulk payment */
export async function initiateBulkPayment(request: BulkInitiateRequest): Promise<BulkPaymentRequest> {
  return apiFetch<BulkPaymentRequest>(API_ENDPOINTS.bulkPayments.initiate, {
    method: 'POST',
    body: request,
  })
}

/** Initiate a bulk payment using a saved group */
export async function initiateBulkPaymentFromGroup(
  groupId: string | number,
  name: string
): Promise<BulkPaymentRequest> {
  const query = toQueryString({ name })
  return apiFetch<BulkPaymentRequest>(`${API_ENDPOINTS.bulkPayments.initiateFromGroup(groupId)}${query}`, {
    method: 'POST',
  })
}

/** Get all bulk payment requests for the current user */
export async function getBulkPaymentRequests(): Promise<BulkPaymentRequest[]> {
  return apiFetch<BulkPaymentRequest[]>(API_ENDPOINTS.bulkPayments.requests.root)
}

/** Get a bulk payment request by ID with its items */
export async function getBulkPaymentRequestById(requestId: string | number): Promise<BulkPaymentRequest> {
  return apiFetch<BulkPaymentRequest>(API_ENDPOINTS.bulkPayments.requests.byId(requestId))
}

// --------------------------------------------------------------------------
// Recurring Payments (Schedules)
// --------------------------------------------------------------------------

/** Get all recurring payment schedules */
export async function getBulkPaymentSchedules(): Promise<BulkPaymentSchedule[]> {
  return apiFetch<BulkPaymentSchedule[]>(API_ENDPOINTS.bulkPayments.schedules.root)
}

/** Create a new recurring payment schedule */
export async function createBulkPaymentSchedule(schedule: ScheduleRequest): Promise<BulkPaymentSchedule> {
  return apiFetch<BulkPaymentSchedule>(API_ENDPOINTS.bulkPayments.schedules.root, {
    method: 'POST',
    body: schedule,
  })
}

/** Update an existing recurring payment schedule (e.g., toggle active) */
export async function updateBulkPaymentSchedule(
  scheduleId: string | number,
  schedule: Partial<BulkPaymentSchedule>
): Promise<BulkPaymentSchedule> {
  return apiFetch<BulkPaymentSchedule>(API_ENDPOINTS.bulkPayments.schedules.byId(scheduleId), {
    method: 'PUT',
    body: schedule,
  })
}

/** Delete a recurring payment schedule */
export async function deleteBulkPaymentSchedule(scheduleId: string | number): Promise<void> {
  return apiFetch(API_ENDPOINTS.bulkPayments.schedules.byId(scheduleId), {
    method: 'DELETE',
  })
}
