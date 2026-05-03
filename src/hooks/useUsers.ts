import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppSelector } from './redux'
import { apiFetch } from '@/lib/apiFetch'

export interface OrgUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: string
  joinedAt: string
}

export function useUsers() {
  const orgId = useAppSelector((s) => s.tenant.activeOrgId)
  return useQuery<{ users: OrgUser[] }>({
    queryKey: ['users', orgId],
    queryFn: () => apiFetch('/api/users'),
    enabled: !!orgId,
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  const orgId = useAppSelector((s) => s.tenant.activeOrgId)
  return useMutation({
    mutationFn: (body: { email: string; name: string; role: string }) =>
      apiFetch<OrgUser>('/api/users', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', orgId] }),
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  const orgId = useAppSelector((s) => s.tenant.activeOrgId)
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiFetch<OrgUser>(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify({ role }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', orgId] }),
  })
}

export function useRemoveUser() {
  const queryClient = useQueryClient()
  const orgId = useAppSelector((s) => s.tenant.activeOrgId)
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<void>(`/api/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', orgId] }),
  })
}
