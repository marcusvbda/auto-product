---
name: auth-jwt
description: JWT authentication flow for this SaaS bootstrap. Apply when working with auth routes, token generation/validation, refresh logic, proxy middleware, email confirmation, or password management.
user-invocable: false
---

# JWT Authentication

## Architecture

```
User submits credentials
  → POST /api/auth/login
  → Validate with Zod
  → Check email + bcrypt.compare(password, hash)
  → Check emailVerified
  → Generate accessToken (15min) + refreshToken (7d)
  → Set both as httpOnly cookies
  → Return user data (no tokens in body)

Subsequent requests:
  → proxy.ts reads accessToken cookie
  → Verifies JWT signature
  → If expired → try refreshToken cookie
  → If refreshToken valid → issue new accessToken + rotated refreshToken
  → Inject userId + companyId into request headers
  → Route handler reads from headers (never from cookies directly)
```

## Token Generation

```ts
// lib/auth/tokens.ts
import { SignJWT, jwtVerify } from 'jose'

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)

export async function createAccessToken(payload: { userId: string; companyId: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET)
}

export async function createRefreshToken(payload: { userId: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET)
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_SECRET)
  return payload as { userId: string; companyId: string }
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, REFRESH_SECRET)
  return payload as { userId: string }
}
```

## Cookie Helpers

```ts
// lib/auth/cookies.ts
export const AUTH_COOKIES = {
  ACCESS: 'auth_token',
  REFRESH: 'auth_refresh',
}

export function setAuthCookies(
  response: Response,
  { accessToken, refreshToken }: { accessToken: string; refreshToken: string }
) {
  response.headers.append('Set-Cookie',
    `${AUTH_COOKIES.ACCESS}=${accessToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*15}; Path=/`
  )
  response.headers.append('Set-Cookie',
    `${AUTH_COOKIES.REFRESH}=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*60*24*7}; Path=/api/auth/refresh`
  )
}

export function clearAuthCookies(response: Response) {
  response.headers.append('Set-Cookie', `${AUTH_COOKIES.ACCESS}=; HttpOnly; Max-Age=0; Path=/`)
  response.headers.append('Set-Cookie', `${AUTH_COOKIES.REFRESH}=; HttpOnly; Max-Age=0; Path=/api/auth/refresh`)
}
```

## proxy.ts (Route Protection)

```ts
// proxy.ts — Next.js 16 middleware equivalent
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, verifyRefreshToken, createAccessToken } from '@/lib/auth/tokens'

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/api/auth/']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  const accessToken = req.cookies.get('auth_token')?.value
  const refreshToken = req.cookies.get('auth_refresh')?.value

  // Try access token
  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken)
      const headers = new Headers(req.headers)
      headers.set('x-user-id', payload.userId)
      headers.set('x-company-id', payload.companyId)
      return NextResponse.next({ request: { headers } })
    } catch {}
  }

  // Try refresh token
  if (refreshToken) {
    try {
      const payload = await verifyRefreshToken(refreshToken)
      const user = await getUserWithActiveCompany(payload.userId)
      const newAccessToken = await createAccessToken({ userId: user.id, companyId: user.activeCompanyId })
      const response = NextResponse.next()
      setNewAccessCookie(response, newAccessToken)
      return response
    } catch {}
  }

  if (!isPublic) return NextResponse.redirect(new URL('/login', req.url))
  return NextResponse.next()
}
```

## Email Confirmation Flow

1. Register → create user with `emailVerified: false` → generate confirmation token → send email via Resend
2. User clicks link → `GET /api/auth/confirm-email?token=...` → verify token → set `emailVerified: true`
3. proxy.ts checks `emailVerified` → redirect to `/confirm-email` page if not confirmed
4. Use `crypto.randomBytes(32).toString('hex')` for confirmation tokens, store hashed in DB with expiry

## Password Reset Flow

1. `POST /api/auth/forgot-password` with email → generate reset token → send email (always return 200 to prevent enumeration)
2. `POST /api/auth/reset-password` with token + new password → verify token not expired → hash new password → invalidate token

## Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/register` | POST | No | Create account |
| `/api/auth/login` | POST | No | Issue tokens |
| `/api/auth/logout` | POST | Yes | Clear cookies |
| `/api/auth/refresh` | POST | No | Rotate tokens |
| `/api/auth/confirm-email` | GET | No | Verify email |
| `/api/auth/forgot-password` | POST | No | Send reset email |
| `/api/auth/reset-password` | POST | No | Apply new password |

## Social Login (Optional)

Configure OAuth providers via env vars:
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Implement OAuth callback → create or find user → issue JWT cookies.
