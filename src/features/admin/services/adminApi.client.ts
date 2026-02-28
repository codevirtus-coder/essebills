import { apiFetch, voidFetch, fileFetch } from '../../../api/apiClient'
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


export async function adminJsonFetch<T>(
  path: string,
  options: JsonRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, filters } = options
  return apiFetch<T>(`${path}${toQueryString(filters)}`, { method, body, requiresAuth: true })
}

export async function adminVoidFetch(
  path: string,
  options: JsonRequestOptions = {},
): Promise<void> {
  const { method = 'GET', body, filters } = options
  return voidFetch(`${path}${toQueryString(filters)}`, { method, body, requiresAuth: true })
}

export async function adminFileFetch(
  path: string,
  filters?: QueryFilters,
): Promise<Blob> {
  return fileFetch(`${path}${toQueryString(filters)}`, { requiresAuth: true })
}

