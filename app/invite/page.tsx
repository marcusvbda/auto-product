import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { verifyAccessToken } from '@/lib/auth/tokens'
import { AUTH_COOKIES } from '@/lib/auth/cookies'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, AlertCircle, CheckCircle2 } from 'lucide-react'
import { AcceptInviteButton } from '@/components/invite/AcceptInviteButton'

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) redirect('/')

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { company: { select: { name: true, id: true } } },
  })

  if (!invite) {
    return <InviteError title="Invalid invitation" description="This invitation link is invalid or does not exist." />
  }

  if (invite.accepted) {
    return <InviteError title="Already accepted" description="This invitation has already been accepted." icon="check" />
  }

  if (invite.expiresAt < new Date()) {
    return <InviteError title="Invitation expired" description="This invitation has expired. Ask the workspace owner to send a new invite." />
  }

  // Check if user is logged in
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_COOKIES.ACCESS)?.value
  let loggedInUserId: string | null = null

  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken)
      loggedInUserId = payload.userId
    } catch {
      // token invalid — treat as logged out
    }
  }

  const roleLabel = invite.role.charAt(0) + invite.role.slice(1).toLowerCase()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">You&apos;re invited</CardTitle>
          <CardDescription className="text-base">
            Join <span className="font-semibold text-foreground">{invite.company.name}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Invited as</p>
              <Badge variant="outline" className="mt-0.5">{roleLabel}</Badge>
            </div>
          </div>

          {loggedInUserId ? (
            <AcceptInviteButton token={token} companyName={invite.company.name} />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Log in or create an account to accept this invitation.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href={`/login?redirect=/invite?token=${token}`}>
                    Log in to accept
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/register?email=${encodeURIComponent(invite.email)}&redirect=/invite?token=${token}`}>
                    Create account
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InviteError({
  title,
  description,
  icon = 'error',
}: {
  title: string
  description: string
  icon?: 'error' | 'check'
}) {
  const Icon = icon === 'check' ? CheckCircle2 : AlertCircle
  const iconClass = icon === 'check' ? 'text-green-500' : 'text-destructive'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-10 pb-8 space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <Icon className={`h-7 w-7 ${iconClass}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
