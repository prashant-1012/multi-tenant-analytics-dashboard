'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { useTenants } from '@/hooks/useTenants'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiFetch'
import { useAppSelector } from '@/hooks/redux'
import { formatDate } from '@/lib/utils'
import type { Role } from '@/types/auth'
import type { OrgUser } from '@/hooks/useUsers'

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function AdminUsersPage() {
  const activeOrgId = useAppSelector((s) => s.tenant.activeOrgId)
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants()
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  // Fetch users for the selected org by temporarily using that org's header
  const targetOrgId = selectedOrgId || activeOrgId || ''
  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: OrgUser[] }>({
    queryKey: ['admin-users', targetOrgId],
    queryFn: () =>
      apiFetch('/api/users', { headers: { 'X-Org-Id': targetOrgId } }),
    enabled: !!targetOrgId,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">All Users</h2>
        <p className="text-muted-foreground text-sm">
          View users across all organisations (super admin only)
        </p>
      </div>

      {/* Org selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Organisation:</span>
        {tenantsLoading ? (
          <Skeleton className="h-9 w-48" />
        ) : (
          <Select
            value={selectedOrgId || activeOrgId || ''}
            onValueChange={(v) => setSelectedOrgId(v ?? '')}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select org" />
            </SelectTrigger>
            <SelectContent>
              {tenantsData?.tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {usersData && (
          <Badge variant="secondary">{usersData.users.length} members</Badge>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : usersData?.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground text-center py-8">
                  No users in this organisation
                </TableCell>
              </TableRow>
            ) : (
              usersData?.users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{getInitials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-muted-foreground text-xs">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><RoleBadge role={u.role as Role} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(u.joinedAt)}
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
