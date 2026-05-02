'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ChevronsUpDown, Building2, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppDispatch } from '@/hooks/redux'
import { useCurrentOrg } from '@/hooks/useCurrentOrg'
import { setActiveOrg } from '@/features/tenant/tenantSlice'

export function OrgSwitcher() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { org, activeOrgId, orgs } = useCurrentOrg()

  function switchOrg(orgId: string) {
    if (orgId === activeOrgId) return
    // 1. Update Redux — axiosInstance picks up new X-Org-Id on next request
    dispatch(setActiveOrg(orgId))
    // 2. Invalidate all cached data so every query re-fetches for the new org
    queryClient.invalidateQueries()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-auto w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-white text-xs font-bold"
            style={{ backgroundColor: org?.primaryColor ?? '#6366f1' }}
          >
            {org?.name?.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-none">
              {org?.name ?? 'Select org'}
            </p>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {org?.plan ?? '—'}
            </p>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Your organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgs.map((o) => (
          <DropdownMenuItem
            key={o.id}
            onClick={() => switchOrg(o.id)}
            className="gap-2"
          >
            <div
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-white text-xs font-bold"
              style={{ backgroundColor: o.primaryColor }}
            >
              {o.name.charAt(0)}
            </div>
            <span className="flex-1 truncate">{o.name}</span>
            {o.id === activeOrgId && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        {orgs.length === 0 && (
          <DropdownMenuItem disabled>
            <Building2 className="mr-2 h-4 w-4" />
            No organizations
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
