import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth/server'

const schema = z.object({
  name: z.string().min(2).max(100),
})

export async function PATCH(req: Request) {
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

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: parsed.data.name },
    select: { id: true, email: true, name: true },
  })

  return Response.json({ data: user })
}
