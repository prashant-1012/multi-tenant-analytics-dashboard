import type {
  KpiSummary,
  FeatureUsage,
  EventSeries,
  DrillDownData,
  MetricPoint,
} from '@/types/analytics'

// ─── Seeded PRNG (Park-Miller LCG) ───────────────────────────────────────────
// Deterministic: same seed always produces the same sequence.
function makeRng(seed: number) {
  let s = Math.abs(seed) % 2_147_483_646 || 1
  return {
    next(): number {
      s = (s * 16_807) % 2_147_483_647
      return (s - 1) / 2_147_483_646
    },
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min
    },
    float(min: number, max: number): number {
      return this.next() * (max - min) + min
    },
  }
}

function hashOrgId(orgId: string): number {
  let h = 0
  for (let i = 0; i < orgId.length; i++) {
    h = Math.imul(31, h) + orgId.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

// ─── Org-level scale config ───────────────────────────────────────────────────
const ORG_SCALE: Record<string, { dauBase: number; revenueBase: number }> = {
  org_001: { dauBase: 320, revenueBase: 42_000 },
  org_002: { dauBase: 130, revenueBase: 15_000 },
  org_003: { dauBase: 48,  revenueBase: 3_200  },
}

function getScale(orgId: string) {
  return ORG_SCALE[orgId] ?? { dauBase: 100, revenueBase: 10_000 }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function eachDay(from: string, to: string): string[] {
  const days: string[] = []
  const cur = new Date(from)
  const end = new Date(to)
  while (cur <= end) {
    days.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export function defaultDateRange() {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 29)
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  }
}

// ─── KPI generator ───────────────────────────────────────────────────────────
export function generateKpis(orgId: string, from: string, to: string): KpiSummary {
  const rng = makeRng(hashOrgId(orgId + from))
  const scale = getScale(orgId)
  const days = eachDay(from, to)

  const dauSeries: MetricPoint[] = days.map((date) => ({
    date,
    value: Math.round(scale.dauBase * rng.float(0.75, 1.25)),
  }))

  const dauCurrent = dauSeries[dauSeries.length - 1]?.value ?? 0
  const dauGrowth = parseFloat((rng.float(-8, 20)).toFixed(1))
  const mau = Math.round(dauCurrent * rng.float(8, 12))
  const mauGrowth = parseFloat((rng.float(-5, 18)).toFixed(1))
  const revenue = Math.round(scale.revenueBase * rng.float(0.9, 1.1))
  const revenueGrowth = parseFloat((rng.float(-5, 15)).toFixed(1))
  const conversions = rng.int(80, 300)
  const conversionRate = parseFloat((rng.float(2, 8)).toFixed(1))
  const conversionRateGrowth = parseFloat((rng.float(-3, 12)).toFixed(1))
  const activeFeatures = rng.int(6, 12)

  return {
    orgId,
    period: { from, to },
    dau: dauSeries,
    dauCurrent,
    dauGrowth,
    mau,
    mauGrowth,
    revenue,
    revenueGrowth,
    conversions,
    conversionRate,
    conversionRateGrowth,
    activeFeatures,
  }
}

// ─── Feature usage generator ──────────────────────────────────────────────────
const FEATURE_DEFINITIONS = [
  { featureId: 'feat_dashboard',    featureName: 'Dashboard View',    category: 'core'      },
  { featureId: 'feat_analytics',    featureName: 'Analytics',         category: 'core'      },
  { featureId: 'feat_export',       featureName: 'CSV Export',        category: 'reporting' },
  { featureId: 'feat_reports',      featureName: 'Reports',           category: 'reporting' },
  { featureId: 'feat_user_mgmt',    featureName: 'User Management',   category: 'admin'     },
  { featureId: 'feat_api_access',   featureName: 'API Access',        category: 'developer' },
  { featureId: 'feat_event_track',  featureName: 'Event Tracking',    category: 'developer' },
  { featureId: 'feat_drilldown',    featureName: 'Drill-Down',        category: 'core'      },
]

export function generateFeatures(orgId: string, from: string, to: string): FeatureUsage[] {
  const rng = makeRng(hashOrgId(orgId + 'features'))
  const scale = getScale(orgId)
  const days = eachDay(from, to)

  return FEATURE_DEFINITIONS.map((def) => {
    const usageCount = rng.int(
      Math.round(scale.dauBase * 2),
      Math.round(scale.dauBase * 8)
    )
    const uniqueUsers = rng.int(
      Math.round(scale.dauBase * 0.3),
      Math.round(scale.dauBase * 0.9)
    )
    const trend: MetricPoint[] = days.map((date) => ({
      date,
      value: rng.int(Math.round(scale.dauBase * 0.05), Math.round(scale.dauBase * 0.3)),
    }))

    return { ...def, usageCount, uniqueUsers, trend }
  }).sort((a, b) => b.usageCount - a.usageCount)
}

// ─── Event series generator ───────────────────────────────────────────────────
const EVENT_DEFINITIONS = [
  { eventId: 'evt_page_view',        eventName: 'page_view'        },
  { eventId: 'evt_button_click',     eventName: 'button_click'     },
  { eventId: 'evt_feature_used',     eventName: 'feature_used'     },
  { eventId: 'evt_export_triggered', eventName: 'export_triggered' },
  { eventId: 'evt_login',            eventName: 'login'            },
  { eventId: 'evt_logout',           eventName: 'logout'           },
]

export function generateEvents(orgId: string, from: string, to: string): EventSeries[] {
  const rng = makeRng(hashOrgId(orgId + 'events'))
  const scale = getScale(orgId)
  const days = eachDay(from, to)

  return EVENT_DEFINITIONS.map((def) => {
    const count = rng.int(scale.dauBase * 2, scale.dauBase * 20)
    const uniqueUsers = rng.int(
      Math.round(scale.dauBase * 0.2),
      Math.round(scale.dauBase * 0.8)
    )
    const series: MetricPoint[] = days.map((date) => ({
      date,
      value: rng.int(
        Math.round(scale.dauBase * 0.1),
        Math.round(scale.dauBase * 0.6)
      ),
    }))

    return { ...def, orgId, count, uniqueUsers, series }
  })
}

// ─── Drill-down generator ─────────────────────────────────────────────────────
import { seedUsers } from './users'

// Combined lookup: events + features both resolve to DrillDownData
const ALL_DRILLDOWN_DEFS: { id: string; name: string }[] = [
  ...EVENT_DEFINITIONS.map((e) => ({ id: e.eventId, name: e.eventName })),
  ...FEATURE_DEFINITIONS.map((f) => ({ id: f.featureId, name: f.featureName })),
]

export function generateDrillDown(
  orgId: string,
  eventId: string,
  from: string,
  to: string
): DrillDownData | null {
  const def = ALL_DRILLDOWN_DEFS.find((d) => d.id === eventId)
  if (!def) return null
  // keep legacy variable name so the rest of the function is unchanged
  const eventDef = { eventId: def.id, eventName: def.name }

  const rng = makeRng(hashOrgId(orgId + eventId + from))
  const scale = getScale(orgId)
  const days = eachDay(from, to)

  const totalCount = rng.int(scale.dauBase * 3, scale.dauBase * 15)
  const byDay: MetricPoint[] = days.map((date) => ({
    date,
    value: rng.int(
      Math.round(scale.dauBase * 0.05),
      Math.round(scale.dauBase * 0.5)
    ),
  }))

  const orgMembers = seedUsers.filter((u) =>
    u.orgs.some((o) => o.orgId === orgId)
  )

  const byUser = orgMembers.map((u) => ({
    userId: u.id,
    userName: u.name,
    count: rng.int(10, 300),
    lastSeen: new Date(
      Date.now() - rng.int(0, 7) * 86_400_000
    ).toISOString(),
  })).sort((a, b) => b.count - a.count)

  const properties = [
    {
      key: 'platform',
      values: [
        { label: 'web',     count: rng.int(200, 800) },
        { label: 'mobile',  count: rng.int(50, 300)  },
        { label: 'desktop', count: rng.int(20, 150)  },
      ],
    },
    {
      key: 'region',
      values: [
        { label: 'us-east', count: rng.int(100, 500) },
        { label: 'eu-west', count: rng.int(50, 250)  },
        { label: 'ap-south',count: rng.int(20, 120)  },
      ],
    },
  ]

  return {
    eventId,
    eventName: eventDef.eventName,
    orgId,
    period: { from, to },
    totalCount,
    byDay,
    byUser,
    properties,
  }
}
