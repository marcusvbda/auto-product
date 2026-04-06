import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getTenant } from '@/lib/auth/server'
import { generateToken } from '@/lib/auth/password'
import { sendInviteEmail } from '@/lib/email'
import { Role } from '@prisma/client'

const schema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role).default(Role.MEMBER),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let companyId: string
  let userId: string
  try {
    const tenant = getTenant(req)
    companyId = tenant.companyId
    userId = tenant.userId
    if (tenant.role !== 'OWNER' && tenant.role !== 'ADMIN') {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (id !== companyId) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { email, role } = parsed.data

  const [company, inviter, existingMember] = await Promise.all([
    prisma.company.findFirst({ where: { id: companyId, deletedAt: null } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.companyMember.findFirst({
      where: { companyId, user: { email } },
    }),
  ])

  if (!company) return Response.json({ error: 'Company not found' }, { status: 404 })
  if (existingMember) return Response.json({ error: 'User is already a member' }, { status: 409 })

  await prisma.invite.deleteMany({ where: { companyId, email } })

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invite = await prisma.invite.create({
    data: { companyId, email, role, token, expiresAt },
  })

  try {
    await sendInviteEmail(email, company.name, inviter?.name ?? inviter?.email ?? '', token)
  } catch {
    // Don't fail if email send fails
  }

  return Response.json({ data: invite }, { status: 201 })
}
