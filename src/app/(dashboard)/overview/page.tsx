'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { DauLineChart } from '@/components/charts/DauLineChart'
import { FeatureBarChart } from '@/components/charts/FeatureBarChart'
import { useKpis, useFeatures, presetToRange, type DatePreset } from '@/hooks/useAnalytics'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'

export default function OverviewPage() {
  const [preset, setPreset] = useState<DatePreset>('30d')
  const { from, to } = presetToRange(preset)

  const { data: kpis, isLoading: kpisLoading } = useKpis(from, to)
  const { data: featuresData, isLoading: featuresLoading } = useFeatures(from, to)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground text-sm">Platform KPIs and activity summary</p>
        </div>
        <DateRangePicker value={preset} onChange={setPreset} />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))
        ) : kpis ? (
          <>
            <KpiCard
              title="Daily Active Users"
              value={formatNumber(kpis.dauCurrent)}
              sparkline={kpis.dau}
            />
            <KpiCard
              title="Monthly Active Users"
              value={formatNumber(kpis.mau)}
            />
            <KpiCard
              title="Revenue"
              value={formatCurrency(kpis.revenue)}
              change={kpis.revenueGrowth}
            />
            <KpiCard
              title="Conversion Rate"
              value={formatPercent(kpis.conversionRate)}
            />
          </>
        ) : null}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Active Users Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {kpisLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : kpis ? (
              <DauLineChart data={kpis.dau} />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Features by Usage</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {featuresLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : featuresData ? (
              <FeatureBarChart data={featuresData.features} />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
