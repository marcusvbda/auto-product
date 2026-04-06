import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { hashToken } from '@/lib/auth/password'
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    redirect('/login?error=invalid_token')
  }

  const tokenHash = hashToken(token)
  const record = await prisma.emailConfirmToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!record || record.expiresAt < new Date()) {
    redirect('/login?error=token_expired')
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    }),
    prisma.emailConfirmToken.delete({ where: { tokenHash } }),
  ])

  redirect('/login?confirmed=1')
}
