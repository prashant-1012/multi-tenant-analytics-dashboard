import { resolveContext, hasRole, Errors } from '@/lib/apiHelpers'
import { seedTenants } from '@/mocks/data/tenants'
import { seedUsers } from '@/mocks/data/users'

export async function GET(request: Request) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!hasRole(ctx, 'super_admin')) return Errors.forbidden()

  const tenants = seedTenants.map((t) => ({
    ...t,
    userCount: seedUsers.filter((u) => u.orgs.some((o) => o.orgId === t.id)).length,
  }))

  return Response.json({ tenants })
}
