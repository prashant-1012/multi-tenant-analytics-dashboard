import { resolveContext, hasRole, Errors } from '@/lib/apiHelpers'
import { seedTenants } from '@/mocks/data/tenants'
import { seedUsers } from '@/mocks/data/users'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!hasRole(ctx, 'super_admin')) return Errors.forbidden()

  const { tenantId } = await params
  const tenant = seedTenants.find((t) => t.id === tenantId)
  if (!tenant) return Errors.notFound(`Tenant '${tenantId}'`)

  const userCount = seedUsers.filter((u) => u.orgs.some((o) => o.orgId === tenant.id)).length
  return Response.json({ ...tenant, userCount })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!hasRole(ctx, 'super_admin')) return Errors.forbidden()

  const { tenantId } = await params
  const tenant = seedTenants.find((t) => t.id === tenantId)
  if (!tenant) return Errors.notFound(`Tenant '${tenantId}'`)

  const body = (await request.json()) as Partial<{ isActive: boolean; primaryColor: string }>
  if (typeof body.isActive === 'boolean') tenant.isActive = body.isActive
  if (body.primaryColor) tenant.primaryColor = body.primaryColor

  return Response.json(tenant)
}
