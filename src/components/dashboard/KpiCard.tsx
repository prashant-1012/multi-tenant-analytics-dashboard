import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SparklineChart } from '@/components/charts/SparklineChart'
import type { MetricPoint } from '@/types/analytics'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  title: string
  value: string
  change?: number
  sparkline?: MetricPoint[]
  className?: string
}

export function KpiCard({ title, value, change, sparkline, className }: Props) {
  const positive = change !== undefined ? change >= 0 : null

  return (
    <Card className={cn('flex flex-col gap-1', className)}>
      <CardHeader className="pb-1">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              positive ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? '+' : ''}
            {change.toFixed(1)}% vs prev period
          </div>
        )}
        {sparkline && sparkline.length > 0 && (
          <SparklineChart
            data={sparkline}
            color={positive === false ? '#ef4444' : '#6366f1'}
            className="mt-3"
          />
        )}
      </CardContent>
    </Card>
  )
}
