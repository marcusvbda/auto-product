import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check, Zap, Shield, Users, Globe, CreditCard, Mail } from 'lucide-react'
import { PLANS } from '@/lib/stripe/plans'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Shield,
    title: 'Secure by default',
    description: 'JWT in httpOnly cookies, bcrypt passwords, CSP headers, and full OWASP coverage.',
  },
  {
    icon: Users,
    title: 'Multi-tenancy ready',
    description: 'Users can belong to multiple organizations with role-based access control.',
  },
  {
    icon: CreditCard,
    title: 'Stripe billing',
    description: 'Embedded checkout, subscription lifecycle, webhooks, and plan management built in.',
  },
  {
    icon: Mail,
    title: 'Transactional emails',
    description: 'Email confirmation, password reset, team invites powered by Resend.',
  },
  {
    icon: Zap,
    title: 'Fast by design',
    description: 'Server Components by default, TanStack Query for client data, skeleton loading states.',
  },
  {
    icon: Globe,
    title: 'i18n ready',
    description: 'JSON-based translation dictionaries. Start in English, add languages easily.',
  },
]

const planEntries = Object.entries(PLANS) as [keyof typeof PLANS, (typeof PLANS)[keyof typeof PLANS]][]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24 md:py-36 px-4 text-center max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-6">
          Production-ready SaaS starter
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
          Ship your SaaS{' '}
          <span className="text-primary">in days,</span>
          <br />
          not months
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Everything you need to launch a multi-tenant SaaS: auth, billing, emails, and a beautiful dashboard — all production-ready.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button size="lg" asChild>
            <Link href="/register">Start building for free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">See what's included</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Stop rebuilding the same infrastructure. Focus on your product.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card border-border">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">Simple pricing</h2>
            <p className="text-muted-foreground">Start free. Scale as you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planEntries.map(([key, plan]) => {
              const isPro = key === 'PRO'
              return (
                <Card
                  key={key}
                  className={cn(
                    'relative flex flex-col',
                    isPro && 'border-primary shadow-lg shadow-primary/10'
                  )}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge>Most popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground text-sm">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isPro ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/register">
                        {plan.price === 0 ? 'Get started' : `Start with ${plan.name}`}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-border/50 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to ship?</h2>
          <p className="text-muted-foreground mb-8">
            Create your account and have a production-grade SaaS running in minutes.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Create free account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} SaaSKit. Built with Next.js, Prisma & Stripe.</p>
      </footer>
    </>
  )
}
