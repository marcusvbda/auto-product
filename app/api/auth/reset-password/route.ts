import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hashToken, hashPassword } from '@/lib/auth/password'

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { token, password } = parsed.data
  const tokenHash = hashToken(token)

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  })

  if (!record || record.used || record.expiresAt < new Date()) {
    return Response.json({ error: 'This link has expired. Please request a new one.' }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { used: true },
    }),
    prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
  ])

  return Response.json({ data: { message: 'Password updated.' } })
}
