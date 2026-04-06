import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAccessToken } from '@/lib/auth/tokens'
import { AUTH_COOKIES } from '@/lib/auth/cookies'
import Link from 'next/link'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIES.ACCESS)?.value
  if (!token) redirect('/login')

  try {
    await verifyAccessToken(token)
  } catch {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center h-16 px-6 border-b shrink-0">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">S</span>
          </div>
          SaaSKit
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
