import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth/authSlice'
import { tenantReducer } from '@/features/tenant/tenantSlice'
import { analyticsReducer } from '@/features/analytics/analyticsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    analytics: analyticsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
