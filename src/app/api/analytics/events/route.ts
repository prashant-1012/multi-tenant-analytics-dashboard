import { resolveContext, hasRole, parseDateRange, isTenantActive, Errors } from '@/lib/apiHelpers'
import { generateEvents } from '@/mocks/data/analytics'

export async function GET(request: Request) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
  if (!hasRole(ctx, 'viewer')) return Errors.forbidden()

  const url = new URL(request.url)
  const { from, to } = parseDateRange(url)
  const nameFilter = url.searchParams.get('name')?.toLowerCase() ?? null

  let events = generateEvents(ctx.orgId, from, to)
  if (nameFilter) events = events.filter((e) => e.eventName.toLowerCase().includes(nameFilter))

  return Response.json({ events })
}
