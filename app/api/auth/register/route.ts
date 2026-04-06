import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken, hashToken } from '@/lib/auth/password'
import { sendConfirmationEmail } from '@/lib/email'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, emailVerified: false },
  })

  const rawToken = generateToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.emailConfirmToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  })

  try {
    await sendConfirmationEmail(email, name, rawToken)
  } catch {
    // Don't fail registration if email fails
  }

  return Response.json({ data: { message: 'Account created. Check your email.' } }, { status: 201 })
}
