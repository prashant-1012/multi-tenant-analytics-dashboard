import { useRole } from '@/hooks/useRole'
import type { Role } from '@/types/auth'

interface RoleGuardProps {
  required: Role
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Renders children only when the current user's role meets `required`.
 * Uses numeric rank comparison so hasRole('manager') is true for admin + super_admin.
 */
export function RoleGuard({ required, children, fallback = null }: RoleGuardProps) {
  const { hasRole } = useRole()
  return hasRole(required) ? <>{children}</> : <>{fallback}</>
}
