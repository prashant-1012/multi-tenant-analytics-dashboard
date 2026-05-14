import { resolveContext, hasRole, parseDateRange, isTenantActive, Errors } from '@/lib/apiHelpers'
import { generateKpis } from '@/mocks/data/analytics'

export async function GET(request: Request) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
  if (!hasRole(ctx, 'viewer')) return Errors.forbidden()

  const { from, to } = parseDateRange(new URL(request.url))
  return Response.json(generateKpis(ctx.orgId, from, to))
}
