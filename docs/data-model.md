# Data Model — Multi-Tenant Analytics Dashboard

## Core Types

### Tenant (Organization)

```typescript
interface Tenant {
  id: string;                  // "org_abc123"
  name: string;                // "Acme Corp"
  slug: string;                // "acme" (URL-safe)
  logoUrl: string | null;
  primaryColor: string;        // "#3B82F6" (hex)
  plan: 'starter' | 'pro' | 'enterprise';
  createdAt: string;           // ISO 8601
  isActive: boolean;
}
```

### User

```typescript
interface User {
  id: string;                  // "user_xyz789"
  email: string;
  name: string;
  avatarUrl: string | null;
  orgs: OrgMembership[];       // belongs to multiple orgs
  createdAt: string;
}

interface OrgMembership {
  orgId: string;
  role: Role;
  joinedAt: string;
}

type Role = 'super_admin' | 'admin' | 'manager' | 'viewer';
```

### Session (NextAuth JWT payload)

```typescript
interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  orgs: OrgMembership[];
  activeOrgId: string;         // currently selected org
}
```

---

## Analytics Types

### KPI Summary

```typescript
interface KpiSummary {
  orgId: string;
  period: DateRange;
  dau: MetricPoint[];          // daily active users over period
  mau: number;                 // monthly active users (scalar)
  dauCurrent: number;          // today's DAU
  revenue: number;             // USD, simulated
  revenueGrowth: number;       // % vs previous period
  conversions: number;
  conversionRate: number;      // %
  activeFeatures: number;      // count of features used
}

interface MetricPoint {
  date: string;                // "2024-01-15"
  value: number;
}

interface DateRange {
  from: string;
  to: string;
}
```

### Feature Usage

```typescript
interface FeatureUsage {
  featureId: string;
  featureName: string;
  usageCount: number;
  uniqueUsers: number;
  trend: MetricPoint[];        // last 30 days
  category: string;
}
```

### Custom Event

```typescript
interface EventSeries {
  eventId: string;
  eventName: string;           // e.g. "button_click", "export_csv"
  orgId: string;
  count: number;
  uniqueUsers: number;
  series: MetricPoint[];       // time series
}

interface DrillDownData {
  eventId: string;
  eventName: string;
  orgId: string;
  period: DateRange;
  totalCount: number;
  byDay: MetricPoint[];
  byUser: UserEventStat[];
  properties: EventProperty[]; // key-value breakdown
}

interface UserEventStat {
  userId: string;
  userName: string;
  count: number;
  lastSeen: string;
}

interface EventProperty {
  key: string;
  values: { label: string; count: number }[];
}
```

---

## Redux State Shape

```typescript
// store.ts root state
interface RootState {
  tenant: TenantState;
  analytics: AnalyticsFilterState;
  auth: AuthState;
}

interface TenantState {
  activeOrgId: string | null;
  orgs: Tenant[];              // orgs the current user belongs to
}

interface AnalyticsFilterState {
  dateRange: DateRange;
  selectedMetrics: string[];
  granularity: 'day' | 'week' | 'month';
}

interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
}
```

---

## MSW Seed Data Summary

**Tenants (3):**
| id | name | plan |
|---|---|---|
| org_001 | Acme Corp | enterprise |
| org_002 | Globex Inc | pro |
| org_003 | Initech Ltd | starter |

**Users (5):**
| id | email | role in org_001 |
|---|---|---|
| user_001 | admin@example.com | super_admin |
| user_002 | alice@acme.com | admin |
| user_003 | bob@acme.com | manager |
| user_004 | carol@globex.com | admin |
| user_005 | dave@acme.com | viewer |

- user_001 belongs to all 3 orgs (super_admin)
- user_002, user_003, user_005 belong to org_001
- user_004 belongs to org_002

**Events (per org):** 90 days of synthetic time-series data generated deterministically from orgId seed.

**KPI ranges (simulated):**
- DAU: 50–500 (org size dependent)
- MAU: DAU × 8–12
- Revenue: $1k–$50k/month
- Conversion rate: 2–8%
