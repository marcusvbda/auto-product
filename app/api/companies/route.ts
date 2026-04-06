import { z } from 'zod'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth/server'
import { slugify } from '@/lib/utils'
import { createAccessToken, createRefreshToken } from '@/lib/auth/tokens'
import { setAuthCookies } from '@/lib/auth/cookies'
import { hashToken } from '@/lib/auth/password'

const schema = z.object({
  name: z.string().min(2).max(100),
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
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const baseSlug = slugify(parsed.data.name)
  const existing = await prisma.company.findUnique({ where: { slug: baseSlug } })
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

  const company = await prisma.company.create({
    data: {
      name: parsed.data.name,
      slug,
      members: {
        create: { userId, role: 'OWNER' },
      },
    },
  })

  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken({ userId, companyId: company.id, role: 'OWNER' }),
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

  const response = NextResponse.json({ data: company }, { status: 201 })
  setAuthCookies(response, { accessToken, refreshToken })
  return response
}
