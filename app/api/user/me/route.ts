import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { verifyAccessToken } from '@/lib/auth/tokens'
import { AUTH_COOKIES } from '@/lib/auth/cookies'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIES.ACCESS)?.value
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { userId } = await verifyAccessToken(token)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, emailVerified: true },
    })
    if (!user) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ data: user })
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
