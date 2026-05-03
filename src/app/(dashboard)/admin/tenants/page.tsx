'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTenants, useToggleTenant } from '@/hooks/useTenants'
import { formatDate } from '@/lib/utils'
import { PowerOff, Power, ChevronDown, ChevronRight } from 'lucide-react'
import type { TenantWithCount } from '@/hooks/useTenants'

const PLAN_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  enterprise: 'default',
  pro: 'secondary',
  starter: 'outline',
}

function TenantDetailRow({ tenant }: { tenant: TenantWithCount }) {
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/30">
      <TableCell colSpan={6} className="px-6 py-4">
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3 lg:grid-cols-5 text-sm">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Slug</p>
            <p className="font-mono">{tenant.slug}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Plan</p>
            <Badge variant={PLAN_VARIANT[tenant.plan] ?? 'outline'} className="capitalize">
              {tenant.plan}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Members</p>
            <p>{tenant.userCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Created</p>
            <p>{formatDate(tenant.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Primary colour</p>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-sm border"
                style={{ backgroundColor: tenant.primaryColor }}
              />
              <span className="font-mono text-xs">{tenant.primaryColor}</span>
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function TenantsPage() {
  const { data, isLoading } = useTenants()
  const toggleTenant = useToggleTenant()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tenants</h2>
        <p className="text-muted-foreground text-sm">
          Manage all organisations on the platform (super admin only)
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Organisation</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground text-center py-8">
                  No tenants found
                </TableCell>
              </TableRow>
            ) : (
              data?.tenants.map((t) => (
                <>
                  <TableRow
                    key={t.id}
                    className={`cursor-pointer ${!t.isActive ? 'opacity-60' : ''}`}
                    onClick={() => toggleExpand(t.id)}
                  >
                    <TableCell className="pr-0">
                      {expandedId === t.id
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 shrink-0 rounded-sm flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: t.primaryColor }}
                        >
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{t.name}</p>
                          <p className="text-muted-foreground text-xs font-mono">{t.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={PLAN_VARIANT[t.plan] ?? 'outline'} className="capitalize">
                        {t.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">{t.userCount}</TableCell>
                    <TableCell>
                      <Badge variant={t.isActive ? 'default' : 'secondary'}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={toggleTenant.isPending}
                        onClick={() =>
                          toggleTenant.mutate({ tenantId: t.id, isActive: !t.isActive })
                        }
                      >
                        {t.isActive ? (
                          <><PowerOff className="h-3.5 w-3.5" /> Deactivate</>
                        ) : (
                          <><Power className="h-3.5 w-3.5" /> Activate</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === t.id && <TenantDetailRow key={`${t.id}-detail`} tenant={t} />}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
