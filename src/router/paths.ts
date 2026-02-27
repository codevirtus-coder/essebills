import type { UserGroup, UserRole } from '../features/auth/dto/auth.dto'

export const ROUTE_PATHS = {
  home: '/',
  services: '/services',
  checkout: '/checkout',
  biller: '/biller',
  agent: '/agent',
  admin: '/admin',
  portal: '/portal',
  buyer: '/buyer',
  loginBiller: '/login/biller',
  loginAgent: '/login/agent',
  loginAdmin: '/login/admin',
  login: '/login',
  register: '/register',
  registerBuyer: '/register/buyer',
  registerAgent: '/register/agent',
  registerBiller: '/register/biller',
  registerAdmin: '/register/admin',
  forgotPassword: '/forgot-password',
  forgotPasswordBuyer: '/forgot-password/buyer',
  forgotPasswordAgent: '/forgot-password/agent',
  forgotPasswordBiller: '/forgot-password/biller',
  forgotPasswordAdmin: '/forgot-password/admin',
  resetPassword: '/reset-password',
  resetPasswordBuyer: '/reset-password/buyer',
  resetPasswordAgent: '/reset-password/agent',
  resetPasswordBiller: '/reset-password/biller',
  resetPasswordAdmin: '/reset-password/admin',
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

export function getDashboardRouteByGroup(group: UserGroup): string {
  switch (group) {
    case 'ADMIN':
      return ROUTE_PATHS.portal
    case 'AGENT':
      return ROUTE_PATHS.portal
    case 'BILLER':
      return ROUTE_PATHS.portal
    case 'CUSTOMER':
      return ROUTE_PATHS.home
    default:
      return ROUTE_PATHS.home
  }
}

export function getForgotPasswordRouteByRole(role: UserRole | UserGroup): string {
  switch (role) {
    case 'ADMIN':
      return ROUTE_PATHS.forgotPasswordAdmin
    case 'AGENT':
      return ROUTE_PATHS.forgotPasswordAgent
    case 'BILLER':
      return ROUTE_PATHS.forgotPasswordBiller
    case 'BUYER':
    case 'CUSTOMER':
      return ROUTE_PATHS.forgotPasswordBuyer
    default:
      return ROUTE_PATHS.forgotPassword
  }
}

export function getResetPasswordRouteByRole(role: UserRole | UserGroup): string {
  switch (role) {
    case 'ADMIN':
      return ROUTE_PATHS.resetPasswordAdmin
    case 'AGENT':
      return ROUTE_PATHS.resetPasswordAgent
    case 'BILLER':
      return ROUTE_PATHS.resetPasswordBiller
    case 'BUYER':
    case 'CUSTOMER':
      return ROUTE_PATHS.resetPasswordBuyer
    default:
      return ROUTE_PATHS.resetPassword
  }
}
