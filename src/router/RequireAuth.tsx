import { Navigate, Outlet } from 'react-router-dom'
import { getAuthSession } from '../features/auth/auth.storage'
import type { UserRole } from '../features/auth/dto/auth.dto'
import { ROUTE_PATHS } from './paths'

type RequireAuthProps = {
  redirectTo: string
  allowedRoles?: UserRole[]
}

export function RequireAuth({ redirectTo, allowedRoles }: RequireAuthProps) {
  const session = getAuthSession()

  if (!session) {
    return <Navigate to={redirectTo} replace />
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to={ROUTE_PATHS.unauthorized} replace />
  }

  return <Outlet />
}
