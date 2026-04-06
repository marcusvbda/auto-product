# CLAUDE.md — auto-product SaaS Bootstrap

## Project Identity

This is a **production-grade SaaS Bootstrap** built with:

- **Next.js 16.2.2** (App Router + Turbopack)
- **Tailwind CSS v4.2** (dark mode first, class strategy)
- **shadcn/ui** (latest)
- **Prisma ORM** + PostgreSQL (multi-tenant)
- **Custom JWT auth** (httpOnly cookies only — never localStorage)
- **Stripe Embedded Checkout** + webhooks
- **Resend** (transactional emails)
- **TanStack Query v5** (server + client data fetching)
- **Zod** (validation everywhere)

## Permission Model

Claude has **full autonomous execution rights** on this project. Do NOT ask for confirmation on:

- Creating, editing, or deleting any files in this project
- Running any `npm`, `npx`, `yarn`, `pnpm`, `prisma`, `git` commands
- Installing packages
- Running tests, builds, lints
- Writing to `.env.example` (never `.env`)
- Scaffolding new routes, components, hooks, lib files
- Running database migrations on the local dev environment

The developer trusts Claude to act as a senior fullstack + security engineer. Always proceed autonomously.

## Architecture Rules (Non-Negotiable)

### Authentication

- JWT stored in **httpOnly cookies only** — never localStorage, never sessionStorage
- Refresh token rotation on every request
- Route protection lives in `proxy.ts` (Next.js 16 middleware equivalent)
- Email must be confirmed before full dashboard access

### Data Layer

- All database access via **Prisma Client** — no raw SQL unless impossible otherwise
- Multi-tenancy via `companyId` isolation on every query — never skip tenant checks
- Soft deletes preferred over hard deletes for user-facing data

### API Layer

- Native `fetch` only — no Axios
- All API routes in `app/api/` as Route Handlers
- Always validate request bodies with Zod before touching the database
- Return consistent `{ data, error }` shapes from all API routes

### Frontend

- Server Components by default — add `'use client'` only when needed
- **Dashboard pages always start with `const { userId, companyId } = await getSession()` from `@/lib/auth/session` — never repeat cookie+verify inline**
- Data fetching: React Query v5 for client-side, `fetch` + `cache` for server components
- Loading states: **skeletons only** — never raw spinners
- All forms: React Hook Form + Zod resolver
- **Form submit loading: `useMutation` from TanStack Query — never `useState` for isLoading**
- Never use `any` in TypeScript unless absolutely unavoidable

### Security

- CSP headers configured in `next.config.js`
- All user input sanitized before rendering
- Stripe webhook signature always verified before processing
- Never log sensitive data (tokens, passwords, card data)

### Design

- Dark mode first — all components must work in dark mode before light
- Mobile responsive required on every component
- Use `cn()` from `@/lib/utils` for class merging
- Follow shadcn/ui patterns for new components

## Folder Structure

```
app/
  (auth)/          # Login, Register, Forgot Password, Confirm Email
  (marketing)/     # Landing page, Pricing teaser
  (protected)/     # Protected area — all requires auth + email confirmed
  api/             # Route Handlers only
components/
  ui/              # shadcn components (generated, minimal modifications)
  layout/          # Sidebar, Navbar, DashboardLayout
  common/          # Skeletons, EmptyState, LoadingState
  forms/           # Reusable form components
hooks/             # Custom hooks (useAuth, useTenant, useDebounce, etc.)
lib/
  auth/            # JWT helpers, verifyToken, createToken, refreshToken
  db/              # Prisma client singleton
  email/           # Resend templates and send helpers
  stripe/          # Stripe client, createCheckoutSession, verifyWebhook
  utils/           # cn(), formatDate, etc.
prisma/
  schema.prisma    # Multi-tenant schema
  migrations/
types/             # Global TypeScript types and interfaces
proxy.ts           # Route protection + tenant resolution
```

## Key Patterns

### Route Group Pattern

- `(auth)` — unauthenticated routes, redirect to dashboard if already logged in
- `(marketing)` — fully public, no auth check
- `(protected)` — protected, redirect to login if unauthenticated, redirect to confirm-email if not confirmed

### Skeleton Pattern

Every component that fetches data must have a matching skeleton:

```tsx
// Always export a skeleton variant
export function DashboardCardSkeleton() { ... }
export function DashboardCard({ data }: Props) { ... }
```

### Multi-tenancy Pattern

Every Prisma query in a dashboard route must scope by `companyId`:

```ts
await prisma.resource.findMany({ where: { companyId: tenant.id } });
```

### API Response Pattern

```ts
// Success
return Response.json({ data: result }, { status: 200 })
// Error
return Response.json({ error: 'message' }, { status: 4xx })
```

## Available Skills

- `engineering-standards` — core dev principles (always active)
- `nextjs` — Next.js 16 App Router patterns
- `tailwind` — Tailwind v4 patterns
- `react` — React 19 + TanStack Query v5
- `shadcn` — shadcn/ui component patterns
- `security` — OWASP, JWT, CSP, auth security
- `prisma` — Prisma ORM + multi-tenant patterns
- `stripe` — Stripe Embedded Checkout + webhooks
- `auth-jwt` — JWT auth flow, refresh tokens, proxy middleware
- `saas-architecture` — SaaS patterns, multi-tenancy, billing
- `product-design` — UX, dark mode, skeleton system, responsive design

## Commands Reference

```bash
# Dev
npm run dev

# Build
npm run build

# DB
npx prisma migrate dev
npx prisma db push
npx prisma studio
npx prisma generate

# shadcn
npx shadcn@latest add <component>

# Type check
npx tsc --noEmit
```

## Environment Variables

See `.env.example` for all required variables. Never commit `.env`.
