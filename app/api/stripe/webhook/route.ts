import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { sendPaymentFailedEmail } from '@/lib/email'
import Stripe from 'stripe'
import { Plan } from '@prisma/client'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return Response.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      case 'invoice.paid':
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', event.type, err)
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return Response.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const companyId = session.metadata?.companyId
  const planKey = session.metadata?.planKey as Plan | undefined

  if (!companyId || !planKey) return

  await prisma.company.update({
    where: { id: companyId },
    data: {
      plan: planKey,
      stripeCustomerId: session.customer as string,
      stripeSubId: session.subscription as string,
    },
  })
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const company = await prisma.company.findFirst({
    where: { stripeSubId: sub.id },
  })
  if (!company) return

  const priceId = sub.items.data[0]?.price.id
  const { PLANS } = await import('@/lib/stripe/plans')
  const planEntry = Object.entries(PLANS).find(([, p]) => p.priceId === priceId)
  const planKey = planEntry?.[0] as Plan | undefined

  if (planKey) {
    await prisma.company.update({
      where: { id: company.id },
      data: { plan: planKey },
    })
  }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  await prisma.company.updateMany({
    where: { stripeSubId: sub.id },
    data: { plan: 'FREE', stripeSubId: null },
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
    include: {
      members: {
        where: { role: 'OWNER' },
        include: { user: { select: { email: true } } },
      },
    },
  })
  if (!company) return

  const ownerEmail = company.members[0]?.user.email
  if (ownerEmail) {
    await sendPaymentFailedEmail(ownerEmail, company.name).catch(() => {})
  }
}
