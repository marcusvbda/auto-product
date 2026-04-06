import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAccessToken } from '@/lib/auth/tokens'
import { AUTH_COOKIES } from '@/lib/auth/cookies'
import { prisma } from '@/lib/db'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/providers/AuthProvider'
import type { AuthUser } from '@/types'

export default async function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_COOKIES.ACCESS)?.value

  if (!accessToken) redirect('/login')

  let userId: string
  try {
    const payload = await verifyAccessToken(accessToken)
    userId = payload.userId
  } catch {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, emailVerified: true },
  })

  if (!user) redirect('/login')

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
  }

  return (
    <AuthProvider initialUser={authUser}>
      <DashboardLayout user={authUser}>{children}</DashboardLayout>
    </AuthProvider>
  )
}
