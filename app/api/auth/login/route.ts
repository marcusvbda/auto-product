import { z } from 'zod'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { createAccessToken, createRefreshToken } from '@/lib/auth/tokens'
import { setAuthCookies } from '@/lib/auth/cookies'
import { hashToken, generateToken } from '@/lib/auth/password'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid credentials' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { company: true },
        orderBy: { company: { createdAt: 'asc' } },
        take: 1,
      },
    },
  })

  if (!user) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const membership = user.memberships[0]
  const companyId = membership?.companyId ?? ''
  const role = membership?.role ?? 'MEMBER'

  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken({ userId: user.id, companyId, role }),
    createRefreshToken({ userId: user.id }),
  ])

  const rawRefresh = generateToken()
  const refreshHash = hashToken(refreshToken)
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  const response = NextResponse.json({
    data: {
      user: { id: user.id, email: user.email, name: user.name, emailVerified: user.emailVerified },
    },
  })

  setAuthCookies(response, { accessToken, refreshToken })

  return response
}
