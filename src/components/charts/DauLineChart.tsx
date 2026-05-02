'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { MetricPoint } from '@/types/analytics'
import { formatDate, formatNumber } from '@/lib/utils'

interface Props {
  data: MetricPoint[]
}

export function DauLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatNumber}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          formatter={(v) => [formatNumber(Number(v)), 'DAU']}
          labelFormatter={(l) => formatDate(String(l))}
          contentStyle={{ fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-tenant-primary, #6366f1)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
