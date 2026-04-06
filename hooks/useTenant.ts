'use client'

import { useQuery } from '@tanstack/react-query'
import type { ActiveTenant } from '@/types'

async function fetchTenant(): Promise<ActiveTenant | null> {
  const res = await fetch('/api/user/tenant')
  if (!res.ok) return null
  const json = await res.json()
  return json.data ?? null
}

export function useTenant() {
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant'],
    queryFn: fetchTenant,
    staleTime: 1000 * 60 * 5,
  })

  return { tenant, isLoading }
}
