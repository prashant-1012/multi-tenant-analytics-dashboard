'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { FeatureBarChart } from '@/components/charts/FeatureBarChart'
import { EventLineChart } from '@/components/charts/EventLineChart'
import { SparklineChart } from '@/components/charts/SparklineChart'
import { useFeatures, useEvents, presetToRange, type DatePreset } from '@/hooks/useAnalytics'
import { formatNumber } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

export default function AnalyticsPage() {
  const [preset, setPreset] = useState<DatePreset>('30d')
  const { from, to } = presetToRange(preset)

  // Feature usage state
  const [categoryFilter, setCategoryFilter] = useState('')
  const debouncedCategory = useDebounce(categoryFilter, 300)

  // Events state
  const [nameFilter, setNameFilter] = useState('')
  const debouncedName = useDebounce(nameFilter, 300)

  const { data: featuresData, isLoading: featuresLoading } = useFeatures(
    from,
    to,
    debouncedCategory || undefined
  )
  const { data: eventsData, isLoading: eventsLoading } = useEvents(
    from,
    to,
    debouncedName || undefined
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground text-sm">Feature usage and custom events</p>
        </div>
        <DateRangePicker value={preset} onChange={setPreset} />
      </div>

      <Tabs defaultValue="features">
        <TabsList>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="events">Custom Events</TabsTrigger>
        </TabsList>

        {/* ── Feature Usage Tab ─────────────────────────────────── */}
        <TabsContent value="features" className="space-y-4 pt-4">
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

          <div className="flex items-center gap-3">
            <Input
              placeholder="Filter by category…"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead className="text-right">Unique Users</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {featuresLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : featuresData?.features.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground text-center">
                      No features found
                    </TableCell>
                  </TableRow>
                ) : (
                  featuresData?.features
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .map((f) => (
                      <TableRow key={f.featureId}>
                        <TableCell className="font-medium">{f.featureName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{f.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatNumber(f.usageCount)}</TableCell>
                        <TableCell className="text-right">{formatNumber(f.uniqueUsers)}</TableCell>
                        <TableCell>
                          <SparklineChart data={f.trend} className="w-24" />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/analytics/${f.featureId}`}
                            className="text-primary hover:underline text-sm"
                          >
                            View →
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── Custom Events Tab ─────────────────────────────────── */}
        <TabsContent value="events" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Volume Over Time</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {eventsLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : eventsData ? (
                <EventLineChart events={eventsData.events} />
              ) : null}
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Input
              placeholder="Filter by event name…"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Unique Users</TableHead>
                  <TableHead>Drill-down</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : eventsData?.events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground text-center">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  eventsData?.events
                    .sort((a, b) => b.count - a.count)
                    .map((evt) => (
                      <TableRow key={evt.eventId}>
                        <TableCell className="font-mono text-sm">{evt.eventName}</TableCell>
                        <TableCell className="text-right">{formatNumber(evt.count)}</TableCell>
                        <TableCell className="text-right">{formatNumber(evt.uniqueUsers)}</TableCell>
                        <TableCell>
                          <Link
                            href={`/analytics/${evt.eventId}`}
                            className="text-primary hover:underline text-sm"
                          >
                            View →
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
