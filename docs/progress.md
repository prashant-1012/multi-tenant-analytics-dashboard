# Progress — Multi-Tenant Analytics Dashboard

## Status Legend
- ✅ Done
- 🔄 In Progress
- ⬜ Pending
- ❌ Blocked

---

## Phase 1 — Project Setup

| Task | Status | Notes |
|---|---|---|
| Discovery & requirements | ✅ | Completed 2026-05-02 |
| Architecture docs | ✅ | /docs/architecture.md (version corrected: Next.js 16, Tailwind v4) |
| Data model docs | ✅ | /docs/data-model.md |
| Features docs | ✅ | /docs/features.md |
| Project overview doc | ✅ | /docs/project-overview.md |
| Roles & permissions doc | ✅ | /docs/roles-permissions.md |
| API design doc | ✅ | /docs/api-design.md |
| Scaffold Next.js 16 (App Router, TypeScript) | ✅ | strict mode on, `src/` layout, `@/*` alias |
| Install runtime dependencies | ✅ | next-auth, RTK, react-query, recharts, msw, shadcn, next-themes, papaparse |
| Install dev dependencies | ✅ | @types/papaparse, prettier, prettier-plugin-tailwindcss |
| Tailwind CSS v4 | ✅ | Scaffold default; ShadCN configured on top |
| ShadCN UI init + base components (14) | ✅ | button, card, dialog, table, tabs, badge, avatar, etc. |
| TypeScript strict mode | ✅ | Already on; zero tsc errors |
| Base folder structure (features, mocks, hooks, providers, types) | ✅ | All dirs created per architecture.md |
| Redux store + tenantSlice + analyticsSlice | ✅ | |
| Custom typed hooks (useAppDispatch, useAppSelector) | ✅ | |
| useCurrentOrg, useRole, useDebounce hooks | ✅ | |
| NextAuth config (credentials provider, JWT strategy) | ✅ | 5 mock users seeded |
| NextAuth API route | ✅ | /api/auth/[...nextauth] |
| next-auth type augmentation | ✅ | orgs, activeOrgId, avatarUrl on Session |
| AppProviders wrapper (Redux+RQ+NextAuth+Theme+Tooltip) | ✅ | Now includes TenantThemeProvider |
| Root layout updated | ✅ | Uses AppProviders, suppressHydrationWarning |
| lib/utils.ts — cn + formatters | ✅ | formatCurrency, formatNumber, formatPercent, formatDate |
| lib/queryClient.ts | ✅ | 30s staleTime + refetchInterval; mutation retry=0 |
| lib/axiosInstance.ts | ✅ | axios + request interceptor (X-Org-Id) + response interceptor (ApiError, 401 redirect) |
| providers/TenantThemeProvider.tsx | ✅ | Injects --tenant-primary CSS var on org switch |
| components/shared/ThemeToggle.tsx | ✅ | Sun/moon toggle; uses next-themes useTheme |
| globals.css — --color-tenant-primary token | ✅ | Registered in @theme block; usable as bg-tenant-primary |
| .env.local | ✅ | NEXTAUTH_SECRET + NEXTAUTH_URL |
| .prettierrc | ✅ | prettier-plugin-tailwindcss |
| Production build — zero errors | ✅ | npm run build + tsc --noEmit both pass |

## Phase 2 — Core Infrastructure

