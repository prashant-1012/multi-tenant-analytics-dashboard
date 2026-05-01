import { http, HttpResponse } from 'msw'
import {
  resolveContext,
  hasRole,
  parseDateRange,
  isTenantActive,
  Errors,
} from '../helpers'
import {
  generateKpis,
  generateFeatures,
  generateEvents,
  generateDrillDown,
} from '../data/analytics'

export const analyticsHandlers = [
  // ── GET /api/analytics/kpis ─────────────────────────────────────────────────
  http.get('/api/analytics/kpis', ({ request }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
    if (!hasRole(ctx, 'viewer')) return Errors.forbidden()

    const { from, to } = parseDateRange(new URL(request.url))
    return HttpResponse.json(generateKpis(ctx.orgId, from, to))
  }),

  // ── GET /api/analytics/features ─────────────────────────────────────────────
  http.get('/api/analytics/features', ({ request }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
    if (!hasRole(ctx, 'viewer')) return Errors.forbidden()

    const url = new URL(request.url)
    const { from, to } = parseDateRange(url)
    const category = url.searchParams.get('category') ?? null

    let features = generateFeatures(ctx.orgId, from, to)
    if (category) {
      features = features.filter((f) => f.category === category)
    }

    return HttpResponse.json({ features })
  }),

  // ── GET /api/analytics/events ────────────────────────────────────────────────
  http.get('/api/analytics/events', ({ request }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
    if (!hasRole(ctx, 'viewer')) return Errors.forbidden()

    const url = new URL(request.url)
    const { from, to } = parseDateRange(url)
    const nameFilter = url.searchParams.get('name')?.toLowerCase() ?? null

    let events = generateEvents(ctx.orgId, from, to)
    if (nameFilter) {
      events = events.filter((e) => e.eventName.includes(nameFilter))
    }

    return HttpResponse.json({ events })
  }),

  // ── GET /api/analytics/events/:eventId ──────────────────────────────────────
  http.get('/api/analytics/events/:eventId', ({ request, params }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
    if (!hasRole(ctx, 'viewer')) return Errors.forbidden()

    const { from, to } = parseDateRange(new URL(request.url))
    const data = generateDrillDown(ctx.orgId, params.eventId as string, from, to)

    if (!data) return Errors.notFound(`Event '${params.eventId}'`)
    return HttpResponse.json(data)
  }),
]
