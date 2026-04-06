import { prisma } from '@/lib/db'
import { getTenant } from '@/lib/auth/server'

const PAGE_SIZE = 10

export async function GET(req: Request) {
  let userId: string
  let companyId: string
  try {
    const tenant = getTenant(req)
    userId = tenant.userId
    companyId = tenant.companyId
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const cursor = url.searchParams.get('cursor') ?? undefined
  const filter = url.searchParams.get('filter') // 'unread' | null (all)

  const where = {
    userId,
    companyId,
    ...(filter === 'unread' ? { readAt: null } : {}),
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = notifications.length > PAGE_SIZE
  const items = hasMore ? notifications.slice(0, PAGE_SIZE) : notifications
  const nextCursor = hasMore ? items[items.length - 1].id : null

  const unreadCount = await prisma.notification.count({
    where: { userId, companyId, readAt: null },
  })

  return Response.json({ data: { items, nextCursor, unreadCount } })
}
