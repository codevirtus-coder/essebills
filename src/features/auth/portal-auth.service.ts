import type {
  AuthProvider,
  LoginRequestDto,
  RegisterRequestDto,
  UserGroup,
  UserProfileDto,
  UserRole,
} from './dto/auth.dto'
import { apiFetch, getCurrentUserProfile } from './auth.service'
import {
  buildAuthSession,
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from './auth.storage'

export type PortalLoginSuccess = {
  kind: 'success'
  jwtToken: string
  refreshToken?: string
  authProvider?: AuthProvider
}

export type PortalLoginOtpRequired = {
  kind: 'otp_required'
  tempToken: string
  message?: string
}

export type PortalLoginResult = PortalLoginSuccess | PortalLoginOtpRequired

type GenericAuthResponse = {
  jwtToken?: string
  refreshToken?: string
  authProvider?: AuthProvider
  tempToken?: string
  otpRequired?: boolean
  message?: string
} & Record<string, unknown>

export type CustomerRegisterRequest = Pick<
  RegisterRequestDto,
  'firstName' | 'lastName' | 'username' | 'email' | 'phoneNumber' | 'password' | 'confirmPassword'
>

export type AgentRegisterRequest = CustomerRegisterRequest & {
  shopName: string
  shopLocation?: string
}

export type BillerRegisterRequest = CustomerRegisterRequest & {
  organisationName: string
}

function normalizePortalLoginResult(payload: GenericAuthResponse): PortalLoginResult {
  const jwtToken = typeof payload.jwtToken === 'string' ? payload.jwtToken : undefined
  const refreshToken = typeof payload.refreshToken === 'string' ? payload.refreshToken : undefined
  const authProvider = (payload.authProvider as AuthProvider | undefined) ?? 'LOCAL'

  if (jwtToken) {
    return { kind: 'success', jwtToken, refreshToken, authProvider }
  }

  const otpRequired = payload.otpRequired === true || typeof payload.tempToken === 'string'
  if (otpRequired && typeof payload.tempToken === 'string') {
    return {
      kind: 'otp_required',
      tempToken: payload.tempToken,
      message: typeof payload.message === 'string' ? payload.message : undefined,
    }
  }

  throw new Error('Unexpected authentication response from server')
}

function normalizeProfileGroupName(profile: UserProfileDto): UserGroup {
  const raw = String(profile.group?.name ?? '').toUpperCase()

  if (raw.includes('ADMIN')) return 'ADMIN'
  if (raw.includes('AGENT')) return 'AGENT'
  if (raw.includes('BILLER')) return 'BILLER'
  if (raw.includes('CUSTOMER') || raw.includes('BUYER') || raw.includes('USER')) return 'CUSTOMER'

  throw new Error('Unsupported user group in profile')
}

function assertProfileUsable(profile: UserProfileDto): void {
  if (!profile.enabled) throw new Error('Your account is disabled')
  if (!profile.accountNonLocked) throw new Error('Your account is locked')
  if (!profile.accountNonExpired) throw new Error('Your account has expired')
  if (!profile.credentialsNonExpired) throw new Error('Your credentials have expired')
}

export async function loadCurrentUserProfile(): Promise<UserProfileDto> {
  return getCurrentUserProfile()
}

export async function finalizePortalSession(params: {
  jwtToken: string
  portalRole: UserRole
  refreshToken?: string | null
  authProvider?: AuthProvider
}) {
  const provisionalSession = buildAuthSession(params.jwtToken, params.portalRole, params.authProvider ?? 'LOCAL', {
    refreshToken: params.refreshToken,
  })

  // Save a provisional session so /v1/users/profile can use Authorization header.
  saveAuthSession(provisionalSession)

  try {
    const profile = await loadCurrentUserProfile()
    assertProfileUsable(profile)
    const group = normalizeProfileGroupName(profile)

    const nextSession = buildAuthSession(params.jwtToken, params.portalRole, params.authProvider ?? 'LOCAL', {
      refreshToken: params.refreshToken,
      profile: {
        ...profile,
        group: profile.group
          ? {
              ...profile.group,
              name: group,
            }
          : profile.group,
      },
    })

    saveAuthSession(nextSession)
    return nextSession
  } catch (error) {
    clearAuthSession()
    throw error
  }
}

export async function loginPortal(payload: LoginRequestDto): Promise<PortalLoginResult> {
  const response = await apiFetch<GenericAuthResponse>('/authenticate', {
    method: 'POST',
    body: payload,
  })
  return normalizePortalLoginResult(response)
}

export async function verifyPortalLoginOtp(payload: { tempToken: string; code: string }) {
  return apiFetch<GenericAuthResponse>('/authenticate/verify-otp', {
    method: 'POST',
    body: payload,
  })
}

export async function refreshPortalAccessToken(refreshToken: string) {
  return apiFetch<{ jwtToken?: string; refreshToken?: string }>('/v1/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })
}

export async function refreshPortalSession(role: UserRole) {
  const session = getAuthSession()
  if (!session?.refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await refreshPortalAccessToken(session.refreshToken)
  if (!response.jwtToken) {
    throw new Error('Refresh token response did not return jwtToken')
  }

  return finalizePortalSession({
    jwtToken: response.jwtToken,
    portalRole: role,
    refreshToken: response.refreshToken ?? session.refreshToken,
    authProvider: session.authProvider,
  })
}

export function logoutPortal() {
  clearAuthSession()
}

export async function registerCustomer(payload: CustomerRegisterRequest) {
  return apiFetch<Record<string, unknown>>('/v1/register/customer', {
    method: 'POST',
    body: payload,
  })
}

export async function registerAgent(payload: AgentRegisterRequest) {
  return apiFetch<Record<string, unknown>>('/v1/register/agent', {
    method: 'POST',
    body: payload,
  })
}

export async function registerBiller(payload: BillerRegisterRequest) {
  return apiFetch<Record<string, unknown>>('/v1/register/biller', {
    method: 'POST',
    body: payload,
  })
}

export const loginCustomer = loginPortal
export const loginAgent = loginPortal
export const loginAdmin = loginPortal
export const loginBiller = loginPortal
export const verifyBillerLoginOtp = verifyPortalLoginOtp
export const verifyAgentLoginOtp = verifyPortalLoginOtp
export const verifyAdminLoginOtp = verifyPortalLoginOtp
export const verifyCustomerLoginOtp = verifyPortalLoginOtp
