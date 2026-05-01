import { configureStore } from '@reduxjs/toolkit'
import { tenantReducer } from '@/features/tenant/tenantSlice'
import { analyticsReducer } from '@/features/analytics/analyticsSlice'

export const store = configureStore({
  reducer: {
    tenant: tenantReducer,
    analytics: analyticsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
