export type Role = 'super_admin' | 'admin' | 'manager' | 'viewer'

export interface OrgMembership {
  orgId: string
  role: Role
  joinedAt: string
}

export interface SessionUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  orgs: OrgMembership[]
  activeOrgId: string
}
