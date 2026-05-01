# API Design — Multi-Tenant Analytics Dashboard

## Overview

All API routes follow REST conventions. In development, every request is intercepted by MSW (Mock Service Worker) running in the browser — no real server is required. The handler signatures are designed to be identical to what a real backend would expose, making the swap seamless.

**Base URL (development):** `http://localhost:3000/api`
**Base URL (production):** `https://<your-domain>/api`

---

## General Conventions

### Authentication

Every protected endpoint expects a valid NextAuth session. In practice this means the browser sends the `next-auth.session-token` cookie automatically. MSW reads the mock session state to resolve the current user and role.

In a real backend, the session token would be verified via JWT middleware and the resolved user attached to the request context.

### Org Scoping — `X-Org-Id` Header

All data endpoints are org-scoped. The frontend attaches the active org on every request:

```
X-Org-Id: org_001
```

**How the header is set:** The React Query fetch wrapper reads `activeOrgId` from Redux state and injects the header before every request. This is centralized in a single `apiFetch()` utility so no individual component manages it.

**Super admin override:** A `super_admin` user may also pass `?orgId=<target>` as a query parameter to inspect a specific org's data without switching their session context. Handlers check for this parameter first and fall back to `X-Org-Id`.

### Date Range Parameters

Analytics endpoints accept optional date range filters:

| Parameter | Format | Example | Default |
|---|---|---|---|
| `from` | `YYYY-MM-DD` | `2024-01-01` | 30 days ago |
| `to` | `YYYY-MM-DD` | `2024-01-31` | today |

### Response Envelope

Successful responses return JSON directly (no wrapper envelope). Errors follow a consistent shape:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Success with body |
| `201 Created` | Resource created |
| `204 No Content` | Success with no body (DELETE) |
| `400 Bad Request` | Invalid parameters |
| `401 Unauthorized` | No valid session |
| `403 Forbidden` | Authenticated but insufficient role |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Duplicate resource (e.g. email already in org) |

---

## Analytics Endpoints

### `GET /api/analytics/kpis`

Returns KPI summary for the active org over the requested date range.

**Required role:** `viewer` (any role)

**Request:**
```
GET /api/analytics/kpis?from=2024-01-01&to=2024-01-31
X-Org-Id: org_001
```

**Response `200`:**
```json
{
  "orgId": "org_001",
  "period": {
    "from": "2024-01-01",
    "to": "2024-01-31"
  },
  "dauCurrent": 312,
  "mau": 2840,
  "dau": [
    { "date": "2024-01-01", "value": 280 },
    { "date": "2024-01-02", "value": 295 }
  ],
  "revenue": 42000,
  "revenueGrowth": 8.4,
  "conversions": 186,
  "conversionRate": 6.5,
  "activeFeatures": 12
}
```

---

### `GET /api/analytics/features`

Returns feature usage ranked by total usage count.

**Required role:** `viewer`

**Request:**
```
GET /api/analytics/features?from=2024-01-01&to=2024-01-31&category=core
X-Org-Id: org_001
```

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `from` | string | No | Date range start |
| `to` | string | No | Date range end |
| `category` | string | No | Filter by feature category |

**Response `200`:**
```json
{
  "features": [
    {
      "featureId": "feat_export",
      "featureName": "CSV Export",
      "usageCount": 1240,
      "uniqueUsers": 87,
      "category": "reporting",
      "trend": [
        { "date": "2024-01-01", "value": 38 },
        { "date": "2024-01-02", "value": 44 }
      ]
    }
  ]
}
```

---

### `GET /api/analytics/events`

Returns all custom events for the org as time-series data.

**Required role:** `viewer`

**Request:**
```
GET /api/analytics/events?from=2024-01-01&to=2024-01-31
X-Org-Id: org_001
```

**Response `200`:**
```json
{
  "events": [
    {
      "eventId": "evt_button_click",
      "eventName": "button_click",
      "orgId": "org_001",
      "count": 5832,
      "uniqueUsers": 204,
      "series": [
        { "date": "2024-01-01", "value": 180 }
      ]
    }
  ]
}
```

---

