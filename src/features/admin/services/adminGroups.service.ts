import type { AdminGroupDto, PageDto, QueryFilters } from '../dto/admin-api.dto'
import { adminJsonFetch, adminVoidFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

export async function getPaginatedGroups(filters?: QueryFilters) {
  return adminJsonFetch<PageDto<AdminGroupDto>>(ADMIN_ENDPOINTS.groups.root, { filters })
}

export async function createGroup(group: AdminGroupDto) {
  return adminJsonFetch<AdminGroupDto>(ADMIN_ENDPOINTS.groups.root, {
    method: 'POST',
    body: group,
  })
}

export async function getGroup(groupId: string | number) {
  return adminJsonFetch<AdminGroupDto>(ADMIN_ENDPOINTS.groups.byId(groupId))
}

export async function updateGroup(group: AdminGroupDto) {
  if (!group.id) throw new Error('Cannot update group without id')
  return adminJsonFetch<AdminGroupDto>(ADMIN_ENDPOINTS.groups.byId(group.id), {
    method: 'PUT',
    body: group,
  })
}

export async function deleteGroup(groupId: string | number) {
  return adminVoidFetch(ADMIN_ENDPOINTS.groups.byId(groupId), { method: 'DELETE' })
}
