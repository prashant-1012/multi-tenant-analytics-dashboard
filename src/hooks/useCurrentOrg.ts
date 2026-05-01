import { useAppSelector } from './redux'

export function useCurrentOrg() {
  const activeOrgId = useAppSelector((s) => s.tenant.activeOrgId)
  const orgs = useAppSelector((s) => s.tenant.orgs)
  const org = orgs.find((o) => o.id === activeOrgId) ?? null
  return { org, activeOrgId, orgs }
}
