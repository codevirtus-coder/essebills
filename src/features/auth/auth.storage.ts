import secureLocalStorage from 'react-secure-storage'
import type {
  AuthProvider,
  AuthSession,
  PendingOtpChallenge,
  UserRole,
  UserGroup,
  UserProfileDto,
} from './dto/auth.dto'

const SESSION_KEY = 'auth_session_v1'
const OTP_CHALLENGE_KEY = 'auth_otp_challenge_v1'
const AUTH_CHANGE_EVENT = 'auth-change'
const DEFAULT_SESSION_TTL_MS = 8 * 60 * 60 * 1000

type JwtPayload = {
  exp?: number
  role?: string
  roles?: string[]
  authorities?: string[]
}

function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

function isUserRole(value: string): value is UserRole {
  return value === 'BILLER' || value === 'AGENT' || value === 'ADMIN' || value === 'BUYER'
}

function isUserGroup(value: string): value is UserGroup {
  return value === 'BILLER' || value === 'AGENT' || value === 'ADMIN' || value === 'CUSTOMER'
}

function normalizeRole(value?: string): UserRole | null {
  if (!value) return null

  const upper = value.toUpperCase()
  if (upper.includes('ADMIN')) return 'ADMIN'
  if (upper.includes('AGENT')) return 'AGENT'
  if (upper.includes('BILLER')) return 'BILLER'
  if (upper.includes('BUYER') || upper.includes('CUSTOMER') || upper.includes('USER')) {
    return 'BUYER'
  }

  return null
}

function mapRoleToGroup(role: UserRole): UserGroup {
  if (role === 'BUYER') return 'CUSTOMER'
  return role
}

function normalizeGroup(value?: string): UserGroup | null {
  if (!value) return null
  const upper = value.toUpperCase()
  if (upper.includes('CUSTOMER') || upper.includes('BUYER') || upper.includes('USER')) return 'CUSTOMER'
  if (upper.includes('ADMIN')) return 'ADMIN'
  if (upper.includes('AGENT')) return 'AGENT'
  if (upper.includes('BILLER')) return 'BILLER'
  return null
}

function normalizeProfileGroup(profile?: UserProfileDto): UserGroup | null {
  return normalizeGroup(profile?.group?.name)
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const chunks = token.split('.')
  if (chunks.length < 2) return null

  try {
    const payload = chunks[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')
    const json = window.atob(padded)
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function isSessionValid(session: AuthSession | null): session is AuthSession {
  return Boolean(
    session &&
      session.accessToken &&
      isUserRole(session.role) &&
      isUserGroup(session.group) &&
      Number.isFinite(session.expiresAt) &&
      session.expiresAt > Date.now(),
  )
}

function parseStoredSession(raw: string | null): AuthSession | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

function getStoredString(key: string): string | null {
  const raw = secureLocalStorage.getItem(key)
  if (raw == null) return null
  return typeof raw === 'string' ? raw : String(raw)
}

export function buildAuthSession(
  accessToken: string,
  role: UserRole,
  authProvider: AuthProvider = 'LOCAL',
  options?: { refreshToken?: string | null; profile?: UserProfileDto },
): AuthSession {
  const issuedAt = Date.now()
  const jwtPayload = decodeJwtPayload(accessToken)

  const roleFromJwt = normalizeRole(
    jwtPayload?.role ?? jwtPayload?.roles?.[0] ?? jwtPayload?.authorities?.[0],
  )

  const resolvedRole = roleFromJwt ?? role
  const resolvedGroup = normalizeProfileGroup(options?.profile) ?? mapRoleToGroup(resolvedRole)
  const expiresAt = jwtPayload?.exp ? jwtPayload.exp * 1000 : issuedAt + DEFAULT_SESSION_TTL_MS

  return {
    accessToken,
    refreshToken: options?.refreshToken ?? undefined,
    role: resolvedRole,
    group: resolvedGroup,
    profile: options?.profile,
    authProvider,
    issuedAt,
    expiresAt,
  }
}

export function saveAuthSession(session: AuthSession): void {
  secureLocalStorage.setItem(SESSION_KEY, JSON.stringify(session))
  clearPendingOtpChallenge()
  notifyAuthChanged()
}

export function getAuthSession(): AuthSession | null {
  const parsed = parseStoredSession(getStoredString(SESSION_KEY))

  if (isSessionValid(parsed)) return parsed
  if (parsed) clearAuthSession()
  return null
}

export function clearAuthSession(): void {
  secureLocalStorage.removeItem(SESSION_KEY)
  clearPendingOtpChallenge()
  notifyAuthChanged()
}

export function getAccessToken(): string | null {
  return getAuthSession()?.accessToken ?? null
}

export function getRefreshToken(): string | null {
  return getAuthSession()?.refreshToken ?? null
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthSession())
}

export function hasRole(allowedRoles: UserRole[]): boolean {
  const session = getAuthSession()
  return Boolean(session && allowedRoles.includes(session.role))
}

export function hasGroup(allowedGroups: UserGroup[]): boolean {
  const session = getAuthSession()
  return Boolean(session && allowedGroups.includes(session.group))
}

export function subscribeToAuthChanges(onChange: () => void): () => void {
  const handleStorageEvent = () => onChange()

  window.addEventListener('storage', handleStorageEvent)
  window.addEventListener(AUTH_CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener('storage', handleStorageEvent)
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange)
  }
}

export function savePendingOtpChallenge(challenge: PendingOtpChallenge): void {
  secureLocalStorage.setItem(OTP_CHALLENGE_KEY, JSON.stringify(challenge))
  notifyAuthChanged()
}

export function getPendingOtpChallenge(): PendingOtpChallenge | null {
  const raw = getStoredString(OTP_CHALLENGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PendingOtpChallenge
    if (!parsed.tempToken || !parsed.username) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPendingOtpChallenge(): void {
  secureLocalStorage.removeItem(OTP_CHALLENGE_KEY)
}
