import { NextResponse } from 'next/server'
import { clearAuthCookies, AUTH_COOKIES } from '@/lib/auth/cookies'
import { prisma } from '@/lib/db'
import { hashToken } from '@/lib/auth/password'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(AUTH_COOKIES.REFRESH)?.value

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken)
    await prisma.refreshToken.deleteMany({ where: { tokenHash } }).catch(() => {})
  }

  const response = NextResponse.json({ data: { message: 'Logged out' } })
  clearAuthCookies(response)
  return response
}
