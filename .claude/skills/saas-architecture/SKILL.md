---
name: saas-architecture
description: SaaS patterns and multi-tenancy architecture for this bootstrap. Apply when designing features, data models, billing flows, invite systems, or tenant management.
user-invocable: false
---

# SaaS Architecture

## Multi-Tenancy Model

**Single database, row-level tenant isolation.**

- Each tenant = one `Company` record
- Users can belong to multiple companies (`CompanyMember` junction)
- Active company stored in JWT payload (`companyId`)
- Company switching = re-issue JWT with new `companyId`

```
User ←→ CompanyMember ←→ Company
                           ↓
                        Resources (scoped by companyId)
```

## User Lifecycle

```
Register
  → Create User (emailVerified: false)
  → Send confirmation email
  → Redirect to "check your email" page

Confirm Email
  → Set emailVerified: true
  → Auto-login (issue JWT)
  → Redirect to plan selection (if no company yet)

Plan Selection
  → Choose plan → go to Stripe checkout (or skip for Free)
  → On checkout.session.completed → Create Company → Create CompanyMember (OWNER)
  → Redirect to dashboard
```

## Company Invite Flow

```
Owner sends invite
  → POST /api/companies/:id/invites (email + role)
  → Create Invite record (token, expiresAt, companyId, email)
  → Send email via Resend with invite link

Invitee accepts
  → GET /invite?token=...
  → Verify token not expired and not used
  → If user exists → add CompanyMember
  → If not → redirect to register with email pre-filled → then add CompanyMember
  → Mark invite as accepted
```

## Plan / Feature Gating

```ts
// lib/billing/gates.ts
export const PLAN_LIMITS = {
  FREE:       { members: 1,  storage: '100MB', features: [] },
  PRO:        { members: 10, storage: '10GB',  features: ['invites', 'analytics'] },
  ENTERPRISE: { members: -1, storage: '1TB',   features: ['invites', 'analytics', 'sso', 'audit-log'] },
}

export function canAccess(plan: Plan, feature: string): boolean {
  return PLAN_LIMITS[plan].features.includes(feature)
}
```

## API Route Pattern

```
/api/auth/*           — unauthenticated
/api/stripe/*         — unauthenticated (webhook) or auth (checkout)
/api/user/*           — authenticated, user-scoped
/api/companies/*      — authenticated, company-scoped
/api/companies/:id/*  — authenticated, company-scoped, verify membership
```

## Tenant Resolution in Route Handlers

```ts
// lib/auth/server.ts — helper to get current tenant in route handlers
export function getTenant(req: Request): { userId: string; companyId: string } {
  const userId = req.headers.get('x-user-id')
  const companyId = req.headers.get('x-company-id')
  if (!userId || !companyId) throw new Error('Unauthorized')
  return { userId, companyId }
}
```

## Data Modeling Principles

- Use `cuid()` for all IDs — never sequential integers (prevents enumeration)
- All timestamps in UTC
- Soft deletes for user-visible data (`deletedAt DateTime?`)
- Audit fields: `createdBy`, `updatedBy` for critical resources
- Keep `User` lean — profile data in separate `UserProfile` model if it grows

## Email Notifications (Resend)

Transactional emails for:
- Email confirmation
- Password reset
- Invite to company
- Payment failed
- Subscription change (upgrade/downgrade)

All templates in `lib/email/templates/`. Use React Email or plain HTML.

## Dashboard Information Architecture

```
Dashboard Home        → KPIs, recent activity, quick actions
Settings
  → Profile           → name, email, password
  → Company           → name, logo, plan, members
  → Billing           → current plan, usage, upgrade, invoices
  → Invites           → send invite, pending invites
```
