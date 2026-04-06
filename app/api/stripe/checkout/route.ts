import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { PLANS, type PlanKey } from '@/lib/stripe/plans'
import { prisma } from '@/lib/db'
import { getTenant } from '@/lib/auth/server'

const schema = z.object({
  planKey: z.enum(['PRO', 'ENTERPRISE']),
})

export async function POST(req: Request) {
  let userId: string
  let companyId: string
  try {
    const tenant = getTenant(req)
    userId = tenant.userId
    companyId = tenant.companyId
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { planKey } = parsed.data
  const plan = PLANS[planKey as PlanKey]

  if (!plan.priceId) {
    return Response.json({ error: 'This plan is not available for purchase' }, { status: 400 })
  }

  const [user, company] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
    prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
      select: { stripeCustomerId: true },
    }),
  ])

  if (!user || !company) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded_page' as const,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    mode: 'subscription',
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    customer_email: company.stripeCustomerId ? undefined : user.email,
    customer: company.stripeCustomerId ?? undefined,
    metadata: { companyId, planKey, userId },
  })

  return Response.json({ data: { clientSecret: session.client_secret } })
}