| Task | Status | Notes |
|---|---|---|
| auth.config.ts (edge-safe, authorized callback with RBAC) | ✅ | Splits provider from auth logic; middleware-safe |
| auth.ts refactored to spread authConfig | ✅ | Only owns Credentials provider + mock users |
| authSlice (userId in Redux) | ✅ | Enables sync X-User-Id header in axiosInstance |
| store.ts — authReducer added | ✅ | |
| axiosInstance.ts — X-User-Id header added, direct import | ✅ | Both X-Org-Id + X-User-Id injected on every request |
| MSW seed data — tenants (3) | ✅ | Acme/Globex/Initech; different plans + colours |
| MSW seed data — users (5) | ✅ | Mutable in-memory array; mutations persist until refresh |
| MSW seed data — analytics generators | ✅ | Deterministic Park-Miller PRNG; seeded by orgId |
| MSW helpers (resolveContext, hasRole, Errors, parseDateRange) | ✅ | Central RBAC for all handlers |
| MSW handler — analytics (kpis, features, events, drill-down) | ✅ | org-scoped, role-checked, tenant-active-checked |
| MSW handler — users (GET/POST/PUT/DELETE) | ✅ | Full RBAC + self-removal guard + role-escalation guard |
| MSW handler — tenants (GET list, GET by id, PUT) | ✅ | super_admin only; PUT supports isActive toggle |
| MSW handler — reports/export (CSV) | ✅ | manager+; validates metrics param; returns text/csv |
| MSW browser.ts + public/mockServiceWorker.js | ✅ | `npx msw init public/` run |
| MSWProvider (delays render until worker active) | ✅ | pass-through in production |
| SessionSync (NextAuth → Redux bridge) | ✅ | Syncs userId, activeOrgId, tenant list on session change |
| AppProviders — MSWProvider + SessionSync wired in | ✅ | Correct provider nesting order documented |
| proxy.ts (Next.js 16 Edge Proxy, RBAC via authConfig) | ✅ | middleware.ts deprecated in Next.js 16 → renamed to proxy.ts |
| Production build — zero errors | ✅ | tsc --noEmit ✅ · npm run build ✅ · Proxy listed in build output |

## Phase 3 — Auth & Shell

