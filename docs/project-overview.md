# Project Overview — Multi-Tenant Analytics Dashboard

## What This Is

A production-grade, multi-tenant SaaS analytics dashboard built with Next.js App Router. Each organization (tenant) sees only their own data. A super admin can observe and manage all tenants from a single login.

The project is designed to demonstrate real-world patterns used in modern SaaS platforms: org-scoped data isolation, role-based access control, per-tenant branding, and a clean separation between server state (React Query) and client state (Redux Toolkit).

---

## Goals

| Goal | Description |
|---|---|
| **Multi-tenancy** | Every data fetch is scoped to the authenticated user's active organization |
| **RBAC** | Four roles with clearly enforced boundaries at route, API, and component levels |
| **Extensibility** | Mock backend (MSW) mirrors a real API contract — swappable with zero frontend changes |
| **Developer experience** | TypeScript strict mode throughout; typed Redux hooks; co-located feature slices |
| **Production readiness** | Vercel-deployable, Edge-compatible middleware, SSR-safe theming |

---

## User Personas

### 1. Tenant User (Paying Customer)
An employee of an organization that subscribes to this SaaS product. They log in to view analytics specific to their company — active users, feature adoption, revenue metrics, and custom event data. Their data is fully isolated from other tenants.

Sub-roles within a tenant:
- **Admin** — full access to org data + user management
- **Manager** — analytics access, no user management
- **Viewer** — read-only access to dashboards

### 2. Super Admin (Internal Operator)
An employee of the SaaS company itself. They can see all tenants, switch between org contexts, manage tenant status, and perform cross-tenant user administration. They access the `/admin/*` routes.

---

## Key Product Screens

| Screen | Route | Purpose |
|---|---|---|
| Login | `/login` | Email + password auth; role-aware redirect |
| Dashboard Overview | `/overview` | KPI cards, DAU trend, top feature usage |
| Analytics | `/analytics` | Feature usage table + custom events chart |
| Event Drill-Down | `/analytics/[eventId]` | Deep-dive into a single event: by day, by user, by property |
| Reports | `/reports` | Select metrics + date range → export CSV |
| User Management | `/users` | Add, remove, change role for org members |
| Tenant Management | `/admin/tenants` | Super admin: view + toggle all tenants |
| Cross-Tenant Users | `/admin/users` | Super admin: user management across all orgs |

---

## System Design Highlights

### Multi-Tenancy Model: orgId-based isolation

Tenants are not separated by subdomain or database schema — all data lives in the same store, scoped by `orgId`. Every API request carries an `X-Org-Id` header derived from the user's active org in Redux state. The mock backend (MSW) enforces this scope in handlers. A real backend would enforce it at the database query level (e.g., `WHERE org_id = $1`).

This model was chosen because:
- A single user can belong to multiple orgs (common in B2B SaaS)
- Org switching does not require re-authentication
- The isolation boundary is explicit and auditable

### Session Design: JWT with embedded org memberships

The NextAuth JWT payload includes `orgs: OrgMembership[]` and `activeOrgId`. This means the session is stateless and works on Vercel Edge middleware without a database round-trip. The trade-off is that role changes for a user are not reflected until their next login (acceptable for this project scope).

### State Management: Two layers

| Layer | Tool | Stores |
|---|---|---|
| Server state | TanStack React Query | Analytics data, user lists, tenant lists |
| Client state | Redux Toolkit | Active org, filter state (date range, metrics) |

Org switching dispatches a Redux action and calls `queryClient.invalidateQueries()` — all dashboard data re-fetches for the new org scope instantly.

### Mock Backend: MSW v2

MSW intercepts HTTP requests in the browser via a Service Worker. Handlers are written in the same shape as a real REST API. To connect a real backend: remove the MSW initialization from the app bootstrap and point fetch calls at the real host. No frontend changes needed.

---

## Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x (strict) |
| Styling | Tailwind CSS | 4.x |
| UI Components | ShadCN UI | 4.x |
| Charts | Recharts | 3.x |
| Server state | TanStack React Query | 5.x |
| Client state | Redux Toolkit | 2.x |
| Auth | NextAuth.js | 5.x (beta) |
| Mock API | MSW (Mock Service Worker) | 2.x |
| Theming | next-themes | 0.4.x |
| CSV Export | papaparse | 5.x |
| Deployment | Vercel | — |

---

## Project Structure at a Glance

```
src/
├── app/           → Next.js routes (App Router)
├── components/    → UI components (charts, dashboard shell, shared)
├── features/      → Redux slices + React Query hooks, co-located by domain
├── hooks/         → Typed Redux hooks, useRole, useCurrentOrg, useDebounce
├── lib/           → auth config, store, queryClient, utilities
├── mocks/         → MSW browser worker, handlers, seed data
├── providers/     → AppProviders, TenantThemeProvider
└── types/         → Shared TypeScript interfaces and type declarations
```

See [architecture.md](./architecture.md) for the full annotated folder tree.

---

## What Is Intentionally Out of Scope (v1)

- Real-time WebSocket streaming
- Email/Slack notifications and alert rules
- Billing and subscription management
- Drag-and-drop custom dashboard builder
- SSO / OAuth (Google, GitHub, etc.)
- Audit log / activity history
- Row-level security beyond orgId isolation
