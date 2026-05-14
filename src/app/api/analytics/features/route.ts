import { resolveContext, hasRole, parseDateRange, isTenantActive, Errors } from '@/lib/apiHelpers'
import { generateFeatures } from '@/mocks/data/analytics'

export async function GET(request: Request) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
  if (!hasRole(ctx, 'viewer')) return Errors.forbidden()

  const url = new URL(request.url)
  const { from, to } = parseDateRange(url)
  const category = url.searchParams.get('category') ?? null

  let features = generateFeatures(ctx.orgId, from, to)
  if (category) features = features.filter((f) => f.category === category)

  return Response.json({ features })
}
