import { resolveContext, hasRole, isTenantActive, Errors } from '@/lib/apiHelpers'
import { seedUsers } from '@/mocks/data/users'
import type { Role } from '@/types/auth'

const ROLE_RANK: Record<Role, number> = { super_admin: 4, admin: 3, manager: 2, viewer: 1 }
const VALID_ROLES: Role[] = ['viewer', 'manager', 'admin']

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
  if (!hasRole(ctx, 'admin')) return Errors.forbidden()

  const { userId } = await params
  if (userId === ctx.userId) return Errors.forbidden('You cannot change your own role')

  const user = seedUsers.find((u) => u.id === userId)
  if (!user) return Errors.notFound(`User '${userId}'`)

  const membership = user.orgs.find((o) => o.orgId === ctx.orgId)
  if (!membership) return Errors.notFound(`User '${userId}' in this org`)

  const body = (await request.json()) as { role?: string }
  if (!body.role || !VALID_ROLES.includes(body.role as Role)) return Errors.badRequest(`role must be one of: ${VALID_ROLES.join(', ')}`)

  const targetRole = body.role as Role
  if (ROLE_RANK[targetRole] > ROLE_RANK[ctx.role]) return Errors.forbidden('Cannot assign a role equal to or higher than your own')

  membership.role = targetRole

  return Response.json({ id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: targetRole, joinedAt: membership.joinedAt })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
  if (!hasRole(ctx, 'admin')) return Errors.forbidden()

  const { userId } = await params
  if (userId === ctx.userId) return Errors.forbidden('You cannot remove yourself from the org')

  const userIdx = seedUsers.findIndex((u) => u.id === userId && u.orgs.some((o) => o.orgId === ctx.orgId))
  if (userIdx === -1) return Errors.notFound(`User '${userId}' in this org`)

  seedUsers[userIdx].orgs = seedUsers[userIdx].orgs.filter((o) => o.orgId !== ctx.orgId)

  return new Response(null, { status: 204 })
}
