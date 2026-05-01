import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // data stays fresh for 30 s
      refetchInterval: 30_000, // background poll every 30 s
      retry: 1,
      // errors from axiosInstance interceptor are ApiError objects
    },
    mutations: {
      retry: 0,
    },
  },
})
