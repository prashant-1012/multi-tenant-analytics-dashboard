import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function KpiCardSkeleton() {
  return (
    <Card className="flex flex-col gap-1">
      <CardHeader className="pb-1">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-10 w-full" />
      </CardContent>
    </Card>
  )
}
