import { http, HttpResponse } from 'msw'
import { resolveContext, hasRole, parseDateRange, isTenantActive, Errors } from '../helpers'
import { generateKpis, generateFeatures, generateEvents } from '../data/analytics'

type MetricKey = 'dau' | 'mau' | 'revenue' | 'conversions' | 'features'

const VALID_METRICS: MetricKey[] = ['dau', 'mau', 'revenue', 'conversions', 'features']

// ─── CSV builder (no external library in MSW — just string construction) ───────
function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v)
    return s.includes(',') ? `"${s}"` : s
  }
  const lines = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))]
  return lines.join('\n')
}

export const reportsHandlers = [
  // ── GET /api/reports/export ──────────────────────────────────────────────────
  http.get('/api/reports/export', ({ request }) => {
    const ctx = resolveContext(request)
    if (!ctx) return Errors.unauthorized()
    if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
    if (!hasRole(ctx, 'manager')) return Errors.forbidden()

    const url = new URL(request.url)
    const { from, to } = parseDateRange(url)
    const rawMetrics = url.searchParams.get('metrics') ?? ''

    if (!rawMetrics) {
      return Errors.badRequest('metrics query param is required')
    }

    const requested = rawMetrics.split(',').map((m) => m.trim()) as MetricKey[]
    const invalid = requested.filter((m) => !VALID_METRICS.includes(m))
    if (invalid.length > 0) {
      return Errors.badRequest(
        `Unknown metric(s): ${invalid.join(', ')}. Valid: ${VALID_METRICS.join(', ')}`
      )
    }

    const kpis = generateKpis(ctx.orgId, from, to)
    const features = generateFeatures(ctx.orgId, from, to)
    const events = generateEvents(ctx.orgId, from, to)

    // Build rows: one row per day
    const days = kpis.dau.map((d) => d.date)

    const headers = ['date', ...requested]
    const rows = days.map((date, i) => {
      const row: (string | number)[] = [date]

      for (const metric of requested) {
        switch (metric) {
          case 'dau':
            row.push(kpis.dau[i]?.value ?? 0)
            break
          case 'mau':
            row.push(i === days.length - 1 ? kpis.mau : '')
            break
          case 'revenue':
            row.push(i === days.length - 1 ? kpis.revenue : '')
            break
          case 'conversions':
            row.push(i === days.length - 1 ? kpis.conversions : '')
            break
          case 'features':
            row.push(features.length)
            break
        }
      }

      return row
    })

    const csv = buildCsv(headers, rows)
    const filename = `report-${ctx.orgId}-${from}.csv`

    return new HttpResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }),
]
