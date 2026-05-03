# Features — Multi-Tenant Analytics Dashboard

## Feature List

### F-01 · Authentication
- Login page with email + password (NextAuth credentials provider)
- JWT session with org memberships embedded
- Redirect to /overview on success
- Redirect to /login on unauthenticated access
- Error states: invalid credentials, account inactive

### F-02 · Multi-Tenant Org Switcher
- Dropdown in sidebar header showing all orgs the user belongs to
- Switching org updates Redux `activeOrgId` and invalidates all React Query caches
- Active org name + logo displayed at top of sidebar
- Per-tenant primary color applied via CSS custom property

### F-03 · Role-Based Access Control
- Middleware enforces route-level restrictions
- `useRole()` hook for component-level guards
- `<RoleGuard>` wrapper component for conditional rendering
- 4 roles: super_admin, admin, manager, viewer

### F-04 · Dashboard Overview (KPIs)
- 4 KPI cards: DAU, MAU, Revenue, Conversion Rate
- Each card shows: current value, % change vs previous period (all 4 wired), sparkline on DAU
- Line chart: DAU trend over selected date range
- Bar chart: Top 5 features by usage
- Date range picker (last 7d / 30d / 90d)
- Polling refresh every 30 seconds

### F-05 · Analytics — Feature Usage
- Table + bar chart of all features ranked by usage
- Filter by category
- Column: feature name, usage count, unique users, trend (sparkline), drill-down link
- Click feature → drill-down page at `/analytics/[featureId]` (shares event drill-down route)

### F-06 · Analytics — Custom Events
- Event list with time-series line chart
- Filter by event name, date range
- Click event → drill-down page

### F-07 · Drill-Down Analytics
- Route: `/analytics/[eventId]`
- Shows: total count, by-day bar chart, per-user table, property breakdown
- Breadcrumb navigation back to analytics

### F-08 · Reports Export
- Select metric(s) + date range
- Export as CSV (client-side Blob download from MSW handler)
- Viewers see a locked state card — metric selection and export button are hidden entirely

### F-09 · User Management (admin+)
- Table of users in current org
- Columns: name, email, role, joined date
- Invite user (mock — just adds to seed data)
- Change role (admin only)
- Remove user (admin only)
- Super admin: can manage users across all orgs

### F-10 · Tenant Management (super_admin only)
- Table of all tenants
- Columns: name, plan, user count, status
- Toggle tenant active/inactive
- Click row to inline-expand detail panel: slug, plan, member count, created date, primary colour

### F-11 · Light / Dark Mode
- Toggle in header (sun/moon icon)
- Persisted in localStorage via next-themes
- All ShadCN components + custom components support both modes

### F-12 · Per-Tenant Branding
- Sidebar logo + header accent use tenant primary color
- CSS variable `--tenant-primary` injected on org switch
- Fallback to default brand color if tenant has no custom color

---

## Page Map

```
/login                        → F-01
/overview                     → F-04
/analytics                    → F-05, F-06
/analytics/[eventId]          → F-07
/reports                      → F-08
/users                        → F-09
/admin/tenants                → F-10
/admin/users                  → F-09 (cross-tenant)
```

---

## Non-Goals (out of scope for v1)

- Real-time WebSocket updates
- Email notifications / alerts
- Billing integration
- Custom dashboard builder (drag & drop widgets)
- SSO / OAuth providers
- Audit log
