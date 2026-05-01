import { http, HttpResponse } from 'msw'
import { resolveContext, hasRole, Errors } from '../helpers'
import { seedTenants } from '../data/tenants'
import { seedUsers } from '../data/users'

export const tenantsHandlers = [
  // ── GET /api/tenants ─────────────────────────────────────────────────────────
  // super_admin only — returns all tenants with user counts
  http.get('/api/tenants', ({ request }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!hasRole(ctx, 'super_admin')) return Errors.forbidden()

    const tenants = seedTenants.map((t) => ({
      ...t,
      userCount: seedUsers.filter((u) => u.orgs.some((o) => o.orgId === t.id))
        .length,
    }))

    return HttpResponse.json({ tenants })
  }),

  // ── GET /api/tenants/:tenantId ────────────────────────────────────────────────
  http.get('/api/tenants/:tenantId', ({ request, params }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!hasRole(ctx, 'super_admin')) return Errors.forbidden()

    const tenant = seedTenants.find((t) => t.id === params.tenantId)
    if (!tenant) return Errors.notFound(`Tenant '${params.tenantId}'`)

    const userCount = seedUsers.filter((u) =>
      u.orgs.some((o) => o.orgId === tenant.id)
    ).length

    return HttpResponse.json({ ...tenant, userCount })
  }),

  // ── PUT /api/tenants/:tenantId ────────────────────────────────────────────────
  // Supports updating isActive (toggle) and primaryColor
  http.put('/api/tenants/:tenantId', async ({ request, params }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!hasRole(ctx, 'super_admin')) return Errors.forbidden()

    const tenant = seedTenants.find((t) => t.id === params.tenantId)
    if (!tenant) return Errors.notFound(`Tenant '${params.tenantId}'`)

    const body = (await request.json()) as Partial<{
      isActive: boolean
      primaryColor: string
    }>

    if (typeof body.isActive === 'boolean') tenant.isActive = body.isActive
    if (body.primaryColor) tenant.primaryColor = body.primaryColor

    return HttpResponse.json(tenant)
  }),
]
