import type { NextAuthConfig } from 'next-auth'
import type { Role, OrgMembership, SessionUser } from '@/types/auth'

const ROLE_RANK: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  viewer: 1,
}

// Route → minimum role required to access it
// Order matters — first match wins
const ROUTE_RULES: Array<{
  pattern: RegExp
  minRole: Role
  redirectTo: string
}> = [
  { pattern: /^\/admin(\/.*)?$/, minRole: 'super_admin', redirectTo: '/overview' },
  { pattern: /^\/users(\/.*)?$/, minRole: 'admin', redirectTo: '/overview' },
  { pattern: /^\/reports(\/.*)?$/, minRole: 'manager', redirectTo: '/overview' },
  { pattern: /^\/analytics(\/.*)?$/, minRole: 'viewer', redirectTo: '/login' },
  { pattern: /^\/overview$/, minRole: 'viewer', redirectTo: '/login' },
]

function resolveRole(orgs: OrgMembership[], activeOrgId: string): Role {
  const membership = orgs.find((o) => o.orgId === activeOrgId)
  return (membership?.role as Role) ?? 'viewer'
}

function isSuperAdmin(orgs: OrgMembership[]): boolean {
  return orgs.some((o) => o.role === 'super_admin')
}

export const authConfig: NextAuthConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },

  callbacks: {
    // ─── JWT callback ─────────────────────────────────────────────────────────
    // Runs at sign-in and every time the token is read. Embeds custom fields
    // into the JWT so they survive across requests without a DB lookup.
    jwt({ token, user }) {
      if (user) {
        const u = user as unknown as SessionUser
        token.id = u.id
        token.orgs = u.orgs
        token.activeOrgId = u.activeOrgId
        token.avatarUrl = u.avatarUrl
      }
      return token
    },

    // ─── Session callback ──────────────────────────────────────────────────────
    // Shapes the session object exposed to the client via useSession().
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.orgs = token.orgs as OrgMembership[]
      session.user.activeOrgId = token.activeOrgId as string
      session.user.avatarUrl = token.avatarUrl as string | null
      return session
    },

    // ─── Authorized callback ───────────────────────────────────────────────────
    // Runs in Edge middleware on every navigation request.
    // Returns true (allow), false (deny → signIn page), or a Response (redirect).
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // ── Public: login page ──
      if (pathname === '/login') {
        // Already authenticated → send to dashboard
        if (isLoggedIn) {
          return Response.redirect(new URL('/overview', nextUrl))
        }
        return true
      }

      // ── Unauthenticated access to protected route ──
      if (!isLoggedIn) {
        const callbackUrl = encodeURIComponent(nextUrl.href)
        return Response.redirect(
          new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
        )
      }

      // ── Resolve the user's role for the active org ──
      const orgs = (auth.user.orgs ?? []) as OrgMembership[]
      const activeOrgId = auth.user.activeOrgId as string
      const role = resolveRole(orgs, activeOrgId)
      const isSuper = isSuperAdmin(orgs)

      // ── Apply route rules ──
      for (const rule of ROUTE_RULES) {
        if (!rule.pattern.test(pathname)) continue

        // Super admin bypasses all route restrictions
        if (isSuper) return true

        if (ROLE_RANK[role] < ROLE_RANK[rule.minRole]) {
          return Response.redirect(new URL(rule.redirectTo, nextUrl))
        }
        return true
      }

      // Default: allow (handles static files, API routes, etc.)
      return true
    },
  },

  providers: [], // Providers added in auth.ts — not edge-compatible here
}
