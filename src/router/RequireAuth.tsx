import { Navigate, Outlet } from 'react-router-dom'
import { getAuthSession } from '../features/auth/auth.storage'
import type { UserGroup, UserRole } from '../features/auth/dto/auth.dto'
import { getDashboardRouteByGroup, ROUTE_PATHS } from './paths'

type RequireAuthProps = {
  redirectTo: string
  allowedRoles?: UserRole[]
  allowedGroups?: UserGroup[]
}

function mapRoleToGroup(role: UserRole): UserGroup {
  return role === 'BUYER' ? 'CUSTOMER' : role
}

function isAccountUsable(session: ReturnType<typeof getAuthSession>): boolean {
  if (!session) return false
  if (!session.profile) return true

  return Boolean(
    session.profile.enabled &&
      session.profile.accountNonExpired &&
      session.profile.accountNonLocked &&
      session.profile.credentialsNonExpired,
  )
}

export function RequireAuth({ redirectTo, allowedRoles, allowedGroups }: RequireAuthProps) {
  const session = getAuthSession()

  if (!session) {
    return <Navigate to={redirectTo} replace />
  }

  if (!isAccountUsable(session)) {
    return <Navigate to={ROUTE_PATHS.unauthorized} replace />
  }

  // Check allowedGroups if provided directly
  if (allowedGroups?.length) {
    if (!allowedGroups.includes(session.group)) {
      // Redirect to their own dashboard
      return <Navigate to={getDashboardRouteByGroup(session.group)} replace />
    }
  }
  // Otherwise fall back to allowedRoles if provided
  else if (allowedRoles?.length) {
    const mappedGroups = allowedRoles.map(mapRoleToGroup)
    if (!mappedGroups.includes(session.group)) {
      return <Navigate to={getDashboardRouteByGroup(session.group)} replace />
    }
  }

  return <Outlet />
}
