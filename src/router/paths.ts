import type { UserRole } from '../features/auth/dto/auth.dto'

export const ROUTE_PATHS = {
  home: '/',
  services: '/services',
  biller: '/biller',
  agent: '/agent',
  admin: '/admin',
  buyer: '/buyer',
  loginBiller: '/login/biller',
  loginAgent: '/login/agent',
  loginAdmin: '/login/admin',
  login: '/login',
  register: '/register',
  registerAgent: '/register/agent',
  registerBiller: '/register/biller',
  registerAdmin: '/register/admin',
  unauthorized: '/unauthorized',
} as const

export function getDashboardRouteByRole(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return ROUTE_PATHS.admin
    case 'AGENT':
      return ROUTE_PATHS.agent
    case 'BILLER':
      return ROUTE_PATHS.biller
    case 'BUYER':
      return ROUTE_PATHS.home
    default:
      return ROUTE_PATHS.home
  }
}
