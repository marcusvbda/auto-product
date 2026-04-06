import { z } from 'zod'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth/server'
import { createAccessToken, createRefreshToken } from '@/lib/auth/tokens'
import { setAuthCookies } from '@/lib/auth/cookies'
import { hashToken } from '@/lib/auth/password'

const schema = z.object({
  token: z.string().min(1),
})

export async function POST(req: Request) {
  let userId: string
  try {
    userId = getUserId(req)
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid token' }, { status: 400 })
  }

  const invite = await prisma.invite.findUnique({
    where: { token: parsed.data.token },
    include: { company: { select: { id: true, name: true, deletedAt: true } } },
  })

  if (!invite) {
    return Response.json({ error: 'Invitation not found' }, { status: 404 })
  }

  if (invite.accepted) {
    return Response.json({ error: 'Invitation already accepted' }, { status: 409 })
  }

  if (invite.expiresAt < new Date()) {
    return Response.json({ error: 'Invitation has expired' }, { status: 410 })
  }

  if (invite.company.deletedAt) {
    return Response.json({ error: 'Company no longer exists' }, { status: 404 })
  }

  const existingMembership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId: invite.companyId } },
  })

  if (existingMembership) {
    return Response.json({ error: 'You are already a member of this workspace' }, { status: 409 })
  }

  await prisma.$transaction([
    prisma.companyMember.create({
      data: { userId, companyId: invite.companyId, role: invite.role },
    }),
    prisma.invite.update({
      where: { id: invite.id },
      data: { accepted: true },
    }),
  ])

  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken({ userId, companyId: invite.companyId, role: invite.role }),
    createRefreshToken({ userId }),
  ])

  await prisma.refreshToken.deleteMany({ where: { userId } })
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  const response = NextResponse.json({ data: { companyId: invite.companyId } }, { status: 200 })
  setAuthCookies(response, { accessToken, refreshToken })
  return response
}
