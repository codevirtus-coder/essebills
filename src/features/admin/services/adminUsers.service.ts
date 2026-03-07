import type { AdminUserDto, PageDto, QueryFilters } from '../dto/admin-api.dto'
import { adminJsonFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

export async function getUserById(userId: string | number) {
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.byId(userId))
}

export async function getPaginatedUsers(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<AdminUserDto>>(ADMIN_ENDPOINTS.users.root, { filters })
}

export async function createUser(user: AdminUserDto) {
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.root, {
    method: 'POST',
    body: user,
  })
}

export async function updateMyProfile(user: AdminUserDto) {
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.myAccount, {
    method: 'POST',
    body: user,
  })
}

export async function updateUser(user: AdminUserDto) {
  if (!user.id) throw new Error('Cannot update user without id')
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.byId(user.id), {
    method: 'PUT',
    body: user,
  })
}

// Spec: PATCH /v1/users/{userId}?status=boolean
export async function changeUserActivationStatus(status: boolean, userId: string | number) {
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.byId(userId), {
    method: 'PATCH',
    filters: { status },
  })
}

// Spec: PATCH /v1/users/{userId}?enabled=boolean
export async function changeUserEnabledStatus(enabled: boolean, userId: string | number) {
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.byId(userId), {
    method: 'PATCH',
    filters: { enabled },
  })
}

// Spec: PATCH /v1/users/{userId} - update multiple fields at once
export async function patchUser(userId: string | number, updates: Partial<AdminUserDto>) {
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.byId(userId), {
    method: 'PATCH',
    body: updates,
  })
}
