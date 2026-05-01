import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userId: string | null
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { userId: null } as AuthState,
  reducers: {
    setUserId(state, action: PayloadAction<string | null>) {
      state.userId = action.payload
    },
  },
})

export const { setUserId } = authSlice.actions
export const authReducer = authSlice.reducer
