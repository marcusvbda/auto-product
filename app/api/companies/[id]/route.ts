import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getTenant } from '@/lib/auth/server'

const schema = z.object({
  name: z.string().min(2).max(100),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let companyId: string
  try {
    const tenant = getTenant(req)
    companyId = tenant.companyId
    if (tenant.role !== 'OWNER' && tenant.role !== 'ADMIN') {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (id !== companyId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const company = await prisma.company.update({
    where: { id: companyId, deletedAt: null },
    data: { name: parsed.data.name },
    select: { id: true, name: true, slug: true },
  })

  return Response.json({ data: company })
}
