import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, verifyRefreshToken, createAccessToken } from '@/lib/auth/tokens'
import { AUTH_COOKIES } from '@/lib/auth/cookies'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/invite',
  '/api/auth/',
  '/api/stripe/webhook',
  '/_next/',
  '/favicon.ico',
]

const AUTH_ONLY_PATHS = ['/login', '/register', '/forgot-password']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p))
  const isDashboard = pathname.startsWith('/dashboard')
  const isOnboarding = pathname.startsWith('/onboarding')

  const accessToken = req.cookies.get(AUTH_COOKIES.ACCESS)?.value
  const refreshToken = req.cookies.get(AUTH_COOKIES.REFRESH)?.value

  let userId: string | null = null
  let companyId: string | null = null
  let role: string | null = null
  let newAccessToken: string | null = null

  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken)
      userId = payload.userId
      companyId = payload.companyId || null
      role = payload.role
    } catch {
      // access token invalid/expired — try refresh
    }
  }

  if (!userId && refreshToken) {
    try {
      const payload = await verifyRefreshToken(refreshToken)
      const { prisma } = await import('@/lib/db')

      const storedToken = await prisma.refreshToken.findFirst({
        where: { userId: payload.userId, expiresAt: { gt: new Date() } },
        include: {
          user: {
            include: {
              memberships: {
                include: { company: true },
                take: 1,
                orderBy: { company: { createdAt: 'asc' } },
              },
            },
          },
        },
      })

      if (storedToken) {
        userId = storedToken.userId
        const membership = storedToken.user.memberships[0]
        if (membership) {
          companyId = membership.companyId
          role = membership.role
          newAccessToken = await createAccessToken({ userId, companyId, role })
        }
      }
    } catch {
      // refresh token invalid
    }
  }

  const isAuthenticated = !!userId
  const hasCompany = !!companyId

  // Redirect logged-in users away from login/register pages
  if (isAuthenticated && isAuthOnly) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Require auth for dashboard and onboarding
  if (!isAuthenticated && (isDashboard || isOnboarding)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthenticated && (isDashboard || isOnboarding)) {
    const { prisma } = await import('@/lib/db')
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId! },
        select: { emailVerified: true },
      })

      // Must confirm email before anything else
      if (user && !user.emailVerified) {
        return NextResponse.redirect(new URL('/confirm-email', req.url))
      }

      // Must create a workspace before accessing dashboard
      if (!hasCompany && isDashboard) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }

      // If already has a company, skip onboarding
      if (hasCompany && isOnboarding) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    } catch {
      // DB error — allow through
    }
  }

  const headers = new Headers(req.headers)
  if (userId) headers.set('x-user-id', userId)
  if (companyId) headers.set('x-company-id', companyId)
  if (role) headers.set('x-user-role', role)

  const response = NextResponse.next({ request: { headers } })

  if (newAccessToken) {
    const IS_PROD = process.env.NODE_ENV === 'production'
    response.cookies.set(AUTH_COOKIES.ACCESS, newAccessToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
