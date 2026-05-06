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

---

## Improvements & Enhancements Backlog

Items are grouped by area. We'll tackle them one by one.

### UI / UX Polish

- [x] **I-01** · Skeleton loading states — replace blank flashes on KPI cards, tables, and charts with shimmer skeletons
- [ ] **I-02** · Empty states — add illustrated empty-state components for tables and charts when there is no data
- [ ] **I-03** · Toast notifications — surface success / error feedback (role change, invite, export) via a toast system (sonner or Radix Toast)
- [ ] **I-04** · Responsive / mobile layout — sidebar collapses to a slide-over drawer; header stacks correctly on small screens
- [ ] **I-05** · Animated KPI card counters — numbers count up on load / refresh for a polished data-reveal feel
- [ ] **I-06** · Chart tooltips — richer custom tooltips on all Recharts components (value, label, % change)
- [ ] **I-07** · Confirmation dialogs — "Remove user" and "Deactivate tenant" actions should require an explicit confirm step
- [ ] **I-08** · Keyboard navigation — sidebar links, org switcher, and dropdowns fully navigable by keyboard with visible focus rings

### Dashboard & Analytics

- [ ] **I-09** · MAU / Revenue / Conversion sparklines — add sparklines to the remaining three KPI cards (DAU already has one)
- [ ] **I-10** · Comparison mode — toggle to overlay previous-period data on the DAU line chart
- [ ] **I-11** · Cohort retention table — `/analytics` tab showing weekly retention cohorts in a heat-map table
- [ ] **I-12** · Funnel chart — visualise a configurable sequence of events as a conversion funnel on the analytics page
- [ ] **I-13** · Drill-down property filters — on `/analytics/[eventId]`, allow filtering the by-day chart by a property value
- [ ] **I-14** · Pinned metrics — let admins pin up to 4 custom metrics to the overview page alongside the default KPIs

### Reports

- [ ] **I-15** · Scheduled report config UI — form to configure a named report (metrics + date range + frequency) saved per-tenant
- [ ] **I-16** · PDF export — generate a printable PDF of the current dashboard view in addition to CSV
- [ ] **I-17** · Report history table — list of previously exported reports with download links and timestamps

### User & Tenant Management

- [ ] **I-18** · Bulk user actions — checkbox-select multiple users to change role or remove in one operation
- [ ] **I-19** · User activity column — show "Last active" timestamp in the users table
- [ ] **I-20** · Tenant usage bar — inline usage bar (users / plan limit) in the tenant table row
- [ ] **I-21** · Tenant detail side-panel — expand the inline tenant detail into a full right-side drawer with edit support for name, plan, and primary color
- [ ] **I-22** · Invite via link — generate a shareable invite URL per org (in addition to mock email invite)

### Auth & Security

- [ ] **I-23** · "Remember me" checkbox — extend JWT session TTL when checked
- [ ] **I-24** · Session expiry banner — show a dismissible warning banner 5 minutes before JWT expiry with a one-click refresh
- [x] **I-25** · Password visibility toggle — show/hide icon in the password input on the login form

### Developer / Quality

- [ ] **I-26** · Error boundary — wrap dashboard routes in an `<ErrorBoundary>` that shows a graceful fallback instead of a white screen
- [ ] **I-27** · Storybook stories — add stories for KpiCard, RoleBadge, OrgSwitcher, and chart components for isolated dev/review
- [ ] **I-28** · E2E smoke tests — Playwright tests covering login → overview → org switch → logout happy path
