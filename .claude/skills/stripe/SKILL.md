---
name: stripe
description: Stripe Embedded Checkout + webhook guidelines for this SaaS bootstrap. Apply when working with payments, billing, plan management, subscription lifecycle, or Stripe API interactions.
user-invocable: false
---

# Stripe Integration

## Stack

- Stripe (latest SDK)
- Embedded Checkout (not redirect-based)
- Webhook handler at `/api/stripe/webhook`
- Plans defined in constants — no DB-driven plan config

## Client Setup

```ts
// lib/stripe/index.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})
```

## Plans Constant

```ts
// lib/stripe/plans.ts
export const PLANS = {
  FREE: { name: 'Free', priceId: null, price: 0, features: [...] },
  PRO: { name: 'Pro', priceId: process.env.STRIPE_PRO_PRICE_ID!, price: 29, features: [...] },
  ENTERPRISE: { name: 'Enterprise', priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!, price: 99, features: [...] },
} as const
export type PlanKey = keyof typeof PLANS
```

## Embedded Checkout Session

```ts
// app/api/stripe/checkout/route.ts
export async function POST(req: Request) {
  const { planKey } = await req.json()
  const plan = PLANS[planKey as PlanKey]
  if (!plan.priceId) return Response.json({ error: 'Free plan' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    mode: 'subscription',
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    customer_email: user.email,
    metadata: { companyId: tenant.companyId, planKey },
  })

  return Response.json({ clientSecret: session.client_secret })
}
```

## Webhook Handler

```ts
// app/api/stripe/webhook/route.ts
export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object)
      break
  }

  return Response.json({ received: true })
}
```

## Frontend Embedded Checkout

```tsx
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutForm({ planKey }: { planKey: string }) {
  const fetchClientSecret = async () => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ planKey }),
    })
    const { clientSecret } = await res.json()
    return clientSecret
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}
```

## Webhook Events to Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate subscription, update company plan |
| `customer.subscription.updated` | Sync plan changes, handle upgrades/downgrades |
| `customer.subscription.deleted` | Downgrade to free plan |
| `invoice.payment_failed` | Send dunning email via Resend, flag account |
| `invoice.paid` | Confirm payment, extend subscription |

## Environment Variables

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

## Rules

- Always verify webhook signatures — never trust unverified events
- Never store card data — Stripe handles it
- Use `metadata` to pass `companyId` through Stripe sessions
- Idempotent webhook handlers — safe to process same event twice
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
