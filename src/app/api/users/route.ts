import { resolveContext, hasRole, isTenantActive, Errors } from '@/lib/apiHelpers'
import { seedUsers } from '@/mocks/data/users'
import type { Role } from '@/types/auth'
import type { User } from '@/types/api'

const ROLE_RANK: Record<Role, number> = { super_admin: 4, admin: 3, manager: 2, viewer: 1 }
const VALID_ROLES: Role[] = ['viewer', 'manager', 'admin']

export async function GET(request: Request) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
  if (!hasRole(ctx, 'admin')) return Errors.forbidden()

  const users = seedUsers
    .filter((u) => u.orgs.some((o) => o.orgId === ctx.orgId))
    .map((u) => {
      const membership = u.orgs.find((o) => o.orgId === ctx.orgId)!
      return { id: u.id, email: u.email, name: u.name, avatarUrl: u.avatarUrl, role: membership.role, joinedAt: membership.joinedAt }
    })

  return Response.json({ users })
}

export async function POST(request: Request) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
  if (!hasRole(ctx, 'admin')) return Errors.forbidden()

  const body = (await request.json()) as { email?: string; name?: string; role?: string }
  if (!body.email || !body.name || !body.role) return Errors.badRequest('email, name, and role are required')
  if (!VALID_ROLES.includes(body.role as Role)) return Errors.badRequest(`role must be one of: ${VALID_ROLES.join(', ')}`)

  const targetRole = body.role as Role
  if (ROLE_RANK[targetRole] > ROLE_RANK[ctx.role]) return Errors.forbidden('Cannot assign a role higher than your own')

  const existing = seedUsers.find((u) => u.email === body.email && u.orgs.some((o) => o.orgId === ctx.orgId))
  if (existing) return Errors.conflict(`User with email ${body.email} already exists in this org`)

  const now = new Date().toISOString().split('T')[0]
  const newUser: User = {
    id: `user_${Date.now()}`,
    email: body.email,
    name: body.name,
    avatarUrl: null,
    createdAt: now,
    orgs: [{ orgId: ctx.orgId, role: targetRole, joinedAt: now }],
  }
  seedUsers.push(newUser)

  return Response.json(
    { id: newUser.id, email: newUser.email, name: newUser.name, avatarUrl: newUser.avatarUrl, role: targetRole, joinedAt: now },
    { status: 201 }
  )
}
