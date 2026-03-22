import type { UserGroup, UserRole } from '../features/auth/dto/auth.dto'

export const ROUTE_PATHS = {
  home: '/',
  services: '/services',
  checkout: '/checkout',
  paymentReturn: '/payment/return',
  biller: '/biller',
  agent: '/agent',
  admin: '/admin',
  portal: '/portal',
  portalAdmin: '/portal-admin',
  portalAgent: '/portal-agent',
  portalBiller: '/portal-biller',
  portalCustomer: '/portal-customer',
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
      return ROUTE_PATHS.portalAdmin
    case 'AGENT':
      return ROUTE_PATHS.portalAgent
    case 'BILLER':
      return ROUTE_PATHS.portalBiller
    case 'BUYER':
      return ROUTE_PATHS.home
    default:
      return ROUTE_PATHS.home
  }
}

export function getDashboardRouteByGroup(group: UserGroup): string {
  switch (group) {
    case 'ADMIN':
      return ROUTE_PATHS.portalAdmin
    case 'AGENT':
      return ROUTE_PATHS.portalAgent
    case 'BILLER':
      return ROUTE_PATHS.portalBiller
    case 'CUSTOMER':
      return ROUTE_PATHS.portalCustomer
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
