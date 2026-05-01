import type { Tenant } from '@/types/tenant'

export const seedTenants: Tenant[] = [
  {
    id: 'org_001',
    name: 'Acme Corp',
    slug: 'acme',
    logoUrl: null,
    primaryColor: '#6366f1', // indigo
    plan: 'enterprise',
    createdAt: '2024-01-01',
    isActive: true,
  },
  {
    id: 'org_002',
    name: 'Globex Inc',
    slug: 'globex',
    logoUrl: null,
    primaryColor: '#f59e0b', // amber
    plan: 'pro',
    createdAt: '2024-01-15',
    isActive: true,
  },
  {
    id: 'org_003',
    name: 'Initech Ltd',
    slug: 'initech',
    logoUrl: null,
    primaryColor: '#10b981', // emerald
    plan: 'starter',
    createdAt: '2024-02-01',
    isActive: true,
  },
]
