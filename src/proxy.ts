import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

/**
 * Next.js Edge Proxy (Next.js 16 replaces middleware.ts with proxy.ts).
 *
 * Uses the edge-safe authConfig (no Credentials provider, no Node.js APIs).
 * All RBAC logic lives in authConfig.callbacks.authorized.
 *
 * Matcher excludes:
 *  - Next.js internals (_next/*)
 *  - Static assets
 *  - NextAuth API routes
 *  - MSW service worker
 */
export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|mockServiceWorker.js|api/auth).*)',
  ],
}
