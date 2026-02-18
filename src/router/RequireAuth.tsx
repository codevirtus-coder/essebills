import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../features/auth/auth.storage'

type RequireAuthProps = {
  redirectTo: string
}

export function RequireAuth({ redirectTo }: RequireAuthProps) {
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
