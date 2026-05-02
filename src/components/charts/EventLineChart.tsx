'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { EventSeries } from '@/types/analytics'
import { formatDate, formatNumber } from '@/lib/utils'

interface Props {
  events: EventSeries[]
}

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6']

export function EventLineChart({ events }: Props) {
  // Merge all series into one dataset keyed by date
  const dateMap = new Map<string, Record<string, number>>()
  events.forEach((evt) => {
    evt.series.forEach(({ date, value }) => {
      if (!dateMap.has(date)) dateMap.set(date, { date } as unknown as Record<string, number>)
      dateMap.get(date)![evt.eventName] = value
    })
  })
  const chartData = Array.from(dateMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  )

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
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
          formatter={(v, name) => [formatNumber(Number(v)), String(name)]}
          labelFormatter={(l) => formatDate(String(l))}
          contentStyle={{ fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {events.map((evt, i) => (
          <Line
            key={evt.eventId}
            type="monotone"
            dataKey={evt.eventName}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
