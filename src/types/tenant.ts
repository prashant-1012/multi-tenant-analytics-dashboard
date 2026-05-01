export interface Tenant {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  primaryColor: string
  plan: 'starter' | 'pro' | 'enterprise'
  createdAt: string
  isActive: boolean
}
