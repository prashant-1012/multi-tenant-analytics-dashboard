@AGENTS.md

# Multi-Tenant Analytics Dashboard — Agent Instructions

## Stack (do not deviate)
- Next.js 16 App Router · TypeScript strict · Tailwind v4 · ShadCN UI v4
- Redux Toolkit (client state) · TanStack React Query v5 (server state)
- NextAuth v5 (JWT/credentials) · MSW v2 · Recharts · papaparse

## Folder conventions
| Path | Purpose |
|---|---|
| `src/app/` | Next.js routes (App Router) |
| `src/components/` | Shared UI, charts, dashboard shell |
| `src/features/<domain>/` | Redux slice + React Query hooks co-located |
| `src/hooks/` | `useAppDispatch`, `useAppSelector`, `useRole`, `useCurrentOrg` |
| `src/lib/` | auth config, store, queryClient, utilities |
| `src/mocks/` | MSW worker, handlers, seed data |
| `src/providers/` | AppProviders, TenantThemeProvider |
| `src/types/` | Shared TypeScript interfaces |
| `ai/` | Agent prompts and context files |
| `docs/` | Architecture, decisions, progress, API design |

## Critical conventions
- Every API call must include `X-Org-Id` header from Redux `activeOrgId`
- `useRole()` uses numeric rank — `hasRole('manager')` returns true for manager/admin/super_admin
- Org switching: dispatch Redux action → `queryClient.invalidateQueries()`
- Path alias: `@/*` maps to `src/*`
- Do NOT import directly from `redux` — use typed hooks from `src/hooks/redux.ts`

## Mock credentials (dev only)
| Email | Role | Org |
|---|---|---|
| admin@example.com | super_admin | — |
| alice@acme.com | admin | Acme (org_001) |
| bob@acme.com | manager | Acme (org_001) |
| carol@globex.com | admin | Globex (org_002) |
| dave@acme.com | viewer | Acme (org_001) |
All passwords: `password`

## Before writing any code
1. Read `docs/architecture.md` for the full folder tree
2. Read `docs/decisions.md` for why things are the way they are
3. Read `docs/progress.md` to see what is done vs. in-progress
4. Check `ai/master-prompt.md` for workflow rules

## Do not
- Generate the entire project at once — work phase by phase
- Skip updating `docs/progress.md` after completing a phase
- Add comments that explain *what* the code does — name things well instead
- Introduce backwards-compat shims; just change the code
