# Multi-Tenant Analytics Dashboard

**Live Demo:** [analytiq-dashboard.vercel.app](https://analytiq-dashboard.vercel.app)

A production-grade, multi-tenant SaaS analytics dashboard built with Next.js 16 App Router. Each organization sees only their own data. A super admin can observe and manage all tenants from a single login.

Built to demonstrate real-world SaaS patterns: org-scoped data isolation, role-based access control, per-tenant branding, and a clean separation between server state and client state.

---

## Features

| # | Feature | Description |
|---|---|---|
| F-01 | **Authentication** | Email + password via NextAuth credentials; JWT session with org memberships embedded |
| F-02 | **Org Switcher** | Switch between orgs without re-auth; all dashboard data re-fetches instantly for the new org |
| F-03 | **RBAC** | 4 roles (super_admin / admin / manager / viewer) enforced at route, API, and component levels |
| F-04 | **Dashboard Overview** | 4 KPI cards with % change + sparkline, DAU trend line chart, top-5 feature bar chart, 30s polling |
| F-05 | **Feature Usage Analytics** | Table + bar chart ranked by usage, category filter, per-feature drill-down |
| F-06 | **Custom Events Analytics** | Time-series line chart, event filter, date range filter |
| F-07 | **Drill-Down** | Per-event deep-dive: by-day chart, per-user table, property breakdown |
| F-08 | **Reports + CSV Export** | Select metrics + date range → client-side CSV download; viewers see a locked state |
| F-09 | **User Management** | Invite, change role, remove users per org; super admin manages across all orgs |
| F-10 | **Tenant Management** | Super admin view of all tenants; activate/deactivate toggle; inline detail panel |
| F-11 | **Light / Dark Mode** | Toggle persisted in localStorage via next-themes |
| F-12 | **Per-Tenant Branding** | Sidebar + header accent driven by tenant primary color via CSS custom property |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) · TypeScript strict |
| Styling | Tailwind CSS v4 |
| UI Components | ShadCN UI v4 |
| Charts | Recharts |
| Server state | TanStack React Query v5 |
| Client state | Redux Toolkit |
| Auth | NextAuth.js v5 (JWT / credentials) |
| Mock API | MSW v2 (Mock Service Worker) |
| Theming | next-themes |
| CSV Export | papaparse |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          → Login page
│   ├── (dashboard)/           → Protected shell (sidebar + header)
│   │   ├── overview/          → KPI dashboard
│   │   ├── analytics/         → Feature usage + events
│   │   │   └── [eventId]/     → Drill-down
│   │   ├── reports/           → CSV export
│   │   ├── users/             → User management
│   │   └── admin/             → Super-admin only
│   │       ├── tenants/
│   │       └── users/
│   └── api/auth/[...nextauth]/
│
├── components/
│   ├── ui/                    → ShadCN generated components
│   ├── charts/                → Recharts wrappers (KpiCard, Line, Bar, Sparkline)
│   ├── dashboard/             → Sidebar, Header, OrgSwitcher, DateRangePicker
│   └── shared/                → DataTable, RoleGuard, RoleBadge, ExportButton
│
├── features/                  → Redux slice + React Query hooks, co-located by domain
│   ├── auth/
│   ├── tenant/
│   ├── analytics/
│   └── users/
│
├── hooks/                     → useAppDispatch, useAppSelector, useRole, useCurrentOrg
├── lib/                       → auth.ts, store.ts, queryClient.ts, axiosInstance.ts, utils.ts
├── mocks/                     → MSW browser worker, handlers, seed data
├── providers/                 → AppProviders, TenantThemeProvider, MSWProvider, SessionSync
└── types/                     → Shared TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm / pnpm / yarn

### Install

```bash
npm install
```

### Environment

```bash
cp .env.example .env.local
```

`.env.local` is pre-filled for local development — no changes needed to run the app.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). MSW intercepts all API calls in the browser — no backend required.

---

## Mock Credentials

All accounts use the password **`password`**.

| Email | Role | Org |
|---|---|---|
| admin@example.com | super_admin | (all orgs) |
| alice@acme.com | admin | Acme Corp |
| bob@acme.com | manager | Acme Corp |
| carol@globex.com | admin | Globex |
| dave@acme.com | viewer | Acme Corp |

**Role capabilities:**

| Action | viewer | manager | admin | super_admin |
|---|:---:|:---:|:---:|:---:|
| View dashboard + analytics | ✓ | ✓ | ✓ | ✓ |
| Export reports | | ✓ | ✓ | ✓ |
| Manage users (org) | | | ✓ | ✓ |
| Manage tenants | | | | ✓ |
| Cross-tenant access | | | | ✓ |

---

## Architecture Highlights

### Multi-Tenancy — orgId isolation

All data is scoped by `orgId`. Every API request carries an `X-Org-Id` header derived from the user's active org in Redux state. MSW enforces this scope in every handler. A real backend would enforce it at the database query level (`WHERE org_id = $1`).

A single user can belong to multiple orgs. Switching orgs dispatches a Redux action and calls `queryClient.invalidateQueries()` — all data re-fetches instantly without re-authentication.

### Auth — stateless JWT

The NextAuth JWT embeds `orgs: OrgMembership[]` and `activeOrgId`, making it stateless and compatible with Vercel Edge middleware. The trade-off: role changes are not reflected until the user's next login.

### State — two layers

| Layer | Tool | Stores |
|---|---|---|
| Server state | React Query | Analytics data, user lists, tenant lists |
| Client state | Redux Toolkit | Active org, filter state (date range, metrics) |

### Mock Backend — MSW v2

MSW intercepts HTTP requests via a Service Worker. Handlers mirror a real REST API contract. Seed data is generated deterministically by orgId — the same org + date range always returns the same numbers.

To connect a real backend: remove MSW initialization from `AppProviders` and point `axiosInstance` at the real host. No other frontend changes needed.

---

## Pages

| Route | Access | Description |
|---|---|---|
| `/login` | public | Email + password login |
| `/overview` | all roles | KPI cards, DAU trend, feature bar chart |
| `/analytics` | manager+ | Feature usage table + events chart |
| `/analytics/[eventId]` | manager+ | Per-event drill-down |
| `/reports` | manager+ | Metric selection + CSV export |
| `/users` | admin+ | Org user management |
| `/admin/tenants` | super_admin | Tenant list + activate/deactivate |
| `/admin/users` | super_admin | Cross-tenant user management |

---

## Docs

| File | Contents |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Full annotated folder tree, data flow, API shape |
| [docs/features.md](docs/features.md) | Feature list + enhancement backlog |
| [docs/decisions.md](docs/decisions.md) | Architectural decisions and rationale |
| [docs/data-model.md](docs/data-model.md) | TypeScript types and data shapes |
| [docs/roles-permissions.md](docs/roles-permissions.md) | RBAC matrix and enforcement points |
| [docs/api-design.md](docs/api-design.md) | REST API contract (MSW mock) |
| [docs/progress.md](docs/progress.md) | Phase-by-phase implementation status |

---

## Out of Scope (v1)

- Real-time WebSocket streaming
- Email / Slack notifications and alert rules
- Billing and subscription management
- Drag-and-drop custom dashboard builder
- SSO / OAuth (Google, GitHub, etc.)
- Audit log / activity history
