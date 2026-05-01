import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { DateRange } from '@/types/analytics'

type Granularity = 'day' | 'week' | 'month'

interface AnalyticsFilterState {
  dateRange: DateRange
  selectedMetrics: string[]
  granularity: Granularity
}

const initialState: AnalyticsFilterState = {
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  },
  selectedMetrics: [],
  granularity: 'day',
}

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<DateRange>) {
      state.dateRange = action.payload
    },
    setSelectedMetrics(state, action: PayloadAction<string[]>) {
      state.selectedMetrics = action.payload
    },
    setGranularity(state, action: PayloadAction<Granularity>) {
      state.granularity = action.payload
    },
  },
})

export const { setDateRange, setSelectedMetrics, setGranularity } = analyticsSlice.actions
export const analyticsReducer = analyticsSlice.reducer