### `GET /api/analytics/events/:eventId`

Returns detailed drill-down data for a single event.

**Required role:** `viewer`

**Request:**
```
GET /api/analytics/events/evt_button_click?from=2024-01-01&to=2024-01-31
X-Org-Id: org_001
```

**Response `200`:**
```json
{
  "eventId": "evt_button_click",
  "eventName": "button_click",
  "orgId": "org_001",
  "period": { "from": "2024-01-01", "to": "2024-01-31" },
  "totalCount": 5832,
  "byDay": [
    { "date": "2024-01-01", "value": 180 }
  ],
  "byUser": [
    {
      "userId": "user_002",
      "userName": "Alice Admin",
      "count": 412,
      "lastSeen": "2024-01-31T14:22:00Z"
    }
  ],
  "properties": [
    {
      "key": "button_label",
      "values": [
        { "label": "Submit", "count": 3200 },
        { "label": "Cancel", "count": 2632 }
      ]
    }
  ]
}
```

**Error `404`:**
```json
{ "error": "NOT_FOUND", "message": "Event evt_unknown not found for this org" }
```

---

## Reports Endpoints

### `GET /api/reports/export`

Returns a CSV string for the selected metrics and date range.

**Required role:** `manager`

**Request:**
```
GET /api/reports/export?metrics=dau,revenue&from=2024-01-01&to=2024-01-31
X-Org-Id: org_001
```

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `metrics` | string | Yes | Comma-separated: `dau`, `mau`, `revenue`, `conversions`, `features` |
| `from` | string | Yes | Date range start |
| `to` | string | Yes | Date range end |

**Response `200`:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="report-org_001-2024-01-01.csv"

