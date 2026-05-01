import type { OrgMembership } from './auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      avatarUrl: string | null
      orgs: OrgMembership[]
      activeOrgId: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    orgs: OrgMembership[]
    activeOrgId: string
    avatarUrl: string | null
  }
}
