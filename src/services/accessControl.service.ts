// ============================================================================
// Access Control Service - Based on API spec /v1/access-control/*
// ============================================================================

import { apiFetch, toQueryString } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type { PageResponse } from '../types'

type UnknownRecord = Record<string, unknown>

export interface AuthorityQueryParams {
  page?: number
  size?: number
  search?: string
  [key: string]: unknown
}

// --------------------------------------------------------------------------
// Authorities
// --------------------------------------------------------------------------

/** Get paginated authorities */
export async function getAuthorities(params?: AuthorityQueryParams): Promise<PageResponse<UnknownRecord>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch(`${API_ENDPOINTS.accessControl.authorities.root}${query}`)
}

/** Get all authorities (non-paginated) */
export async function getAllAuthorities(): Promise<UnknownRecord[]> {
  return apiFetch(API_ENDPOINTS.accessControl.authorities.all)
}

// --------------------------------------------------------------------------
// User Authorities
// --------------------------------------------------------------------------

/** Get authorities assigned to a user (paginated) */
export async function getUserAuthorities(
  userId: string | number,
  params?: AuthorityQueryParams,
): Promise<PageResponse<UnknownRecord>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch(`${API_ENDPOINTS.accessControl.userAuthorities.byUser(userId)}${query}`)
}

/** Get all authorities assigned to a user */
export async function getAllUserAuthorities(userId: string | number): Promise<UnknownRecord[]> {
  return apiFetch(API_ENDPOINTS.accessControl.userAuthorities.byUserAll(userId))
}

/** Get authorities NOT yet assigned to a user */
export async function getUnassignedUserAuthorities(userId: string | number): Promise<UnknownRecord[]> {
  return apiFetch(API_ENDPOINTS.accessControl.userAuthorities.unassigned(userId))
}

/** Assign a single authority to a user */
export async function assignUserAuthority(payload: UnknownRecord): Promise<UnknownRecord> {
  return apiFetch(API_ENDPOINTS.accessControl.userAuthorities.root, {
    method: 'POST',
    body: payload,
  })
}

/** Assign a bundle of authorities to a user */
export async function assignBundledUserAuthorities(payload: UnknownRecord): Promise<UnknownRecord> {
  return apiFetch(API_ENDPOINTS.accessControl.userAuthorities.bundled, {
    method: 'POST',
    body: payload,
  })
}

/** Update a bundle of user authority assignments */
export async function updateBundledUserAuthorities(payload: UnknownRecord): Promise<UnknownRecord> {
  return apiFetch(API_ENDPOINTS.accessControl.userAuthorities.bundled, {
    method: 'PATCH',
    body: payload,
  })
}

// --------------------------------------------------------------------------
// Group Authorities
// --------------------------------------------------------------------------

/** Get authorities assigned to a group (paginated) */
export async function getGroupAuthorities(
  groupId: string | number,
  params?: AuthorityQueryParams,
): Promise<PageResponse<UnknownRecord>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch(`${API_ENDPOINTS.accessControl.groupAuthorities.byGroup(groupId)}${query}`)
}

/** Get all authorities assigned to a group */
export async function getAllGroupAuthorities(groupId: string | number): Promise<UnknownRecord[]> {
  return apiFetch(API_ENDPOINTS.accessControl.groupAuthorities.byGroupAll(groupId))
}

/** Get authorities NOT yet assigned to a group */
export async function getUnassignedGroupAuthorities(groupId: string | number): Promise<UnknownRecord[]> {
  return apiFetch(API_ENDPOINTS.accessControl.groupAuthorities.unassigned(groupId))
}

/** Assign a single authority to a group */
export async function assignGroupAuthority(payload: UnknownRecord): Promise<UnknownRecord> {
  return apiFetch(API_ENDPOINTS.accessControl.groupAuthorities.root, {
    method: 'POST',
    body: payload,
  })
}

/** Assign a bundle of authorities to a group */
export async function assignBundledGroupAuthorities(payload: UnknownRecord): Promise<UnknownRecord> {
  return apiFetch(API_ENDPOINTS.accessControl.groupAuthorities.bundled, {
    method: 'POST',
    body: payload,
  })
}

/** Update a bundle of group authority assignments */
export async function updateBundledGroupAuthorities(payload: UnknownRecord): Promise<UnknownRecord> {
  return apiFetch(API_ENDPOINTS.accessControl.groupAuthorities.bundled, {
    method: 'PATCH',
    body: payload,
  })
}
