import { resolveContext, hasRole, parseDateRange, isTenantActive, Errors } from '@/lib/apiHelpers'
import { generateDrillDown } from '@/mocks/data/analytics'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
  if (!hasRole(ctx, 'viewer')) return Errors.forbidden()

  const { eventId } = await params
  const { from, to } = parseDateRange(new URL(request.url))
  const data = generateDrillDown(ctx.orgId, eventId, from, to)

  if (!data) return Errors.notFound(`Event '${eventId}'`)
  return Response.json(data)
}
