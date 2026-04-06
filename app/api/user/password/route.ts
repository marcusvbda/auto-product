import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth/server'
import { verifyPassword, hashPassword } from '@/lib/auth/password'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  })
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 })

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash)
  if (!valid) {
    return Response.json({ error: 'Current password is incorrect' }, { status: 400 })
  }

  const newHash = await hashPassword(parsed.data.newPassword)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } })
  await prisma.refreshToken.deleteMany({ where: { userId } })

  return Response.json({ data: { message: 'Password updated' } })
}
