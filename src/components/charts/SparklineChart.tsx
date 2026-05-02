'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import type { MetricPoint } from '@/types/analytics'

interface Props {
  data: MetricPoint[]
  color?: string
  className?: string
}

export function SparklineChart({ data, color = '#6366f1', className }: Props) {
  return (
    <div className={className} style={{ width: '100%', height: 48 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, padding: '2px 8px' }}
            formatter={(v) => [Number(v), '']}
            labelFormatter={() => ''}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
