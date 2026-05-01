# Roles & Permissions — Multi-Tenant Analytics Dashboard

## Role Hierarchy

There are four roles, ordered from most to least privileged. Access is additive upward — a higher role inherits all permissions of roles below it.

```
super_admin  (rank 4)  ← platform operator; crosses org boundaries
    │
  admin      (rank 3)  ← org-level owner; full access within their org
    │
 manager     (rank 2)  ← analytics access; no user or org management
    │
 viewer      (rank 1)  ← read-only; cannot export or manage anything
```

Roles are per-org. A user can be `admin` in org_001 and `viewer` in org_002. The active role is derived from `session.user.orgs.find(o => o.orgId === activeOrgId).role`.

`super_admin` is a platform-wide designation. It grants cross-org access and is not org-scoped — it overrides all org filters.

---

## Role Definitions

### `viewer`
The most restricted role. Granted to users who need read-only visibility into their org's analytics.

**Can:**
- View the Overview dashboard (KPI cards, charts)
- View the Analytics page (feature usage, events)
- View drill-down pages
- Switch between orgs they belong to

**Cannot:**
- Export reports (CSV)
- Manage users (invite, remove, change role)
- Access `/admin/*` routes
- See data from other orgs

---

### `manager`
Intended for team leads or department heads who need analytics access but should not manage org membership.

**Can do everything `viewer` can, plus:**
- Export reports to CSV

**Cannot:**
- Manage users
- Access `/admin/*` routes

---

### `admin`
The org owner or administrator. Has full control over their organization.

**Can do everything `manager` can, plus:**
- View and manage users within their org (`/users`)
- Invite new users to their org
- Change user roles within their org (up to `admin`; cannot assign `super_admin`)
- Remove users from their org

**Cannot:**
- Assign or remove `super_admin` role
- Access other orgs' data
- Access `/admin/*` routes (platform-level management)

---

### `super_admin`
A platform operator. Not scoped to any single org.

**Can do everything `admin` can, plus:**
- Access all tenants' data (`X-Org-Id` override allowed)
- View all tenants in the platform (`/admin/tenants`)
- Toggle tenant active/inactive status
- Manage users across all orgs (`/admin/users`)
- Assign any role, including `admin`
- View data for any org by switching context via the OrgSwitcher

**Restriction:** Even `super_admin` cannot assign another user the `super_admin` role through the UI (hardcoded guard — `super_admin` is provisioned only at the data seed level).

---

## Route-Level Enforcement (Middleware)

Route protection runs in Next.js Edge Middleware (`middleware.ts`) on every navigation request before the page renders. The middleware decodes the NextAuth JWT and checks the user's role for the active org.

| Route Pattern | Minimum Role Required | Redirect if Denied |
|---|---|---|
| `/login` | — (public) | `/overview` if already authenticated |
| `/overview` | `viewer` | `/login` |
| `/analytics` | `viewer` | `/login` |
| `/analytics/[eventId]` | `viewer` | `/login` |
| `/reports` | `manager` | `/overview` (with toast: "Upgrade your role") |
| `/users` | `admin` | `/overview` |
| `/admin/tenants` | `super_admin` | `/overview` |
| `/admin/users` | `super_admin` | `/overview` |

Any unauthenticated request to a protected route is redirected to `/login` with a `?callbackUrl=` param.

---

## Component-Level Enforcement

Not all restrictions map cleanly to routes. Some UI elements must be hidden or disabled based on the user's role within the same page. Two mechanisms handle this:

### `useRole()` hook

```typescript
const { role, hasRole, isSuperAdmin } = useRole()

// hasRole uses numeric rank: super_admin=4, admin=3, manager=2, viewer=1
// hasRole('manager') → true for manager, admin, super_admin
if (hasRole('admin')) {
  // show invite user button
}
```

### `<RoleGuard>` component

```tsx
<RoleGuard required="manager">
  <ExportButton />
</RoleGuard>

<RoleGuard required="admin" fallback={<p>Contact your admin</p>}>
  <InviteUserDialog />
</RoleGuard>
```

