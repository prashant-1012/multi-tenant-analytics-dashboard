'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { useUsers, useInviteUser, useUpdateUserRole, useRemoveUser } from '@/hooks/useUsers'
import { useRole } from '@/hooks/useRole'
import { useSession } from 'next-auth/react'
import { formatDate } from '@/lib/utils'
import { UserPlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Role } from '@/types/auth'

const ASSIGNABLE_ROLES: Role[] = ['viewer', 'manager', 'admin']

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function UsersPage() {
  const { data: session } = useSession()
  const { hasRole } = useRole()
  const { data, isLoading } = useUsers()
  const inviteUser = useInviteUser()
  const updateRole = useUpdateUserRole()
  const removeUser = useRemoveUser()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' as Role })
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const canManage = hasRole('admin')
  const currentUserId = session?.user?.id

  async function handleInvite() {
    setFormError('')
    try {
      await inviteUser.mutateAsync(form)
      setInviteOpen(false)
      setForm({ name: '', email: '', role: 'viewer' })
      toast.success('User invited', { description: `${form.name} has been added to the organisation` })
    } catch (err: unknown) {
      const e = err as { message?: string }
      setFormError(e?.message ?? 'Failed to invite user')
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await removeUser.mutateAsync(deleteTarget.id)
      toast.success('User removed', { description: `${deleteTarget.name} has been removed` })
    } catch (err: unknown) {
      const e = err as { message?: string }
      toast.error('Failed to remove user', { description: e?.message })
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground text-sm">Manage members of this organisation</p>
        </div>
        {canManage && (
          <Button onClick={() => setInviteOpen(true)} size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite user
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {canManage && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: canManage ? 4 : 3 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 4 : 3} className="text-muted-foreground text-center py-8">
                  No users in this organisation
                </TableCell>
              </TableRow>
            ) : (
              data?.users.map((u) => (
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
                  <TableCell>
                    {canManage && u.id !== currentUserId ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer focus-visible:outline-none">
                          <RoleBadge role={u.role as Role} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {ASSIGNABLE_ROLES.map((r) => (
                            <DropdownMenuItem
                              key={r}
                              onClick={() => updateRole.mutate({ userId: u.id, role: r })}
                            >
                              <RoleBadge role={r} />
                              {u.role === r && <span className="text-muted-foreground ml-auto text-xs">current</span>}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <RoleBadge role={u.role as Role} />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(u.joinedAt)}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      {u.id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive h-8 w-8"
                          onClick={() => setDeleteTarget({ id: u.id, name: u.name })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <div className="flex gap-2">
                {ASSIGNABLE_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className="focus-visible:outline-none"
                  >
                    <Badge
                      variant={form.role === r ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                    >
                      {r}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
            {formError && <p className="text-destructive text-sm">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button
              onClick={handleInvite}
              disabled={!form.name || !form.email || inviteUser.isPending}
            >
              {inviteUser.isPending ? 'Inviting…' : 'Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove user</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.name}</strong> from this organisation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={removeUser.isPending}
            >
              {removeUser.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
