import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAccessToken } from '@/lib/auth/tokens'
import { AUTH_COOKIES } from '@/lib/auth/cookies'

export interface Session {
  userId: string
  companyId: string
  role: string
}

export async function getSession(): Promise<Session> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIES.ACCESS)?.value
  if (!token) redirect('/login')

  try {
    const payload = await verifyAccessToken(token)
    return {
      userId: payload.userId,
      companyId: payload.companyId,
      role: payload.role,
    }
  } catch {
    redirect('/login')
  }
}
