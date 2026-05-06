import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  height?: number
  type?: 'bar' | 'line'
}

export function ChartSkeleton({ height = 256, type = 'bar' }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full" style={{ height }}>
      {/* Y-axis + plot area */}
      <div className="flex gap-2 flex-1">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between py-1 w-8 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-6" />
          ))}
        </div>

        {/* Plot area */}
        <div className="flex-1 relative">
          {type === 'bar' ? (
            <div className="flex items-end justify-around h-full gap-1 pb-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-b-none"
                  style={{ height: `${40 + ((i * 37 + 20) % 60)}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col justify-end gap-1">
              <Skeleton className="w-full" style={{ height: '65%', borderRadius: '4px' }} />
            </div>
          )}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-around pl-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  )
}
