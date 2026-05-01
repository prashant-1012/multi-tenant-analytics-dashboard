import type { User } from '@/types/api'

// In-memory store — mutations (invite, remove, role change) update this array
// and persist until page refresh (intentional for a mock).
export const seedUsers: User[] = [
  {
    id: 'user_001',
    email: 'admin@example.com',
    name: 'Super Admin',
    avatarUrl: null,
    createdAt: '2024-01-01',
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
    createdAt: '2024-02-01',
    orgs: [{ orgId: 'org_001', role: 'admin', joinedAt: '2024-02-01' }],
  },
  {
    id: 'user_003',
    email: 'bob@acme.com',
    name: 'Bob Manager',
    avatarUrl: null,
    createdAt: '2024-03-01',
    orgs: [{ orgId: 'org_001', role: 'manager', joinedAt: '2024-03-01' }],
  },
  {
    id: 'user_004',
    email: 'carol@globex.com',
    name: 'Carol Admin',
    avatarUrl: null,
    createdAt: '2024-02-15',
    orgs: [{ orgId: 'org_002', role: 'admin', joinedAt: '2024-02-15' }],
  },
  {
    id: 'user_005',
    email: 'dave@acme.com',
    name: 'Dave Viewer',
    avatarUrl: null,
    createdAt: '2024-04-01',
    orgs: [{ orgId: 'org_001', role: 'viewer', joinedAt: '2024-04-01' }],
  },
]
