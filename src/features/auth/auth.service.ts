import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from './dto/auth.dto'
import { getAuthToken } from './auth.storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.test.rongeka.com'

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const fallbackMessage = `Request failed (${response.status})`
    const payload = await response
      .json()
      .catch(() => null as { message?: string; description?: string } | null)
    const message = payload?.description ?? payload?.message ?? fallbackMessage
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

type ApiFetchOptions = {
  method?: string
  body?: unknown
  requiresAuth?: boolean
}

async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, requiresAuth = false } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (requiresAuth) {
    const token = getAuthToken()

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  return parseJsonOrThrow<T>(response)
}

export async function login(payload: LoginRequestDto): Promise<LoginResponseDto> {
  return apiFetch<LoginResponseDto>('/authenticate', {
    method: 'POST',
    body: payload,
  })
}

export async function register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
  return apiFetch<RegisterResponseDto>('/opn/v1/users/sign-up', {
    method: 'POST',
    body: payload,
  })
}

export { apiFetch }
