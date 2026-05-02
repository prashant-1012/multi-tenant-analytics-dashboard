'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { useEventDrillDown, presetToRange, type DatePreset } from '@/hooks/useAnalytics'
import { formatDate, formatNumber } from '@/lib/utils'

export default function EventDrillDownPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [preset, setPreset] = useState<DatePreset>('30d')
  const { from, to } = presetToRange(preset)

  const { data, isLoading, isError } = useEventDrillDown(eventId, from, to)

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <Link href="/analytics" className="hover:text-foreground transition-colors">
              Analytics
            </Link>
            <span>/</span>
            <span>Drill-down</span>
          </div>
          <h2 className="font-mono text-2xl font-bold tracking-tight">
            {data?.eventName ?? eventId}
          </h2>
          <p className="text-muted-foreground text-sm">
            Org: <span className="font-medium">{data?.orgId ?? '…'}</span>
          </p>
        </div>
        <DateRangePicker value={preset} onChange={setPreset} />
      </div>

      {isError && (
        <div className="text-destructive rounded-lg border p-4 text-sm">
          Event not found or you do not have access to it.
        </div>
      )}

      {/* Total count KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Count
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatNumber(data?.totalCount ?? 0)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Unique Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatNumber(data?.byUser.length ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Property Types
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{data?.properties.length ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* By-day bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Event Count</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : data ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.byDay} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
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
                  formatter={(v) => [formatNumber(Number(v)), 'Count']}
                  labelFormatter={(l) => formatDate(String(l))}
                  contentStyle={{ fontSize: 13 }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-tenant-primary, #6366f1)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Per-user table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Users</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 3 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.byUser.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground text-center">
                    No user data
                  </TableCell>
                </TableRow>
              ) : (
                data?.byUser
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10)
                  .map((u) => (
                    <TableRow key={u.userId}>
                      <TableCell className="font-medium">{u.userName}</TableCell>
                      <TableCell className="text-right">{formatNumber(u.count)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(u.lastSeen)}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Property breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Property Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : data?.properties.length === 0 ? (
              <p className="text-muted-foreground text-sm">No properties tracked</p>
            ) : (
              data?.properties.map((prop) => (
                <div key={prop.key} className="space-y-2">
                  <div className="font-mono text-sm font-semibold">{prop.key}</div>
                  <div className="flex flex-wrap gap-2">
                    {prop.values.map((v) => (
                      <Badge key={v.label} variant="secondary" className="gap-1">
                        {v.label}
                        <span className="text-muted-foreground font-normal">
                          {formatNumber(v.count)}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
