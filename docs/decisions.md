# Decisions — Multi-Tenant Analytics Dashboard

Rationale for every non-obvious technical choice made during development.

---

## D-01 · Scaffold workaround (scaffold-tmp → root)

**Decision:** `create-next-app` was run in a temp subdirectory `scaffold-tmp/`, then all files were moved to the project root.

**Why:** `create-next-app` refuses to scaffold into a directory that already contains files (the `ai/` folder existed). Moving afterward is identical to a direct scaffold.

---

## D-02 · Tailwind CSS v4 (not v3)

**Decision:** Tailwind v4 is used — `@import "tailwindcss"` syntax, no `tailwind.config.js`.

**Why:** `create-next-app@latest` (May 2026) defaults to Tailwind v4. ShadCN v4 supports it natively. Pinning to v3 would require manual downgrade and introduces future upgrade friction.

**Trade-off:** Tailwind v4 class syntax is mostly identical but the config approach differs (CSS-first vs JS config). ShadCN handles this transparently.

---

## D-03 · NextAuth JWT strategy (not database)

**Decision:** `session: { strategy: 'jwt' }` — sessions live in the JWT cookie, no database sessions table.

**Why:** Vercel Edge middleware can decode JWTs without a database round-trip. A database session strategy would require an adapter and a session store, unnecessary overhead for this project.

**Trade-off:** JWT sessions cannot be individually revoked (logout invalidates the client cookie, not a server record). Acceptable for a dashboard app.

---

## D-04 · Active org in Redux (not only in NextAuth session)

**Decision:** `activeOrgId` lives in Redux `tenantSlice`, initialized from the session on mount. Org switching updates Redux and invalidates React Query cache.

**Why:** Changing the active org should re-fetch all dashboard data without requiring a full re-authentication. NextAuth session update (via `update()`) works but causes a round-trip to the server and potential flash. Redux dispatch + `queryClient.invalidateQueries()` is instant.

**Trade-off:** Redux state is ephemeral (resets on refresh). On refresh, `activeOrgId` is re-seeded from the session. This is acceptable — users expect their dashboard state to persist at page level, not tab-close level.

---

## D-05 · MSW v2 for mock backend

**Decision:** MSW (Mock Service Worker) intercepts all `/api/*` requests in the browser and returns structured mock data.

**Why:** Zero server setup required. MSW runs as a Service Worker in the browser. The API contract (handler signatures) is identical to what a real backend would expose, so switching to a real API is a drop-in: remove the MSW initialization and point fetchers at a real host.

**Trade-off:** MSW requires a `mockServiceWorker.js` file in `/public/`. Data is not persisted across page refreshes (resets to seed). Acceptable for a demo/prototype.

---

## D-06 · Formatters co-located in `lib/utils.ts`

**Decision:** `formatCurrency`, `formatNumber`, `formatPercent`, `formatDate` are added to the same file as `cn()`.

**Why:** The formatter set is small (4 functions). A separate `lib/formatters.ts` file provides no organizational benefit at this size. Single import path (`@/lib/utils`) reduces cognitive load.

**Threshold:** If formatters grow beyond ~10 functions, extract to `lib/formatters.ts`.

---

## D-07 · `next-themes` for dark mode

**Decision:** `ThemeProvider` from `next-themes` with `attribute="class"` drives Tailwind's `dark:` variant.

**Why:** This is ShadCN's recommended approach. `next-themes` handles SSR hydration mismatch (the reason for `suppressHydrationWarning` on `<html>`). It also persists the theme preference in `localStorage` automatically.

---

## D-08 · papaparse for CSV export (client-side)

**Decision:** Reports are exported to CSV in the browser using `papaparse`, not as a server-generated file.

**Why:** Avoids a dedicated export API endpoint. The data is already in the React Query cache on the client. papaparse produces a `Blob` → object URL → download link. Works offline and does not require server bandwidth.

**Trade-off:** Large exports (millions of rows) would be slow in the browser. Not a concern for this dataset size.

---

## D-12 · Next.js 16 renamed `middleware.ts` → `proxy.ts`

**Decision:** The route protection file is `src/proxy.ts`, not `src/middleware.ts`.

**Why:** Next.js 16 deprecated the `middleware.ts` file convention and replaced it with `proxy.ts`. Keeping `middleware.ts` produces a build warning and the export format changed to require a default export (not a named `middleware` export).

