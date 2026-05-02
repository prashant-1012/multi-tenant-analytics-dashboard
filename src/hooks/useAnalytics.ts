import { useQuery } from '@tanstack/react-query'
import { useAppSelector } from './redux'
import { apiFetch } from '@/lib/apiFetch'
import type { KpiSummary, FeatureUsage, EventSeries, DrillDownData } from '@/types/analytics'

export type DatePreset = '7d' | '30d' | '90d'

export function presetToRange(preset: DatePreset): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - (preset === '7d' ? 7 : preset === '30d' ? 30 : 90))
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

export function useKpis(from: string, to: string) {
  const orgId = useAppSelector((s) => s.tenant.activeOrgId)
  return useQuery<KpiSummary>({
    queryKey: ['kpis', orgId, from, to],
    queryFn: () => apiFetch(`/api/analytics/kpis?from=${from}&to=${to}`),
    enabled: !!orgId,
    refetchInterval: 30_000,
  })
}

export function useFeatures(from: string, to: string, category?: string) {
  const orgId = useAppSelector((s) => s.tenant.activeOrgId)
  const catParam = category ? `&category=${encodeURIComponent(category)}` : ''
  return useQuery<{ features: FeatureUsage[] }>({
    queryKey: ['features', orgId, from, to, category],
    queryFn: () => apiFetch(`/api/analytics/features?from=${from}&to=${to}${catParam}`),
    enabled: !!orgId,
  })
}

export function useEvents(from: string, to: string, name?: string) {
  const orgId = useAppSelector((s) => s.tenant.activeOrgId)
  const nameParam = name ? `&name=${encodeURIComponent(name)}` : ''
  return useQuery<{ events: EventSeries[] }>({
    queryKey: ['events', orgId, from, to, name],
    queryFn: () => apiFetch(`/api/analytics/events?from=${from}&to=${to}${nameParam}`),
    enabled: !!orgId,
  })
}

export function useEventDrillDown(eventId: string, from: string, to: string) {
  const orgId = useAppSelector((s) => s.tenant.activeOrgId)
  return useQuery<DrillDownData>({
    queryKey: ['drilldown', orgId, eventId, from, to],
    queryFn: () => apiFetch(`/api/analytics/events/${eventId}?from=${from}&to=${to}`),
    enabled: !!orgId && !!eventId,
  })
}
