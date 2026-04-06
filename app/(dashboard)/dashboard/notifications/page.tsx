import { Metadata } from 'next'
import { NotificationsPageClient } from '@/components/notifications/NotificationsPageClient'

export const metadata: Metadata = { title: 'Notifications' }

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">Stay up to date with your workspace activity</p>
      </div>
      <NotificationsPageClient />
    </div>
  )
}
