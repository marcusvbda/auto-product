import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export interface Session {
  userId: string
  companyId: string
  role: string
}

// Reads session from headers set by proxy.ts (already verified — no re-validation needed).
// This also handles the case where the access token was just renewed by the middleware,
// since proxy.ts always writes the verified identity into headers for the current request.
export async function getSession(): Promise<Session> {
  const headerStore = await headers()
  const userId = headerStore.get('x-user-id')
  const companyId = headerStore.get('x-company-id')
  const role = headerStore.get('x-user-role')

  if (!userId || !companyId || !role) redirect('/login')

  return { userId, companyId, role }
}
