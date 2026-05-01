import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import type { SessionUser } from '@/types/auth'

// ─── Mock credential store ────────────────────────────────────────────────────
// Password field is intentionally stripped before the token is issued.
// In production this would be a DB lookup with bcrypt.compare().
const MOCK_USERS: (SessionUser & { password: string })[] = [
  {
    id: 'user_001',
    email: 'admin@example.com',
    name: 'Super Admin',
    avatarUrl: null,
    password: 'password',
    activeOrgId: 'org_001',
    orgs: [
      { orgId: 'org_001', role: 'super_admin', joinedAt: '2024-01-01' },
      { orgId: 'org_002', role: 'super_admin', joinedAt: '2024-01-01' },
      { orgId: 'org_003', role: 'super_admin', joinedAt: '2024-01-01' },
    ],
  },
  {
    id: 'user_002',
    email: 'alice@acme.com',
    name: 'Alice Admin',
    avatarUrl: null,
    password: 'password',
    activeOrgId: 'org_001',
    orgs: [{ orgId: 'org_001', role: 'admin', joinedAt: '2024-02-01' }],
  },
  {
    id: 'user_003',
    email: 'bob@acme.com',
    name: 'Bob Manager',
    avatarUrl: null,
    password: 'password',
    activeOrgId: 'org_001',
    orgs: [{ orgId: 'org_001', role: 'manager', joinedAt: '2024-03-01' }],
  },
  {
    id: 'user_004',
    email: 'carol@globex.com',
    name: 'Carol Admin',
    avatarUrl: null,
    password: 'password',
    activeOrgId: 'org_002',
    orgs: [{ orgId: 'org_002', role: 'admin', joinedAt: '2024-02-15' }],
  },
  {
    id: 'user_005',
    email: 'dave@acme.com',
    name: 'Dave Viewer',
    avatarUrl: null,
    password: 'password',
    activeOrgId: 'org_001',
    orgs: [{ orgId: 'org_001', role: 'viewer', joinedAt: '2024-04-01' }],
  },
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = MOCK_USERS.find(
          (u) =>
            u.email === credentials?.email &&
            u.password === credentials?.password
        )
        if (!user) return null
        // Strip password before returning — NextAuth embeds this in the JWT
        const { password: _, ...safeUser } = user
        return safeUser as SessionUser & { id: string }
      },
    }),
  ],
})