`<RoleGuard>` renders `children` only if the current user's role meets the `required` threshold. An optional `fallback` prop renders in place when access is denied.

---

## API-Level Enforcement (MSW Handlers)

All API handlers check the `X-Org-Id` request header and the role embedded in the Authorization context. In the mock layer, the active org and role are inferred from the session user stored in MSW state.

| Endpoint | Viewer | Manager | Admin | Super Admin |
|---|---|---|---|---|
| `GET /api/analytics/kpis` | ✅ own org | ✅ own org | ✅ own org | ✅ any org |
| `GET /api/analytics/events` | ✅ own org | ✅ own org | ✅ own org | ✅ any org |
| `GET /api/analytics/features` | ✅ own org | ✅ own org | ✅ own org | ✅ any org |
| `GET /api/analytics/events/:id` | ✅ own org | ✅ own org | ✅ own org | ✅ any org |
| `GET /api/reports/export` | ❌ 403 | ✅ own org | ✅ own org | ✅ any org |
| `GET /api/users` | ❌ 403 | ❌ 403 | ✅ own org | ✅ any org |
| `POST /api/users` | ❌ 403 | ❌ 403 | ✅ own org | ✅ any org |
| `PUT /api/users/:id` | ❌ 403 | ❌ 403 | ✅ own org | ✅ any org |
| `DELETE /api/users/:id` | ❌ 403 | ❌ 403 | ✅ own org | ✅ any org |
| `GET /api/tenants` | ❌ 403 | ❌ 403 | ❌ 403 | ✅ |
| `PUT /api/tenants/:id` | ❌ 403 | ❌ 403 | ❌ 403 | ✅ |

A `403 Forbidden` response body always has the shape:
```json
{ "error": "FORBIDDEN", "message": "Insufficient role for this operation" }
```

---

## Org-Level Data Isolation

**Rule:** Every non-super-admin user sees only data where `orgId === activeOrgId`.

**How it is enforced:**

1. **Frontend fetch layer** — all React Query fetch functions read `activeOrgId` from Redux and attach it as the `X-Org-Id` header.
2. **MSW handlers** — filter seed data: `data.filter(item => item.orgId === orgId)`.
3. **Super admin exception** — if the role is `super_admin`, the `orgId` query param may differ from the session's default org. Handlers check `isSuperAdmin` before applying the org filter.

**Org switching flow:**
```
User selects new org in OrgSwitcher
  → dispatch(setActiveOrg(newOrgId))           [Redux]
  → queryClient.invalidateQueries()             [React Query]
  → all useQuery hooks refetch with new X-Org-Id
  → TenantThemeProvider reapplies CSS vars      [new brand color]
```

Session is not re-issued on org switch. The new `activeOrgId` lives only in Redux (client memory). On page refresh, `activeOrgId` is re-seeded from `session.user.activeOrgId` (the org that was active at login time).

---

## Cross-Org Access (Super Admin Only)

Super admins can observe any org's data by switching to that org via the OrgSwitcher. They can also pass `?orgId=<target>` as a query parameter on analytics endpoints, which MSW handlers honor when the requesting user is `super_admin`.

This pattern mirrors how real multi-tenant platforms allow support teams to impersonate or inspect tenant data without needing a separate login per tenant.

---

## Role Assignment Rules

| Actor | Can assign roles | Cannot assign roles |
|---|---|---|
| `admin` | `viewer`, `manager`, `admin` (within own org) | `super_admin` |
| `super_admin` | `viewer`, `manager`, `admin` (any org) | `super_admin` (UI blocked) |
| `manager`, `viewer` | — (no access to user management) | — |

Attempting to set a role above your own rank returns `403` from the API handler.

---

## Implementation Reference

| Concern | File |
|---|---|
| Role type definition | `src/types/auth.ts` |
| Role rank map + `useRole()` hook | `src/hooks/useRole.ts` |
| `<RoleGuard>` component | `src/components/shared/RoleGuard.tsx` |
| Route-level middleware | `src/middleware.ts` |
| MSW permission checks | `src/mocks/handlers/*.ts` |
| Redux active org | `src/features/tenant/tenantSlice.ts` |
