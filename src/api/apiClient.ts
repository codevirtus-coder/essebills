import axios, { AxiosInstance } from 'axios'
import { getAccessToken } from '../features/auth/auth.storage'

const RAW_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
const API_BASE_URL = RAW_API_BASE_URL ? RAW_API_BASE_URL.replace(/\/+$/, '') : 'http://localhost:52525'

function buildAxiosInstance(baseURL: string): AxiosInstance {
  const instance = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } })

  instance.interceptors.request.use((cfg) => {
    const token = getAccessToken()
    if (token) {
      ;(cfg.headers as any) = { ...(cfg.headers ?? {}), Authorization: `Bearer ${token}` }
    }
    return cfg
  })

  return instance
}

const api = buildAxiosInstance(API_BASE_URL)

function normalizeAxiosError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const response = err.response
    if (response && response.data) {
      const payload = response.data as any
      const message = payload?.description ?? payload?.message ?? `Request failed (${response.status})`
      return new Error(message)
    }
    return new Error(err.message)
  }
  return new Error(String(err))
}

export async function apiFetch<T>(path: string, options?: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; requiresAuth?: boolean }): Promise<T> {
  try {
    const method = (options?.method ?? 'GET').toLowerCase() as any
    const res = await (api as any)[method](path, options?.body)
    return res.data as T
  } catch (err) {
    throw normalizeAxiosError(err)
  }
}

export async function voidFetch(path: string, options?: { method?: string; body?: unknown; requiresAuth?: boolean }): Promise<void> {
  try {
    const method = (options?.method ?? 'GET').toLowerCase() as any
    await (api as any)[method](path, options?.body)
  } catch (err) {
    throw normalizeAxiosError(err)
  }
}

export async function fileFetch(path: string, options?: { requiresAuth?: boolean }): Promise<Blob> {
  try {
    const res = await api.get(path, { responseType: 'blob' })
    return res.data as Blob
  } catch (err) {
    throw normalizeAxiosError(err)
  }
}

export async function fetchWithBase<T>(baseUrl: string, path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  try {
    const instance = buildAxiosInstance(baseUrl)
    const method = (options.method ?? 'GET').toLowerCase() as any
    const res = await (instance as any)[method](path, options.body)
    return res.data as T
  } catch (err) {
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      const payload = err.response.data as any
      const message = payload?.description ?? payload?.message ?? `Request failed (${err.response.status})`
      throw new Error(message)
    }
    throw normalizeAxiosError(err)
  }
}

export { normalizeAxiosError as parseJsonOrThrow }
