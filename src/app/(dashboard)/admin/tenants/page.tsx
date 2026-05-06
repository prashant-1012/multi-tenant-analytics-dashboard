'use client'

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
import { PowerOff, Power } from 'lucide-react'

const PLAN_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  enterprise: 'default',
  pro: 'secondary',
  starter: 'outline',
}

export default function TenantsPage() {
  const { data, isLoading } = useTenants()
  const toggleTenant = useToggleTenant()

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
              <TableHead>Organisation</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Primary colour</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-sm shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-sm" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : data?.tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground text-center py-8">
                  No tenants found
                </TableCell>
              </TableRow>
            ) : (
              data?.tenants.map((t) => (
                <TableRow key={t.id} className={!t.isActive ? 'opacity-60' : ''}>
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
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(t.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-sm border"
                        style={{ backgroundColor: t.primaryColor }}
                      />
                      <span className="font-mono text-xs text-muted-foreground">{t.primaryColor}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.isActive ? 'default' : 'secondary'}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