date,dau,revenue
2024-01-01,280,1340
2024-01-02,295,1410
```

**Error `400`:**
```json
{ "error": "INVALID_METRICS", "message": "Unknown metric: 'foo'. Valid: dau, mau, revenue, conversions, features" }
```

**Error `403`:**
```json
{ "error": "FORBIDDEN", "message": "Insufficient role for this operation" }
```

> **Implementation note:** In production this endpoint streams a real CSV from the database. In the MSW mock, `papaparse.unparse()` generates the CSV client-side from seed data and the response is a plain string. The frontend `ExportButton` component triggers a download by creating a `Blob` and a temporary anchor element.

---

## User Management Endpoints

### `GET /api/users`

Returns all users in the active org.

**Required role:** `admin`  
**Super admin:** returns users for the org specified in `X-Org-Id` (or `?orgId=` override).

**Request:**
```
GET /api/users
X-Org-Id: org_001
```

**Response `200`:**
```json
{
  "users": [
    {
      "id": "user_002",
      "email": "alice@acme.com",
      "name": "Alice Admin",
      "avatarUrl": null,
      "role": "admin",
      "joinedAt": "2024-02-01"
    }
  ]
}
```

> Note: `role` here is the user's role **within the requested org** (derived from `orgs[]`), not a global field.

---

### `POST /api/users`

Invites a new user to the active org. In the mock, this adds the user to the seed store in memory.

**Required role:** `admin`

**Request body:**
```json
{
  "email": "newuser@acme.com",
  "name": "New User",
  "role": "viewer"
}
```

**Validation rules:**
- `email` must be a valid email address
- `role` must be one of `viewer`, `manager`, `admin`
- Requestor cannot assign a role higher than their own
- Duplicate email within the org returns `409`

**Response `201`:**
```json
{
  "id": "user_006",
  "email": "newuser@acme.com",
  "name": "New User",
  "avatarUrl": null,
  "role": "viewer",
  "joinedAt": "2024-02-15"
}
```

---

### `PUT /api/users/:userId`

Updates a user's role within the active org.

**Required role:** `admin`

**Request body:**
```json
{
  "role": "manager"
}
```

**Validation rules:**
- Can only update role (name, email are immutable via this endpoint)
- Requestor cannot assign a role equal to or higher than `super_admin`
- Cannot change your own role

**Response `200`:** Updated user object (same shape as `GET /api/users` item).

**Error `403`:**
```json
{ "error": "FORBIDDEN", "message": "Cannot assign a role equal to or higher than your own" }
```

---

### `DELETE /api/users/:userId`

Removes a user from the active org. Does not delete the user account globally.

**Required role:** `admin`

**Request:**
```
DELETE /api/users/user_005
X-Org-Id: org_001
```

**Response `204`:** No body.

**Error `403` (self-removal):**
```json
{ "error": "FORBIDDEN", "message": "You cannot remove yourself from the org" }
```

---

## Tenant Management Endpoints

### `GET /api/tenants`

Returns all tenants on the platform.

**Required role:** `super_admin`

**Response `200`:**
```json
{
  "tenants": [
    {
      "id": "org_001",
      "name": "Acme Corp",
      "slug": "acme",
      "logoUrl": null,
      "primaryColor": "#6366f1",
      "plan": "enterprise",
      "createdAt": "2024-01-01",
      "isActive": true,
      "userCount": 3
    }
  ]
}
```

---

### `GET /api/tenants/:tenantId`

Returns a single tenant's detail.

**Required role:** `super_admin`

**Response `200`:** Single tenant object (same shape as above, without `userCount` wrapping).

---

### `PUT /api/tenants/:tenantId`

Updates tenant metadata. Currently supports toggling `isActive`.

**Required role:** `super_admin`

**Request body:**
```json
{
  "isActive": false
}
```

**Response `200`:** Updated tenant object.

> **Side effect:** Deactivating a tenant (`isActive: false`) causes all analytics endpoints for that org to return `403` with `{ "error": "TENANT_INACTIVE" }`.

---

## Auth Endpoints

Auth is handled entirely by NextAuth. There are no custom `/api/auth/*` routes beyond the NextAuth catch-all.

### `POST /api/auth/callback/credentials`

Handled by NextAuth internally. Validates credentials against the mock user store in `lib/auth.ts` and issues a JWT session cookie.

**Request body (form-encoded by NextAuth):**
```
email=alice@acme.com&password=password&csrfToken=...
```

**Success:** Redirects to `/overview` (or `callbackUrl` if present).  
**Failure:** Redirects to `/login?error=CredentialsSignin`.

---

## orgId Handling Summary

| Scenario | How orgId is determined |
|---|---|
| Normal user (any role) | `X-Org-Id` header, set from Redux `activeOrgId` |
| Super admin viewing own org | Same — `X-Org-Id` |
| Super admin inspecting another org | `?orgId=<target>` query param overrides `X-Org-Id` |
| Org switched by user | Redux dispatch → all queries invalidated → new `X-Org-Id` on next fetch |
| Refresh / new tab | `activeOrgId` re-seeded from `session.user.activeOrgId` (JWT) |

---

## Central Fetch Utility

All frontend data fetching goes through a single `apiFetch()` function that:
1. Reads `activeOrgId` from the Redux store
2. Injects `X-Org-Id` header
3. Adds `Content-Type: application/json` on mutations
4. Throws a typed `ApiError` on non-2xx responses

```typescript
// src/lib/apiFetch.ts  (to be created in Phase 2)
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const orgId = store.getState().tenant.activeOrgId
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Org-Id': orgId ?? '',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json()
    throw { ...err, status: res.status } satisfies ApiError
  }
  return res.json() as Promise<T>
}
```

React Query hooks call `apiFetch()` — they never call `fetch()` directly. This ensures every request carries the correct org header without any per-component boilerplate.

---

## MSW Handler Pattern

Every handler follows this structure to enforce org isolation consistently:

```typescript
// src/mocks/handlers/analytics.ts
http.get('/api/analytics/kpis', ({ request }) => {
  const orgId = request.headers.get('X-Org-Id')
  const url = new URL(request.url)
  const from = url.searchParams.get('from') ?? defaultFrom
  const to = url.searchParams.get('to') ?? defaultTo

  if (!orgId) {
    return HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const data = generateKpis(orgId, from, to)  // deterministic from seed
  return HttpResponse.json(data)
})
```

Deterministic seed generation means the same orgId + date range always returns the same data — making the mock predictable across sessions without persistent storage.
