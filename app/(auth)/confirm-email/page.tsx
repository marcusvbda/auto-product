import { Metadata } from 'next'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Confirm your email' }

export default function ConfirmEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to your email address. Please click it to activate your account.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Didn&apos;t receive it? Check your spam folder or{' '}
        <button className="text-foreground underline">resend the email</button>.
      </p>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/login">Back to login</Link>
      </Button>
    </div>
  )
}
