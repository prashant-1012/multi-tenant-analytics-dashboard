'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DateRangePicker } from '@/components/dashboard/DateRangePicker'
import { useRole } from '@/hooks/useRole'
import { useAppSelector } from '@/hooks/redux'
import { presetToRange, type DatePreset } from '@/hooks/useAnalytics'
import { Download, Lock } from 'lucide-react'

type MetricKey = 'dau' | 'mau' | 'revenue' | 'conversions' | 'features'

const METRICS: { key: MetricKey; label: string; description: string }[] = [
  { key: 'dau', label: 'Daily Active Users', description: 'Per-day DAU count' },
  { key: 'mau', label: 'Monthly Active Users', description: 'MAU total for the period' },
  { key: 'revenue', label: 'Revenue', description: 'Revenue total for the period' },
  { key: 'conversions', label: 'Conversions', description: 'Conversion count for the period' },
  { key: 'features', label: 'Feature Count', description: 'Number of active features per day' },
]

export default function ReportsPage() {
  const { hasRole } = useRole()
  const orgId = useAppSelector((s) => s.tenant.activeOrgId)
  const canExport = hasRole('manager')

  const [preset, setPreset] = useState<DatePreset>('30d')
  const [selected, setSelected] = useState<Set<MetricKey>>(new Set(['dau', 'revenue']))
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')

  function toggleMetric(key: MetricKey) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev // must keep at least one
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  async function handleExport() {
    setError('')
    setIsExporting(true)
    try {
      const { from, to } = presetToRange(preset)
      const metrics = Array.from(selected).join(',')
      // Use fetch directly so we can handle the text/csv response
      const state = (await import('@/lib/store')).store.getState()
      const res = await fetch(
        `/api/reports/export?metrics=${metrics}&from=${from}&to=${to}`,
        {
          headers: {
            'X-Org-Id': state.tenant.activeOrgId ?? '',
            'X-User-Id': state.auth.userId ?? '',
          },
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Export failed')
      }
      const csv = await res.text()
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${orgId}-${from}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message ?? 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground text-sm">Select metrics and export as CSV</p>
        </div>
        <DateRangePicker value={preset} onChange={setPreset} />
      </div>

      {canExport ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select metrics</CardTitle>
              <CardDescription>Choose one or more metrics to include in the CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {METRICS.map((m) => {
                const on = selected.has(m.key)
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleMetric(m.key)}
                    className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 hover:bg-accent"
                    data-selected={on}
                  >
                    <div className={`h-4 w-4 shrink-0 rounded border-2 transition-colors ${on ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-muted-foreground text-xs">{m.description}</p>
                    </div>
                    {on && <Badge variant="secondary" className="text-xs">included</Badge>}
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end">
            <Button
              onClick={handleExport}
              disabled={isExporting || selected.size === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting…' : 'Export CSV'}
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="bg-muted rounded-full p-4">
              <Lock className="text-muted-foreground h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">Export not available</p>
              <p className="text-muted-foreground mt-1 text-sm">
                You need <strong>manager</strong> role or above to export reports.
                Contact your organisation admin to request access.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
