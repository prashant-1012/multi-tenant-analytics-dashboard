export interface DateRange {
  from: string
  to: string
}

export interface MetricPoint {
  date: string
  value: number
}

export interface KpiSummary {
  orgId: string
  period: DateRange
  dau: MetricPoint[]
  mau: number
  dauCurrent: number
  dauGrowth: number
  mauGrowth: number
  revenue: number
  revenueGrowth: number
  conversions: number
  conversionRate: number
  conversionRateGrowth: number
  activeFeatures: number
}

export interface FeatureUsage {
  featureId: string
  featureName: string
  usageCount: number
  uniqueUsers: number
  trend: MetricPoint[]
  category: string
}

export interface EventSeries {
  eventId: string
  eventName: string
  orgId: string
  count: number
  uniqueUsers: number
  series: MetricPoint[]
}

export interface UserEventStat {
  userId: string
  userName: string
  count: number
  lastSeen: string
}

export interface EventProperty {
  key: string
  values: { label: string; count: number }[]
}

export interface DrillDownData {
  eventId: string
  eventName: string
  orgId: string
  period: DateRange
  totalCount: number
  byDay: MetricPoint[]
  byUser: UserEventStat[]
  properties: EventProperty[]
}