**How to apply:** Any doc or reference to "middleware.ts" should be read as "proxy.ts" in this project.

---

## D-13 · Auth config split: `auth.config.ts` + `auth.ts`

**Decision:** Auth configuration is split into two files. `auth.config.ts` is edge-safe and contains the `authorized` (RBAC), `jwt`, and `session` callbacks. `auth.ts` spreads it and adds the Credentials provider.

**Why:** The Credentials provider's `authorize` function may reference Node.js APIs (bcrypt, database drivers). These cannot run in the Edge runtime used by `proxy.ts`. By separating the config, the middleware imports only the edge-safe subset. This is the official NextAuth v5 pattern.

---

## D-14 · MSW seed data is a mutable in-memory array

**Decision:** `seedUsers` (and `seedTenants` for the `isActive` flag) are plain exported arrays. POST/PUT/DELETE handlers mutate them directly.

**Why:** MSW has no persistence layer. Mutations need to survive across requests within a single browser session (until page refresh). Mutable module-level arrays are the simplest mechanism. Data resets on refresh, which is intentional and documented.

**Trade-off:** Multiple browser tabs share the same Service Worker scope but separate module states — mutations in one tab are not reflected in another. Acceptable for a demo.

---

## D-15 · Deterministic analytics generation (Park-Miller PRNG)

**Decision:** All analytics data is generated deterministically from a seed derived from `orgId + dateRange`. The same inputs always produce the same output.

**Why:** Prevents confusing data changes on re-render or component remount. Makes the UI predictable for demos. Avoids the need for a database or even a static fixture file — any orgId that gets added automatically gets plausible data.

---

## D-16 · `SessionSync` as a renderless component (not a hook)

**Decision:** The NextAuth → Redux bridge is a renderless component (`<SessionSync />`) placed inside `AppProviders`, rather than a custom hook called from each page.

**Why:** A hook would require every page component to call it, creating a footgun where pages added later forget to sync the session. A single component in the provider tree guarantees it always runs.

---

## D-17 · `MSWProvider` delays rendering until service worker is registered

**Decision:** `MSWProvider` returns `null` until `worker.start()` resolves (~50ms on first load).

**Why:** Without this guard, the first few React Query fetches race against MSW registration and hit the real network (returning 404). The brief null state is invisible in practice but prevents confusing error states.

**Trade-off:** In production `isDev = false` so the guard is skipped entirely — no performance impact.

---

## D-10 · axios instead of native `fetch` for the HTTP client

**Decision:** All API calls go through a central `axiosInstance` (not the native `fetch` or a custom `apiFetch` wrapper).

**Why:** axios provides a cleaner interceptor API for injecting headers on every request, transforming error shapes, and handling 401 redirects — all in one place. The equivalent with `fetch` requires manual wrapping and is more verbose to test.

**How the circular dependency is avoided:** The request interceptor lazily `require()`s the Redux store at call-time rather than at module init time. This prevents `axiosInstance → store → slice → axiosInstance` circular import during module resolution.

---

## D-11 · `TenantThemeProvider` reads from Redux (not from session)

**Decision:** `TenantThemeProvider` reads `activeOrgId` and `orgs` from Redux state, not from `useSession()`.

**Why:** The org list (including `primaryColor`) is stored in Redux `tenantSlice` alongside `activeOrgId`. Reading both from the same source keeps the logic consistent and avoids a second hook dependency. The session JWT does not carry the full `Tenant` objects (only `orgId` and `role` in `OrgMembership[]`), so the session alone is insufficient for theming.

---

## D-09 · Role rank comparison (numeric) in `useRole`

**Decision:** Roles are mapped to integers (`super_admin=4, admin=3, manager=2, viewer=1`) and `hasRole(required)` checks `ROLE_RANK[current] >= ROLE_RANK[required]`.

**Why:** Avoids long chains of `role === 'super_admin' || role === 'admin' || ...` everywhere. Single call `hasRole('manager')` returns true for manager, admin, and super_admin.

**Trade-off:** Assumes strict linear role hierarchy. If non-linear permissions are ever needed (e.g., a `billing_admin` role orthogonal to the org hierarchy), this model would need replacing with a permission matrix.
