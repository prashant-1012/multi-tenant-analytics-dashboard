'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { FeatureUsage } from '@/types/analytics'
import { formatNumber } from '@/lib/utils'

interface Props {
  data: FeatureUsage[]
}

export function FeatureBarChart({ data }: Props) {
  const top5 = [...data].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={top5} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
        <XAxis
          type="number"
          tickFormatter={formatNumber}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="featureName"
          width={110}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(v) => [formatNumber(Number(v)), 'Usage']}
          contentStyle={{ fontSize: 13 }}
        />
        <Bar
          dataKey="usageCount"
          fill="var(--color-tenant-primary, #6366f1)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
