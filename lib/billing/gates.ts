import { Plan } from '@prisma/client'

export const PLAN_LIMITS = {
  FREE: {
    members: 3,
    storage: '100MB',
    features: [] as string[],
  },
  PRO: {
    members: 10,
    storage: '10GB',
    features: ['invites', 'analytics'],
  },
  ENTERPRISE: {
    members: -1,
    storage: '1TB',
    features: ['invites', 'analytics', 'sso', 'audit-log'],
  },
} as const

export function canAccess(plan: Plan, feature: string): boolean {
  return (PLAN_LIMITS[plan].features as readonly string[]).includes(feature)
}

export function getMemberLimit(plan: Plan): number {
  return PLAN_LIMITS[plan].members
}
