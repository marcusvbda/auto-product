import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import { PLANS, type PlanKey } from '@/lib/stripe/plans'
import { CheckoutForm } from '@/components/billing/CheckoutForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Upgrade plan' }

const VALID_PLANS: PlanKey[] = ['PRO', 'ENTERPRISE']

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { companyId } = await getSession()
  const { plan: planParam } = await searchParams

  const planKey = (VALID_PLANS.includes(planParam as PlanKey) ? planParam : 'PRO') as PlanKey
  const plan = PLANS[planKey]

  const company = await prisma.company.findFirst({
    where: { id: companyId, deletedAt: null },
    select: { plan: true },
  })

  if (company?.plan === planKey) redirect('/dashboard/billing')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/billing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upgrade to {plan.name}</h1>
          <p className="text-muted-foreground">Get access to all {plan.name} features</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{plan.name}</CardTitle>
              <Badge>${plan.price}/mo</Badge>
            </div>
            <CardDescription>Everything you need to grow</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>Secure checkout powered by Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            {plan.priceId ? (
              <CheckoutForm planKey={planKey} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Stripe price ID not configured. Set{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  STRIPE_{planKey}_PRICE_ID
                </code>{' '}
                in your environment variables.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
