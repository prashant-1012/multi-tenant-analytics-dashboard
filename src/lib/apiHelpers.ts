import { seedUsers } from '@/mocks/data/users'
import { seedTenants } from '@/mocks/data/tenants'
import { defaultDateRange } from '@/mocks/data/analytics'
import type { Role } from '@/types/auth'

const ROLE_RANK: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  viewer: 1,
}

export interface RequestContext {
  orgId: string
  userId: string | null
  role: Role
  isSuperAdmin: boolean
}

export function resolveContext(request: Request): RequestContext | null {
  const orgId = request.headers.get('X-Org-Id')
  if (!orgId) return null

  const userId = request.headers.get('X-User-Id')
  const user = userId ? (seedUsers.find((u) => u.id === userId) ?? null) : null

  const isSuper = user?.orgs.some((o) => o.role === 'super_admin') ?? false
  const membership = user?.orgs.find((o) => o.orgId === orgId)
  const role: Role = isSuper ? 'super_admin' : ((membership?.role as Role) ?? 'viewer')

  return { orgId, userId, role, isSuperAdmin: isSuper }
}

export function hasRole(ctx: RequestContext, required: Role): boolean {
  return ROLE_RANK[ctx.role] >= ROLE_RANK[required]
}

export function parseDateRange(url: URL): { from: string; to: string } {
  const defaults = defaultDateRange()
  return {
    from: url.searchParams.get('from') ?? defaults.from,
    to: url.searchParams.get('to') ?? defaults.to,
  }
}

export function isTenantActive(orgId: string): boolean {
  const tenant = seedTenants.find((t) => t.id === orgId)
  return tenant?.isActive ?? false
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const Errors = {
  unauthorized: () => json({ error: 'UNAUTHORIZED', message: 'Authentication required' }, 401),
  forbidden: (message = 'Insufficient role for this operation') =>
    json({ error: 'FORBIDDEN', message }, 403),
  notFound: (resource: string) =>
    json({ error: 'NOT_FOUND', message: `${resource} not found` }, 404),
  conflict: (message: string) => json({ error: 'CONFLICT', message }, 409),
  badRequest: (message: string) => json({ error: 'BAD_REQUEST', message }, 400),
  tenantInactive: () =>
    json({ error: 'TENANT_INACTIVE', message: 'This organization is currently inactive' }, 403),
}
