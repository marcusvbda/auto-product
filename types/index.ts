import { Role, Plan } from '@prisma/client'

export type { Role, Plan }

export interface AuthUser {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
}

export interface ActiveTenant {
  userId: string
  companyId: string
  role: Role
  companyName: string
  companySlug: string
  plan: Plan
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
