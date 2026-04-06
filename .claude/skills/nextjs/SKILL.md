---
name: nextjs
description: Next.js 16.2.2 App Router guidelines for this SaaS bootstrap. Apply when working with routing, layouts, server/client components, API routes, middleware (proxy.ts), images, or build config.
user-invocable: false
---

# Next.js 16 — App Router

## Stack

- Next.js 16.2.2 (App Router + Turbopack)
- React 19
- TypeScript strict
- Deployment: Vercel (primary) or Node.js server

## Route Groups

```
app/
  (auth)/           # Unauthenticated only — redirect to /app if logged in
  (marketing)/      # Fully public
  (protected)/      # Protected — requires auth + email confirmed
  api/              # Route Handlers
```

## Route Protection

Route protection lives in `proxy.ts` (replaces `middleware.ts` in Next.js 16):

- Check JWT from httpOnly cookie
- Redirect unauthenticated → `/login`
- Redirect unconfirmed email → `/confirm-email`
- Resolve active tenant (`companyId`) from cookie or DB
- Pass tenant context via request headers

## Server vs Client Components

- **Default: Server Component** — no `'use client'` directive
- Add `'use client'` only when you need: hooks, event handlers, browser APIs, React Query
- Co-locate server fetching in the page/layout, pass data as props to client components

## Data Fetching

```tsx
// Server component — direct Prisma or fetch with cache
const data = await prisma.user.findUnique({ where: { id } });

// Client component — React Query
const { data } = useQuery({ queryKey: ['key'], queryFn: fetchFn });
```

## API Route Handler Pattern

```ts
// app/api/resource/route.ts
export async function POST(req: Request) {
	const body = await req.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success)
		return Response.json({ error: parsed.error }, { status: 400 });
	// ... logic
	return Response.json({ data: result });
}
```

## Images

- Always `next/image` — never `<img>`
- Use `fill` prop for containers with unknown dimensions
- Always provide `alt`

## Environment Variables

- `NEXT_PUBLIC_*` — exposed to client bundle (never put secrets here)
- All others — server-only
- Validate all env vars at startup in `lib/env.ts` using Zod

## next.config.js

- CSP headers defined here
- Webpack/Turbopack config here
- Never modify without explicit request

## Session in Dashboard Pages (Mandatory)

Every dashboard page reads the session with exactly one call — never inline cookie+verify:

```ts
import { getSession } from '@/lib/auth/session';

export default async function MyPage() {
	const { userId, companyId, role } = await getSession();
	// ... use userId / companyId for DB queries
}
```

`getSession()` is defined in `lib/auth/session.ts` and automatically redirects to `/login` if the token is missing or invalid. Never repeat the raw `cookies()` + `verifyAccessToken()` pattern inside a page.

## Rules

- New routes always in App Router (`app/`) — never Pages Router
- Layouts in `layout.tsx`, not in page components
- Loading states in `loading.tsx` (uses React Suspense)
- Error boundaries in `error.tsx`
- Use `notFound()` from `next/navigation` for 404s
- Use `redirect()` from `next/navigation` for server-side redirects
