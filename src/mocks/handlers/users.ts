import { http, HttpResponse } from 'msw'
import { resolveContext, hasRole, isTenantActive, Errors } from '../helpers'
import { seedUsers } from '../data/users'
import type { Role } from '@/types/auth'
import type { User } from '@/types/api'

const ROLE_RANK: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  viewer: 1,
}

const VALID_ROLES: Role[] = ['viewer', 'manager', 'admin']

export const usersHandlers = [
  // ── GET /api/users ───────────────────────────────────────────────────────────
  http.get('/api/users', ({ request }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
    if (!hasRole(ctx, 'admin')) return Errors.forbidden()

    const orgUsers = seedUsers
      .filter((u) => u.orgs.some((o) => o.orgId === ctx.orgId))
      .map((u) => {
        const membership = u.orgs.find((o) => o.orgId === ctx.orgId)!
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          avatarUrl: u.avatarUrl,
          role: membership.role,
          joinedAt: membership.joinedAt,
        }
      })

    return HttpResponse.json({ users: orgUsers })
  }),

  // ── POST /api/users ──────────────────────────────────────────────────────────
  http.post('/api/users', async ({ request }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
    if (!hasRole(ctx, 'admin')) return Errors.forbidden()

    const body = (await request.json()) as { email?: string; name?: string; role?: string }

    if (!body.email || !body.name || !body.role) {
      return Errors.badRequest('email, name, and role are required')
    }
    if (!VALID_ROLES.includes(body.role as Role)) {
      return Errors.badRequest(`role must be one of: ${VALID_ROLES.join(', ')}`)
    }

    const targetRole = body.role as Role

    // Requestor cannot assign a role higher than their own
    if (ROLE_RANK[targetRole] > ROLE_RANK[ctx.role]) {
      return Errors.forbidden('Cannot assign a role higher than your own')
    }

    // Duplicate email within org
    const existing = seedUsers.find(
      (u) => u.email === body.email && u.orgs.some((o) => o.orgId === ctx.orgId)
    )
    if (existing) {
      return Errors.conflict(`User with email ${body.email} already exists in this org`)
    }

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

    return HttpResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        role: targetRole,
        joinedAt: now,
      },
      { status: 201 }
    )
  }),

  // ── PUT /api/users/:userId ───────────────────────────────────────────────────
  http.put('/api/users/:userId', async ({ request, params }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
    if (!hasRole(ctx, 'admin')) return Errors.forbidden()

    const userId = params.userId as string

    // Cannot modify yourself
    if (userId === ctx.userId) {
      return Errors.forbidden('You cannot change your own role')
    }

    const user = seedUsers.find((u) => u.id === userId)
    if (!user) return Errors.notFound(`User '${userId}'`)

    const membership = user.orgs.find((o) => o.orgId === ctx.orgId)
    if (!membership) return Errors.notFound(`User '${userId}' in this org`)

    const body = (await request.json()) as { role?: string }
    if (!body.role || !VALID_ROLES.includes(body.role as Role)) {
      return Errors.badRequest(`role must be one of: ${VALID_ROLES.join(', ')}`)
    }

    const targetRole = body.role as Role
    if (ROLE_RANK[targetRole] > ROLE_RANK[ctx.role]) {
      return Errors.forbidden('Cannot assign a role equal to or higher than your own')
    }

    // Mutate in-memory store
    membership.role = targetRole

    return HttpResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: targetRole,
      joinedAt: membership.joinedAt,
    })
  }),

  // ── DELETE /api/users/:userId ────────────────────────────────────────────────
  http.delete('/api/users/:userId', ({ request, params }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
    if (!hasRole(ctx, 'admin')) return Errors.forbidden()

    const userId = params.userId as string

    if (userId === ctx.userId) {
      return Errors.forbidden('You cannot remove yourself from the org')
    }

    const userIdx = seedUsers.findIndex(
      (u) => u.id === userId && u.orgs.some((o) => o.orgId === ctx.orgId)
    )
    if (userIdx === -1) return Errors.notFound(`User '${userId}' in this org`)

    // Remove org membership (don't delete the user globally)
    const user = seedUsers[userIdx]
    user.orgs = user.orgs.filter((o) => o.orgId !== ctx.orgId)

    return new HttpResponse(null, { status: 204 })
  }),
]
