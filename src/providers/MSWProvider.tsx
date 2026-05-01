'use client'

import { useEffect, useState } from 'react'

async function startMockWorker() {
  if (typeof window === 'undefined') return
  const { worker } = await import('@/mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass', // pass non-mocked requests through (Next.js internals, etc.)
  })
}

interface MSWProviderProps {
  children: React.ReactNode
}

export function MSWProvider({ children }: MSWProviderProps) {
  // In production MSW never runs — render children immediately.
  const isDev = process.env.NODE_ENV === 'development'
  const [ready, setReady] = useState(!isDev)

  useEffect(() => {
    if (!isDev) return
    startMockWorker().then(() => setReady(true))
  }, [isDev])

  if (!ready) {
    // Brief blank during service worker registration (~50ms).
    // Avoids any network requests racing before MSW is active.
    return null
  }

  return <>{children}</>
}
