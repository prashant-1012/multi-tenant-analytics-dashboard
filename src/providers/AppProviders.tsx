'use client'

import { SessionProvider } from 'next-auth/react'
import { Provider as ReduxProvider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MSWProvider } from './MSWProvider'
import { TenantThemeProvider } from './TenantThemeProvider'
import { SessionSync } from './SessionSync'
import { store } from '@/lib/store'
import { queryClient } from '@/lib/queryClient'

/**
 * Provider tree (outer → inner):
 *  MSWProvider        — starts service worker before any network request fires
 *  SessionProvider    — NextAuth session context
 *  ReduxProvider      — global client state
 *  QueryClientProvider— server state cache
 *  ThemeProvider      — light / dark mode (class strategy, next-themes)
 *  TenantThemeProvider— injects --tenant-primary CSS var on org switch
 *  TooltipProvider    — ShadCN tooltip context
 *  SessionSync        — syncs NextAuth → Redux (renderless)
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MSWProvider>
      <SessionProvider>
        <ReduxProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TenantThemeProvider>
                <TooltipProvider>
                  <SessionSync />
                  {children}
                </TooltipProvider>
              </TenantThemeProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ReduxProvider>
      </SessionProvider>
    </MSWProvider>
  )
}
