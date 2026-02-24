import type {
  AdminUserDto,
  PageDto,
  QueryFilters,
} from '../dto/admin-api.dto'
import { adminJsonFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

export async function getUserById(userId: string | number) {
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.byId(userId))
}

export async function getPaginatedUsers(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<AdminUserDto>>(ADMIN_ENDPOINTS.users.root, {
    filters,
  })
}

export async function createUser(user: AdminUserDto) {
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.root, {
    method: 'POST',
    body: user,
  })
}

export async function updateMyProfile(user: AdminUserDto) {
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.myAccount, {
    method: 'PUT',
    body: user,
  })
}

export async function updateUser(user: AdminUserDto) {
  if (!user.id) {
    throw new Error('Cannot update user without id')
  }

  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.byId(user.id), {
    method: 'PUT',
    body: user,
  })
}

export async function changeUserActivationStatus(
  activationStatus: boolean,
  userId: string | number,
) {
  return adminJsonFetch<void>(ADMIN_ENDPOINTS.users.status(userId), {
    method: 'PATCH',
    filters: { active: activationStatus },
  })
}

export async function getAllUsers() {
  return adminJsonFetch<AdminUserDto[]>(ADMIN_ENDPOINTS.users.all)
}

export async function getUserProfile() {
  return adminJsonFetch<AdminUserDto>(ADMIN_ENDPOINTS.users.profile)
}
