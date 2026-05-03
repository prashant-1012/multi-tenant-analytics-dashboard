import { store } from '@/lib/store'
import type { ApiError } from '@/types/api'

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const state = store.getState()
  const orgId = state.tenant.activeOrgId ?? ''
  const userId = state.auth.userId ?? ''

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Org-Id': orgId,
      'X-User-Id': userId,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'UNKNOWN', message: res.statusText }))
    const apiErr: ApiError = { message: err.message ?? res.statusText, code: err.error ?? err.code ?? 'UNKNOWN', status: res.status }
    throw apiErr
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}
