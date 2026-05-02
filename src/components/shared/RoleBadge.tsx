import { Badge } from '@/components/ui/badge'
import type { Role } from '@/types/auth'

const ROLE_CONFIG: Record<Role, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  super_admin: { label: 'Super Admin', variant: 'destructive' },
  admin:       { label: 'Admin',       variant: 'default'     },
  manager:     { label: 'Manager',     variant: 'secondary'   },
  viewer:      { label: 'Viewer',      variant: 'outline'     },
}

export function RoleBadge({ role }: { role: Role }) {
  const { label, variant } = ROLE_CONFIG[role]
  return <Badge variant={variant}>{label}</Badge>
}
