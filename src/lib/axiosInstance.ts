import axios, { AxiosError } from 'axios'
import { store } from '@/lib/store'
import type { ApiError } from '@/types/api'

/**
 * Central HTTP client for all API calls.
 *
 * Request interceptor  → injects X-Org-Id + X-User-Id from Redux on every request
 * Response interceptor → normalises errors to ApiError; redirects 401 to /login
 */
export const axiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ─── Request interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const state = store.getState()
  const orgId = state.tenant.activeOrgId
  const userId = state.auth.userId

  if (orgId) config.headers['X-Org-Id'] = orgId
  if (userId) config.headers['X-User-Id'] = userId

  return config
})

// ─── Response interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status
    const data = error.response?.data

    if (status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login'
      return Promise.reject(error)
    }

    const apiError: ApiError = {
      message: data?.message ?? error.message ?? 'An unexpected error occurred',
      code: data?.error ?? 'UNKNOWN_ERROR',
      status: status ?? 0,
    }

    return Promise.reject(apiError)
  }
)
