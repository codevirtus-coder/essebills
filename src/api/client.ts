// ============================================================================
// Enhanced API Client - Based on best practices for axios
// ============================================================================

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ErrorMessage } from '../types'
import { getAccessToken } from '../features/auth/auth.storage'

// --------------------------------------------------------------------------
// Configuration
// --------------------------------------------------------------------------

// Use explicit API base URL when configured; otherwise use same-origin relative requests.
// Strip trailing slashes to avoid `//` when concatenating paths.
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE_URL = RAW_API_BASE_URL ? RAW_API_BASE_URL.replace(/\/+$/, '') : undefined

// --------------------------------------------------------------------------
// Error Handling
// --------------------------------------------------------------------------

/** Normalize axios error to a standard Error object */
export function normalizeAxiosError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const response = err.response
    if (response && response.data) {
      const payload = response.data as ErrorMessage
      const message = payload?.description ?? payload?.message ?? `Request failed (${response.status})`
      return new Error(message)
    }
    if (err.code === 'ECONNABORTED') {
      return new Error('Request timeout - please try again')
    }
    if (!err.response) {
      return new Error('Network error - please check your connection')
    }
    return new Error(err.message)
  }
  return err instanceof Error ? err : new Error(String(err))
}

/** Check if error is a 401 Unauthorized */
export function isUnauthorizedError(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    return err.response?.status === 401
  }
  return false
}

/** Check if error is a 403 Forbidden */
export function isForbiddenError(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    return err.response?.status === 403
  }
  return false
}

/** Check if error is a validation error (400) */
export function isValidationError(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    return err.response?.status === 400
  }
  return false
}

// --------------------------------------------------------------------------
// Axios Instance Creation
// --------------------------------------------------------------------------

function createAxiosInstance(baseURL?: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
  })

  // Request interceptor - add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor - handle common responses
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      // Handle 401 - redirect to login or refresh token
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        // Could emit an event or redirect here
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// Create default instance
const api = createAxiosInstance(API_BASE_URL)

// --------------------------------------------------------------------------
// HTTP Methods
// --------------------------------------------------------------------------

/** Request options for typed API calls */
export interface RequestOptions<T = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: T
  requiresAuth?: boolean
  headers?: Record<string, string>
  timeout?: number
}

/**
 * Fetch with multipart/form-data for file uploads
 */
export async function multipartFetch<T = unknown>(
  path: string,
  formData: FormData,
  options: Omit<RequestOptions, 'body'> = {}
): Promise<T> {
  const { method = 'POST', timeout } = options

  try {
    const config: AxiosRequestConfig = {
      method: method.toLowerCase(),
      url: path,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options.headers,
      },
      timeout,
    }

    const response = await api.request<T>(config)
    return response.data
  } catch (err) {
    throw normalizeAxiosError(err)
  }
}

/**
 * Generic API fetch function with proper typing
 * @param path - API endpoint path
 * @param options - Request options
 * @returns Promise<T> - Response data
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, timeout } = options

  try {
    const config: AxiosRequestConfig = {
      method: method.toLowerCase(),
      url: path,
      data: body,
      timeout,
    }

    const response = await api.request<T>(config)
    return response.data
  } catch (err) {
    throw normalizeAxiosError(err)
  }
}

/**
 * Void fetch - for endpoints that don't return data
 */
export async function voidFetch(
  path: string,
  options: RequestOptions = {}
): Promise<void> {
  await apiFetch(path, options)
}

/**
 * Fetch file/blob response
 */
export async function fileFetch(
  path: string,
  options: RequestOptions = {}
): Promise<Blob> {
  const { method = 'GET', timeout } = options

  try {
    const response = await api.request<Blob>({
      method: method.toLowerCase(),
      url: path,
      responseType: 'blob',
      timeout,
    })
    return response.data
  } catch (err) {
    throw normalizeAxiosError(err)
  }
}

/**
 * Fetch with a different base URL
 */
export async function fetchWithBase<T = unknown>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, timeout } = options
  const instance = createAxiosInstance(baseUrl)

  try {
    const response = await instance.request<T>({
      method: method.toLowerCase(),
      url: path,
      data: body,
      timeout,
    })
    return response.data
  } catch (err) {
    throw normalizeAxiosError(err)
  }
}

// --------------------------------------------------------------------------
// Query String Helpers
// --------------------------------------------------------------------------

/**
 * Convert filters object to query string
 */
export function toQueryString(filters?: Record<string, unknown>): string {
  if (!filters) return ''

  const searchParams = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)))
    } else {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

// --------------------------------------------------------------------------
// Paginated Fetch Helpers
// --------------------------------------------------------------------------

/** Pagination parameters */
export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
  order?: 'ASC' | 'DESC'
  search?: string
}

/**
 * Build query string from pagination params
 */
export function buildPaginationQuery(params: PaginationParams): string {
  const filters: Record<string, unknown> = {}

  if (params.page !== undefined) filters.page = params.page
  if (params.size !== undefined) filters.size = params.size
  if (params.sort) filters.sort = params.sort
  if (params.order) filters.order = params.order
  if (params.search) filters.search = params.search

  return toQueryString(filters)
}

// --------------------------------------------------------------------------
// Instance Export
// --------------------------------------------------------------------------

export { api }
export { createAxiosInstance }

// Re-export axios for advanced use cases
export { axios }
export type { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse }
