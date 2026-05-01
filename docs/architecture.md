# Architecture — Multi-Tenant Analytics Dashboard

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router (TypeScript) |
| State — server | TanStack React Query v5 |
| State — client | Redux Toolkit |
| Auth | NextAuth.js v5 (credentials provider) |
| Mock API | MSW (Mock Service Worker) |
| UI components | ShadCN UI |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Deployment | Vercel |

---

## Folder Structure

```
src/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Route group — public (login)
│   │   └── login/page.tsx
│   ├── (dashboard)/             # Route group — protected
│   │   ├── layout.tsx           # Shell: sidebar + header
│   │   ├── overview/page.tsx    # KPI dashboard
│   │   ├── analytics/
│   │   │   ├── page.tsx         # Feature usage charts
│   │   │   └── [eventId]/page.tsx  # Drill-down
│   │   ├── reports/page.tsx     # CSV export
│   │   └── admin/               # Super-admin only
│   │       ├── tenants/page.tsx
│   │       └── users/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── (mock-passthrough)/  # Dev-only MSW passthrough
│   ├── layout.tsx               # Root layout (providers)
│   └── globals.css
│
├── components/
│   ├── ui/                      # ShadCN generated components
│   ├── charts/                  # Recharts wrappers
│   │   ├── KpiCard.tsx
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   └── PieChart.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── OrgSwitcher.tsx
│   │   └── DateRangePicker.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── ExportButton.tsx
│       └── RoleBadge.tsx
│
├── features/                    # Feature slices (Redux + React Query)
│   ├── auth/
│   │   ├── authSlice.ts
│   │   └── useAuth.ts
│   ├── tenant/
│   │   ├── tenantSlice.ts       # Active org, org list
│   │   └── useTenant.ts
│   ├── analytics/
│   │   ├── analyticsApi.ts      # React Query hooks
│   │   └── analyticsSlice.ts    # Filters state
│   └── users/
│       └── usersApi.ts
│
├── lib/
│   ├── auth.ts                  # NextAuth config
│   ├── queryClient.ts           # React Query client
│   ├── store.ts                 # Redux store
│   └── utils.ts                 # cn(), formatters
│
├── mocks/
│   ├── browser.ts               # MSW browser worker
│   ├── server.ts                # MSW node server (tests)
│   ├── handlers/
│   │   ├── auth.ts
│   │   ├── analytics.ts
│   │   ├── tenants.ts
│   │   └── users.ts
│   └── data/
│       ├── tenants.ts           # Seed data
│       ├── users.ts
│       └── events.ts
│
├── providers/
│   ├── AppProviders.tsx         # Wraps Redux + ReactQuery + NextAuth + Theme
│   └── TenantThemeProvider.tsx  # Applies per-tenant CSS vars
│
├── hooks/
│   ├── useCurrentOrg.ts
│   ├── useRole.ts
│   └── useDebounce.ts
│
└── types/
    ├── auth.ts
    ├── tenant.ts
    ├── analytics.ts
    └── api.ts
```

---

## Multi-Tenancy Design

```
Session JWT
└── user.id
└── user.email
└── user.orgs[]          ← list of {orgId, role}
└── user.activeOrgId     ← currently selected org

Every API request carries: X-Org-Id header (set by MSW interceptor)
MSW handlers filter seed data by orgId.
```

### Tenant isolation rules
- Users query `/api/analytics?orgId=<activeOrgId>` — MSW enforces scope
- Super Admin role bypasses org filter and can query any org
- Org switcher updates `activeOrgId` in Redux + re-fetches all queries

---

## Auth & RBAC

```
Role hierarchy (highest → lowest):
  super_admin → admin → manager → viewer

Route protection:
  /admin/*         → super_admin only        (middleware)
  /users/*         → admin + super_admin      (middleware)
  /analytics/*     → manager, admin, super    (middleware)
  /overview        → all authenticated        (middleware)

Component-level: useRole() hook + <RoleGuard> wrapper
```

NextAuth session strategy: JWT (stateless, works on Vercel Edge).

---

## State Management

| What | Where |
|---|---|
| Session / identity | NextAuth session |
| Active org, org list | Redux `tenantSlice` |
| Filter state (date range, selected metrics) | Redux `analyticsSlice` |
| Server data (analytics, users, tenants) | React Query cache |
| UI state (modals, sidebar open) | Local component state |

---

## Theming

- Tailwind `dark:` variant for light/dark mode (class strategy)
- `next-themes` library drives the class toggle
- Per-tenant brand: CSS custom properties injected by `TenantThemeProvider`
  ```css
  --tenant-primary: #3B82F6;   /* tenant's brand color */
  --tenant-logo: url(...)
  ```

---

## Data Flow (typical page load)

```
1. User hits /overview
2. Next.js middleware checks NextAuth session → redirect to /login if missing
3. middleware checks role → redirect if insufficient
4. Page renders → useQuery('kpis', fetchKpis) fires
5. fetchKpis adds X-Org-Id header from Redux activeOrgId
6. MSW intercepts → filters seed data → returns JSON
7. React Query caches response; KPI cards render
8. Polling: refetchInterval: 30_000 ms
```

---

## API Shape (MSW mock contracts)

```
GET  /api/analytics/kpis          → { dau, mau, revenue, conversions }
GET  /api/analytics/events        → { events: EventSeries[] }
GET  /api/analytics/features      → { features: FeatureUsage[] }
GET  /api/analytics/events/:id    → DrillDownData
GET  /api/tenants                 → Tenant[]          (super_admin)
GET  /api/tenants/:id             → Tenant
GET  /api/users                   → User[]
POST /api/users                   → User
PUT  /api/users/:id               → User
DELETE /api/users/:id             → 204
POST /api/auth/login              → Session
GET  /api/reports/export          → CSV stream
```

All endpoints accept `?from=&to=` date range params and `?orgId=` (super_admin override).
