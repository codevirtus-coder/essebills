import type { AuthProvider, AuthSession, UserRole } from './dto/auth.dto'

const SESSION_KEY = 'auth_session_v1'
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

function normalizeRole(value?: string): UserRole | null {
  if (!value) {
    return null
  }

  const upper = value.toUpperCase()

  if (upper.includes('ADMIN')) {
    return 'ADMIN'
  }

  if (upper.includes('AGENT')) {
    return 'AGENT'
  }

  if (upper.includes('BILLER')) {
    return 'BILLER'
  }

  if (upper.includes('BUYER') || upper.includes('CUSTOMER') || upper.includes('USER')) {
    return 'BUYER'
  }

  return null
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const chunks = token.split('.')

  if (chunks.length < 2) {
    return null
  }

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
      Number.isFinite(session.expiresAt) &&
      session.expiresAt > Date.now(),
  )
}

function parseStoredSession(raw: string | null): AuthSession | null {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function buildAuthSession(
  accessToken: string,
  role: UserRole,
  authProvider: AuthProvider = 'LOCAL',
): AuthSession {
  const issuedAt = Date.now()
  const jwtPayload = decodeJwtPayload(accessToken)

  const roleFromJwt = normalizeRole(
    jwtPayload?.role ?? jwtPayload?.roles?.[0] ?? jwtPayload?.authorities?.[0],
  )

  const resolvedRole = roleFromJwt ?? role
  const expiresAt = jwtPayload?.exp ? jwtPayload.exp * 1000 : issuedAt + DEFAULT_SESSION_TTL_MS

  return {
    accessToken,
    role: resolvedRole,
    authProvider,
    issuedAt,
    expiresAt,
  }
}

export function saveAuthSession(session: AuthSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  notifyAuthChanged()
}

export function getAuthSession(): AuthSession | null {
  const parsed = parseStoredSession(window.localStorage.getItem(SESSION_KEY))

  if (isSessionValid(parsed)) {
    return parsed
  }

  if (parsed) {
    clearAuthSession()
  }

  return null
}

export function clearAuthSession(): void {
  window.localStorage.removeItem(SESSION_KEY)
  notifyAuthChanged()
}

export function getAccessToken(): string | null {
  return getAuthSession()?.accessToken ?? null
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthSession())
}

export function hasRole(allowedRoles: UserRole[]): boolean {
  const session = getAuthSession()
  return Boolean(session && allowedRoles.includes(session.role))
}

export function subscribeToAuthChanges(onChange: () => void): () => void {
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === SESSION_KEY) {
      onChange()
    }
  }

  window.addEventListener('storage', handleStorageEvent)
  window.addEventListener(AUTH_CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener('storage', handleStorageEvent)
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange)
  }
}