| Task | Status | Notes |
|---|---|---|
| Login page | ✅ | `(auth)/login/page.tsx` + `LoginForm.tsx` (Suspense boundary for useSearchParams) |
| Auth layout | ✅ | `(auth)/layout.tsx` — minimal pass-through |
| Role-based redirect after login | ✅ | proxy.ts `authorized` callback handles it; `signIn(redirect:false)` + `router.push` on client |
| RoleGuard component | ✅ | `components/shared/RoleGuard.tsx` — renders children only if `hasRole(required)` |
| RoleBadge component | ✅ | `components/shared/RoleBadge.tsx` — colour-coded per role |
| OrgSwitcher | ✅ | `components/dashboard/OrgSwitcher.tsx` — dispatch `setActiveOrg` + `invalidateQueries()` |
| Sidebar (role-based nav) | ✅ | `components/dashboard/Sidebar.tsx` — items filtered by `hasRole(minRole)` at render |
| Header (user info + theme toggle) | ✅ | `components/dashboard/Header.tsx` — avatar, name, role badge, sign-out |
| Dashboard shell layout | ✅ | `(dashboard)/layout.tsx` — fixed sidebar + scrollable main |
| Placeholder pages (overview, analytics, reports, users, admin/*) | ✅ | All routable; real content in Phase 4/5 |
| Root page redirect | ✅ | `app/page.tsx` → `redirect('/overview')` |
| Production build — all 11 routes | ✅ | `npm run build` passes; `ƒ Proxy (Middleware)` confirmed |

## Phase 4 — Dashboard & Analytics

| Task | Status | Notes |
|---|---|---|
| KPI cards | ✅ | `components/dashboard/KpiCard.tsx` — value, % change, sparkline |
| DAU line chart | ✅ | `components/charts/DauLineChart.tsx` — Recharts LineChart, tenant primary color |
| Feature usage bar chart | ✅ | `components/charts/FeatureBarChart.tsx` — horizontal BarChart, top 5 |
| Date range picker | ✅ | `components/dashboard/DateRangePicker.tsx` — 7d / 30d / 90d presets |
| Overview page | ✅ | 4 KPI cards + DAU trend + feature bar chart; 30s polling |
| Analytics — feature usage page | ✅ | Tab in `/analytics` — table + bar chart, category filter, sparkline trend |
| Analytics — events page | ✅ | Tab in `/analytics` — multi-line chart + table, name filter, drill-down link |
| Drill-down page | ✅ | `/analytics/[eventId]` — KPI row, by-day bar chart, per-user table, property breakdown |
| Supporting infra | ✅ | `lib/apiFetch.ts`, `hooks/useAnalytics.ts` (useKpis/useFeatures/useEvents/useEventDrillDown), `charts/EventLineChart.tsx`, `charts/SparklineChart.tsx` |
| Production build — all 11 routes | ✅ | `tsc --noEmit` ✅ · `npm run build` ✅ · `/analytics/[eventId]` dynamic ƒ confirmed |

## Phase 5 — Management & Export

| Task | Status | Notes |
|---|---|---|
| User management page | ✅ | `/users` — table with avatar/role/joined; invite dialog (POST); click-role dropdown (PUT); remove button (DELETE); self-edit guarded |
| Admin Users page | ✅ | `/admin/users` — org selector (all tenants); reads users for selected org via `X-Org-Id` override; read-only view |
| Tenant management page | ✅ | `/admin/tenants` — table with plan badge, user count, status; activate/deactivate toggle (PUT); super_admin only |
| Reports + CSV export page | ✅ | `/reports` — metric checkboxes (dau/mau/revenue/conversions/features), date range picker, export triggers download via Blob; manager+ only |
| Supporting hooks | ✅ | `hooks/useUsers.ts` (useUsers/useInviteUser/useUpdateUserRole/useRemoveUser), `hooks/useTenants.ts` (useTenants/useToggleTenant) |
| Bug fix — DropdownMenuLabel Base UI context | ✅ | Wrapped `MenuPrimitive.GroupLabel` in `MenuPrimitive.Group` inside `DropdownMenuLabel` — fixes MenuGroupRootContext crash in OrgSwitcher + Header |
| Production build — all 11 routes | ✅ | `tsc --noEmit` ✅ · `npm run build` ✅ · all routes confirmed |

## Gap-fill — Feature Completeness Pass

| Task | Status | Notes |
|---|---|---|
| KPI cards — % change for all 4 metrics | ✅ | Added `dauGrowth`, `mauGrowth`, `conversionRateGrowth` to `KpiSummary` type + MSW generator; all 4 cards now show trend arrow + % |
| Feature drill-down link | ✅ | Feature table rows now link to `/analytics/[featureId]`; MSW generator extended with `ALL_DRILLDOWN_DEFS` to resolve both event and feature IDs |
| Tenant detail panel | ✅ | Click any tenant row to inline-expand: shows slug, plan, member count, created date, primary colour swatch |
| Reports viewer UX | ✅ | Viewers see a locked state card (lock icon + message) instead of disabled checkboxes; canExport branch hides the entire metric selection UI |
| Production build — gap-fill pass | ✅ | `tsc --noEmit` ✅ · `npm run build` ✅ |

---

## Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-05-02 | MSW for mock backend | No real backend yet; MSW allows seamless swap later |
| 2026-05-02 | JWT session strategy | Stateless; required for Vercel Edge middleware |
| 2026-05-02 | orgId in Redux (not session only) | Org switching must update without full re-auth |
| 2026-05-02 | next-themes for dark mode | ShadCN recommended; handles SSR flicker with suppressHydrationWarning |
| 2026-05-02 | papaparse for CSV export | Lightweight, browser-native, no server round-trip |
| 2026-05-02 | Scaffolded in scaffold-tmp then moved up | create-next-app rejects dirs with existing files |
| 2026-05-02 | Tailwind v4 (not v3) | create-next-app latest defaults to v4; ShadCN supports it |
| 2026-05-02 | Formatters co-located in lib/utils.ts | Single import path; avoids a dedicated formatters module for small set |
| 2026-05-02 | `apiFetch()` utility for org header injection | Centralises X-Org-Id header; no per-component boilerplate |
| 2026-05-02 | Deterministic MSW seed generation | Same orgId + date range always returns same data; no persistent mock storage needed |
| 2026-05-02 | `super_admin` not assignable via UI | Prevents privilege escalation; provisioned only at seed level |
