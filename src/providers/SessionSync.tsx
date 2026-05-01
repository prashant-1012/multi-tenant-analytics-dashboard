'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAppDispatch } from '@/hooks/redux'
import { setUserId } from '@/features/auth/authSlice'
import { setActiveOrg, setOrgs } from '@/features/tenant/tenantSlice'
import { seedTenants } from '@/mocks/data/tenants'

/**
 * Renderless component — syncs the NextAuth session into Redux on mount and
 * whenever the session changes (e.g. after an update() call).
 *
 * This is the single source of truth handoff: NextAuth owns auth state,
 * Redux owns the runtime client state derived from it.
 */
export function SessionSync() {
  const { data: session, status } = useSession()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return

    const { id, activeOrgId, orgs } = session.user

    // Populate auth slice so axiosInstance can send X-User-Id
    dispatch(setUserId(id))

    // Populate tenant slice so OrgSwitcher + TenantThemeProvider work
    dispatch(setActiveOrg(activeOrgId))
    const userOrgIds = new Set(orgs.map((o) => o.orgId))
    const userTenants = seedTenants.filter((t) => userOrgIds.has(t.id))
    dispatch(setOrgs(userTenants))
  }, [session, status, dispatch])

  // On sign-out — clear Redux
  useEffect(() => {
    if (status === 'unauthenticated') {
      dispatch(setUserId(null))
    }
  }, [status, dispatch])

  return null
}
