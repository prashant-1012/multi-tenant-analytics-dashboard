import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiFetch'
import type { Tenant } from '@/types/tenant'

export interface TenantWithCount extends Tenant {
  userCount: number
}

export function useTenants() {
  return useQuery<{ tenants: TenantWithCount[] }>({
    queryKey: ['tenants'],
    queryFn: () => apiFetch('/api/tenants'),
  })
}

export function useToggleTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tenantId, isActive }: { tenantId: string; isActive: boolean }) =>
      apiFetch<Tenant>(`/api/tenants/${tenantId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  })
}
