import { z } from 'zod'
import { prisma } from '@/lib/db'
import { generateToken, hashToken } from '@/lib/auth/password'
import { sendPasswordResetEmail } from '@/lib/email'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ data: { message: 'If that email exists, a reset link is on its way.' } })
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (user) {
    const rawToken = generateToken()
    const tokenHash = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })

    try {
      await sendPasswordResetEmail(email, rawToken)
    } catch {
      // Don't leak if email send failed
    }
  }

  return Response.json({ data: { message: 'If that email exists, a reset link is on its way.' } })
}
