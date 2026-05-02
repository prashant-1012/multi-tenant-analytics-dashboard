'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart2,
  FileText,
  Users,
  Building2,
  UsersRound,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRole } from '@/hooks/useRole'
import { OrgSwitcher } from './OrgSwitcher'
import type { Role } from '@/types/auth'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  minRole: Role
  section?: 'main' | 'admin'
}

const NAV_ITEMS: NavItem[] = [
  // ── Main ──
  {
    label: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
    minRole: 'viewer',
    section: 'main',
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart2,
    minRole: 'viewer',
    section: 'main',
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
    minRole: 'manager',
    section: 'main',
  },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    minRole: 'admin',
    section: 'main',
  },
  // ── Admin ──
  {
    label: 'Tenants',
    href: '/admin/tenants',
    icon: Building2,
    minRole: 'super_admin',
    section: 'admin',
  },
  {
    label: 'All Users',
    href: '/admin/users',
    icon: UsersRound,
    minRole: 'super_admin',
    section: 'admin',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { hasRole } = useRole()

  const mainItems  = NAV_ITEMS.filter((i) => i.section === 'main'  && hasRole(i.minRole))
  const adminItems = NAV_ITEMS.filter((i) => i.section === 'admin' && hasRole(i.minRole))

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r bg-sidebar">
      {/* Org switcher */}
      <div className="border-b p-3">
        <OrgSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <SectionItems items={mainItems} pathname={pathname} />

        {adminItems.length > 0 && (
          <>
            <div className="my-2 px-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Platform
              </p>
            </div>
            <SectionItems items={adminItems} pathname={pathname} />
          </>
        )}
      </nav>
    </aside>
  )
}

function SectionItems({
  items,
  pathname,
}: {
  items: NavItem[]
  pathname: string
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const isActive =
          item.href === '/overview'
            ? pathname === item.href
            : pathname.startsWith(item.href)

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-3 w-3 opacity-60" />
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
