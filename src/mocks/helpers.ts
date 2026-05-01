import { HttpResponse } from 'msw'
import { seedUsers } from './data/users'
import { seedTenants } from './data/tenants'
import { defaultDateRange } from './data/analytics'
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

// ─── Resolve request context from headers ─────────────────────────────────────
export function resolveContext(request: Request): RequestContext | null {
  const orgId = request.headers.get('X-Org-Id')
  if (!orgId) return null

  const userId = request.headers.get('X-User-Id')
  const user = userId ? seedUsers.find((u) => u.id === userId) ?? null : null

  // super_admin membership is global — check across all orgs
  const isSuper = user?.orgs.some((o) => o.role === 'super_admin') ?? false

  // Role for the requested org specifically
  const membership = user?.orgs.find((o) => o.orgId === orgId)
  const role: Role = isSuper ? 'super_admin' : ((membership?.role as Role) ?? 'viewer')

  return { orgId, userId, role, isSuperAdmin: isSuper }
}

// ─── Access checks ─────────────────────────────────────────────────────────────
export function hasRole(ctx: RequestContext, required: Role): boolean {
  return ROLE_RANK[ctx.role] >= ROLE_RANK[required]
}

// ─── Standard error responses ──────────────────────────────────────────────────
export const Errors = {
  unauthorized() {
    return HttpResponse.json(
      { error: 'UNAUTHORIZED', message: 'Authentication required' },
      { status: 401 }
    )
  },
  forbidden(message = 'Insufficient role for this operation') {
    return HttpResponse.json(
      { error: 'FORBIDDEN', message },
      { status: 403 }
    )
  },
  notFound(resource: string) {
    return HttpResponse.json(
      { error: 'NOT_FOUND', message: `${resource} not found` },
      { status: 404 }
    )
  },
  conflict(message: string) {
    return HttpResponse.json(
      { error: 'CONFLICT', message },
      { status: 409 }
    )
  },
  badRequest(message: string) {
    return HttpResponse.json(
      { error: 'BAD_REQUEST', message },
      { status: 400 }
    )
  },
  tenantInactive() {
    return HttpResponse.json(
      { error: 'TENANT_INACTIVE', message: 'This organization is currently inactive' },
      { status: 403 }
    )
  },
}

// ─── Date range parser ────────────────────────────────────────────────────────
export function parseDateRange(url: URL): { from: string; to: string } {
  const defaults = defaultDateRange()
  return {
    from: url.searchParams.get('from') ?? defaults.from,
    to: url.searchParams.get('to') ?? defaults.to,
  }
}

// ─── Tenant active guard ───────────────────────────────────────────────────────
export function isTenantActive(orgId: string): boolean {
  const tenant = seedTenants.find((t) => t.id === orgId)
  return tenant?.isActive ?? false
}
