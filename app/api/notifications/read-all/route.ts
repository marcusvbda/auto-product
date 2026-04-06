import { prisma } from '@/lib/db'
import { getTenant } from '@/lib/auth/server'

export async function PATCH(req: Request) {
  let userId: string
  let companyId: string
  try {
    const tenant = getTenant(req)
    userId = tenant.userId
    companyId = tenant.companyId
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.notification.updateMany({
    where: { userId, companyId, readAt: null },
    data: { readAt: new Date() },
  })

  return Response.json({ data: { ok: true } })
}
