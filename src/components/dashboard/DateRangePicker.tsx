'use client'

import { Button } from '@/components/ui/button'
import type { DatePreset } from '@/hooks/useAnalytics'

const PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
]

interface Props {
  value: DatePreset
  onChange: (preset: DatePreset) => void
}

export function DateRangePicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {PRESETS.map((p) => (
        <Button
          key={p.value}
          size="sm"
          variant={value === p.value ? 'default' : 'outline'}
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  )
}
