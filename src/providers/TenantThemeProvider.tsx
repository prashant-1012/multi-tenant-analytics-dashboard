'use client'

import { useEffect } from 'react'
import { useAppSelector } from '@/hooks/redux'

const DEFAULT_PRIMARY = '#6366f1' // indigo-500 — fallback brand colour

/**
 * Reads the active org from Redux and injects its brand colour as a CSS
 * custom property on <html>. Runs whenever the active org changes (org switch).
 *
 * --tenant-primary is consumed by Tailwind utilities via the @theme block
 * in globals.css so components can use it with bg-[--tenant-primary].
 */
export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const orgs = useAppSelector((s) => s.tenant.orgs)
  const activeOrgId = useAppSelector((s) => s.tenant.activeOrgId)

  useEffect(() => {
    const org = orgs.find((o) => o.id === activeOrgId)
    const colour = org?.primaryColor ?? DEFAULT_PRIMARY
    document.documentElement.style.setProperty('--tenant-primary', colour)
  }, [activeOrgId, orgs])

  return <>{children}</>
}
