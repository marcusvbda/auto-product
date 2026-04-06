import { NextResponse } from 'next/server'
import { verifyRefreshToken, createAccessToken, createRefreshToken } from '@/lib/auth/tokens'
import { setAuthCookies, AUTH_COOKIES } from '@/lib/auth/cookies'
import { prisma } from '@/lib/db'
import { hashToken } from '@/lib/auth/password'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(AUTH_COOKIES.REFRESH)?.value

  if (!refreshToken) {
    return Response.json({ error: 'No refresh token' }, { status: 401 })
  }

  try {
    const payload = await verifyRefreshToken(refreshToken)
    const tokenHash = hashToken(refreshToken)

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            memberships: {
              orderBy: { company: { createdAt: 'asc' } },
              take: 1,
            },
          },
        },
      },
    })

    if (!stored || stored.expiresAt < new Date()) {
      return Response.json({ error: 'Invalid refresh token' }, { status: 401 })
    }

    const membership = stored.user.memberships[0]
    const companyId = membership?.companyId ?? ''
    const role = membership?.role ?? 'MEMBER'

    const [newAccess, newRefresh] = await Promise.all([
      createAccessToken({ userId: payload.userId, companyId, role }),
      createRefreshToken({ userId: payload.userId }),
    ])

    await prisma.refreshToken.delete({ where: { tokenHash } })
    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        tokenHash: hashToken(newRefresh),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const response = NextResponse.json({ data: { message: 'Refreshed' } })
    setAuthCookies(response, { accessToken: newAccess, refreshToken: newRefresh })
    return response
  } catch {
    return Response.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
