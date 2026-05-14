import { resolveContext, hasRole, parseDateRange, isTenantActive, Errors } from '@/lib/apiHelpers'
import { generateKpis, generateFeatures, generateEvents } from '@/mocks/data/analytics'

type MetricKey = 'dau' | 'mau' | 'revenue' | 'conversions' | 'features'
const VALID_METRICS: MetricKey[] = ['dau', 'mau', 'revenue', 'conversions', 'features']

function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v)
    return s.includes(',') ? `"${s}"` : s
  }
  return [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')
}

export async function GET(request: Request) {
  const ctx = resolveContext(request)
  if (!ctx) return Errors.unauthorized()
  if (!isTenantActive(ctx.orgId)) return Errors.tenantInactive()
  if (!hasRole(ctx, 'manager')) return Errors.forbidden()

  const url = new URL(request.url)
  const { from, to } = parseDateRange(url)
  const rawMetrics = url.searchParams.get('metrics') ?? ''
  if (!rawMetrics) return Errors.badRequest('metrics query param is required')

  const requested = rawMetrics.split(',').map((m) => m.trim()) as MetricKey[]
  const invalid = requested.filter((m) => !VALID_METRICS.includes(m))
  if (invalid.length > 0) return Errors.badRequest(`Unknown metric(s): ${invalid.join(', ')}`)

  const kpis = generateKpis(ctx.orgId, from, to)
  const features = generateFeatures(ctx.orgId, from, to)

  const days = kpis.dau.map((d) => d.date)
  const rows = days.map((date, i) => {
    const row: (string | number)[] = [date]
    for (const metric of requested) {
      switch (metric) {
        case 'dau': row.push(kpis.dau[i]?.value ?? 0); break
        case 'mau': row.push(i === days.length - 1 ? kpis.mau : ''); break
        case 'revenue': row.push(i === days.length - 1 ? kpis.revenue : ''); break
        case 'conversions': row.push(i === days.length - 1 ? kpis.conversions : ''); break
        case 'features': row.push(features.length); break
      }
    }
    return row
  })

  const csv = buildCsv(['date', ...requested], rows)
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="report-${ctx.orgId}-${from}.csv"`,
    },
  })
}
