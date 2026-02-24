import { apiFetch } from '../../auth/auth.service'
import { getAccessToken } from '../../auth/auth.storage'
import type { QueryFilters } from '../dto/admin-api.dto'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.test.rongeka.com'

type JsonRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  filters?: QueryFilters
}

function toQueryString(filters?: QueryFilters): string {
  if (!filters) return ''

  const searchParams = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    searchParams.set(key, String(value))
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

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

async function parseBlobOrThrow(response: Response): Promise<Blob> {
  if (!response.ok) {
    const fallbackMessage = `Request failed (${response.status})`
    const payload = await response
      .json()
      .catch(() => null as { message?: string; description?: string } | null)
    const message = payload?.description ?? payload?.message ?? fallbackMessage
    throw new Error(message)
  }

  return response.blob()
}

export async function adminJsonFetch<T>(
  path: string,
  options: JsonRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, filters } = options
  return apiFetch<T>(`${path}${toQueryString(filters)}`, {
    method,
    body,
    requiresAuth: true,
  })
}

export async function adminFileFetch(
  path: string,
  filters?: QueryFilters,
): Promise<Blob> {
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}${path}${toQueryString(filters)}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  return parseBlobOrThrow(response)
}

export { parseJsonOrThrow }
