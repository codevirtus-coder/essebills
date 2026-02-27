// ============================================================================
// Users Service - Based on API spec
// ============================================================================

import { apiFetch, toQueryString } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type { User, CreateUserCommand, UpdateUserCommand, PageResponse } from '../types'

// --------------------------------------------------------------------------
// Query Parameters
// --------------------------------------------------------------------------

export interface UserQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  search?: string
}

// --------------------------------------------------------------------------
// Users CRUD
// --------------------------------------------------------------------------

/** Get paginated users */
export async function getUsers(params?: UserQueryParams): Promise<PageResponse<User>> {
  const query = params ? toQueryString(params) : ''
  return apiFetch<PageResponse<User>>(`${API_ENDPOINTS.users.root}${query}`)
}

/** Get user by ID */
export async function getUserById(userId: string | number): Promise<User> {
  return apiFetch<User>(API_ENDPOINTS.users.byId(userId))
}

/** Get all users (non-paginated) */
export async function getAllUsers(): Promise<User[]> {
  return apiFetch<User[]>(API_ENDPOINTS.users.all)
}

/** Create a new user */
export async function createUser(user: CreateUserCommand): Promise<User> {
  return apiFetch<User>(API_ENDPOINTS.users.root, {
    method: 'POST',
    body: user,
  })
}

/** Update existing user */
export async function updateUser(userId: string | number, user: UpdateUserCommand): Promise<User> {
  return apiFetch<User>(API_ENDPOINTS.users.byId(userId), {
    method: 'PUT',
    body: user,
  })
}

/** Change user activation status */
export async function changeUserStatus(
  userId: string | number,
  status: boolean
): Promise<User> {
  return apiFetch<User>(`${API_ENDPOINTS.users.byId(userId)}?status=${status}`, {
    method: 'PATCH',
  })
}

/** Enable/disable OTP for user */
export async function setUserOtpEnabled(
  userId: string | number,
  enabled: boolean
): Promise<User> {
  return apiFetch<User>(`${API_ENDPOINTS.users.otpEnabled(userId)}?enabled=${enabled}`, {
    method: 'PATCH',
  })
}

// --------------------------------------------------------------------------
// Groups
// --------------------------------------------------------------------------

/** Get all groups */
export async function getGroups(): Promise<Array<{ id: number; name: string }>> {
  return apiFetch(API_ENDPOINTS.groups.root)
}

/** Get all groups (non-paginated) */
export async function getAllGroups(): Promise<Array<{ id: number; name: string }>> {
  return apiFetch(API_ENDPOINTS.groups.all)
}

/** Get group by ID */
export async function getGroupById(groupId: string | number): Promise<{ id: number; name: string }> {
  return apiFetch(API_ENDPOINTS.groups.byId(groupId))
}

/** Create a new group */
export async function createGroup(payload: { name: string }): Promise<{ id: number; name: string }> {
  return apiFetch(API_ENDPOINTS.groups.root, {
    method: 'POST',
    body: payload,
  })
}

/** Update group */
export async function updateGroup(
  groupId: string | number,
  payload: { name: string }
): Promise<{ id: number; name: string }> {
  return apiFetch(API_ENDPOINTS.groups.byId(groupId), {
    method: 'PUT',
    body: payload,
  })
}

/** Delete group */
export async function deleteGroup(groupId: string | number): Promise<void> {
  return apiFetch(API_ENDPOINTS.groups.byId(groupId), {
    method: 'DELETE',
  })
}
