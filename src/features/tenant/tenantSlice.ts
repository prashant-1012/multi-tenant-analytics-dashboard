import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Tenant } from '@/types/tenant'

interface TenantState {
  activeOrgId: string | null
  orgs: Tenant[]
}

const initialState: TenantState = {
  activeOrgId: null,
  orgs: [],
}

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setActiveOrg(state, action: PayloadAction<string>) {
      state.activeOrgId = action.payload
    },
    setOrgs(state, action: PayloadAction<Tenant[]>) {
      state.orgs = action.payload
    },
  },
})

export const { setActiveOrg, setOrgs } = tenantSlice.actions
export const tenantReducer = tenantSlice.reducer
