---
name: security
description: Security engineering guidelines for this SaaS bootstrap. Apply when working with auth, API routes, user input, Stripe webhooks, data storage, or any sensitive operation. Enforces OWASP Top 10, JWT best practices, and SaaS-specific security patterns.
user-invocable: false
---

# Security Engineering

## Authentication Security

### JWT Rules
- Store JWT in `httpOnly`, `Secure`, `SameSite=Lax` cookies — **never localStorage**
- Short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
- Rotate refresh token on every use (refresh token rotation)
- Invalidate refresh tokens on logout — store revocation in DB or Redis
- Sign with RS256 (asymmetric) in production; HS256 acceptable in dev
- Never put sensitive data in JWT payload — use minimal claims (userId, companyId, role)

```ts
// Cookie config
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 15, // 15 min for access token
  path: '/',
}
```

### Password Rules
- Hash with `bcrypt` (cost factor 12)
- Never store or log plain text passwords
- Rate limit login attempts (5/min per IP)
- Constant-time comparison for token validation (`crypto.timingSafeEqual`)

## Input Validation

- Validate ALL API request bodies with Zod before touching the database
- Validate ALL query parameters — never trust `req.nextUrl.searchParams` raw
- Strip unknown fields (`z.object({}).strict()` or `.strip()`)
- Limit request body size in `next.config.js`

## Multi-Tenancy Security

- Every DB query must include `companyId` in the WHERE clause
- Resolve `companyId` from the verified JWT — never from request body or query params
- Verify user belongs to company before any CRUD operation

```ts
// Always scope queries
await prisma.resource.findFirst({
  where: { id: resourceId, companyId: tenant.companyId } // never skip companyId
})
```

## Stripe Webhook Security

```ts
// Always verify webhook signature
const event = stripe.webhooks.constructEvent(
  body,
  req.headers.get('stripe-signature')!,
  process.env.STRIPE_WEBHOOK_SECRET!
)
// If this throws, return 400 immediately
```

## API Security Headers (next.config.js)

```js
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // CSP — tighten as needed
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; frame-src https://js.stripe.com" },
]
```

## OWASP Top 10 Checklist

- **A01 Broken Access Control** → Tenant isolation on every query, proxy.ts protects all dashboard routes
- **A02 Cryptographic Failures** → httpOnly cookies, bcrypt passwords, HTTPS only
- **A03 Injection** → Prisma parameterized queries (never string-concatenated SQL)
- **A05 Security Misconfiguration** → Security headers, no debug info in production errors
- **A06 Vulnerable Components** → Keep dependencies updated, `npm audit` regularly
- **A07 Auth Failures** → JWT rotation, rate limiting, constant-time comparison
- **A08 Integrity Failures** → Stripe webhook verification, Zod validation
- **A09 Logging Failures** → Log security events, never log sensitive data

## Environment Variables

- Never expose secrets via `NEXT_PUBLIC_*`
- Validate all env vars at startup in `lib/env.ts`
- Use `.env.example` for documentation — never commit `.env`

## Error Responses

- Never leak stack traces or internal errors to clients in production
- Use generic error messages for auth failures (`'Invalid credentials'` not `'User not found'`)
- Log errors server-side with context, return minimal info to client

## Rate Limiting

Apply to:
- `/api/auth/login` — 5 attempts/min per IP
- `/api/auth/register` — 10/min per IP
- `/api/auth/forgot-password` — 3/min per IP
- Stripe webhook endpoint — let Stripe's retry logic handle it, verify signature always
