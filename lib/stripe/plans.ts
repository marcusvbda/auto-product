export const PLANS = {
  FREE: {
    name: 'Free',
    priceId: null,
    price: 0,
    features: ['1 workspace', 'Up to 3 members', 'Basic features', '100MB storage'],
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    price: 29,
    features: [
      'Unlimited workspaces',
      'Up to 10 members',
      'All features',
      '10GB storage',
      'Priority support',
      'Analytics',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
    price: 99,
    features: [
      'Unlimited workspaces',
      'Unlimited members',
      'All Pro features',
      '1TB storage',
      'Dedicated support',
      'SSO',
      'Audit log',
      'Custom integrations',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
