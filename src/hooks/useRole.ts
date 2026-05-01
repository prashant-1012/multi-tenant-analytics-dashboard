import { useSession } from 'next-auth/react'
import { useAppSelector } from './redux'
import type { Role } from '@/types/auth'

const ROLE_RANK: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  viewer: 1,
}

export function useRole() {
  const { data: session } = useSession()
  const activeOrgId = useAppSelector((s) => s.tenant.activeOrgId)

  const membership = session?.user?.orgs?.find((o) => o.orgId === activeOrgId)
  const role: Role = (membership?.role as Role) ?? 'viewer'

  const isSuperAdmin = role === 'super_admin'
  const hasRole = (required: Role) => ROLE_RANK[role] >= ROLE_RANK[required]

  return { role, isSuperAdmin, hasRole }
}
