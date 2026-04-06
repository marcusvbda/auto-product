import { prisma } from '@/lib/db'
import { getTenant } from '@/lib/auth/server'

export async function GET(req: Request) {
  let userId: string
  let companyId: string
  let role: string
  try {
    const tenant = getTenant(req)
    userId = tenant.userId
    companyId = tenant.companyId
    role = tenant.role
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const company = await prisma.company.findFirst({
    where: { id: companyId, deletedAt: null },
    select: { id: true, name: true, slug: true, plan: true },
  })

  if (!company) return Response.json({ error: 'Company not found' }, { status: 404 })

  return Response.json({
    data: {
      userId,
      companyId: company.id,
      companyName: company.name,
      companySlug: company.slug,
      plan: company.plan,
      role,
    },
  })
}
