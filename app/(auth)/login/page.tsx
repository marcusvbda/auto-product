import { Metadata } from 'next'
import { LoginForm } from '@/components/forms/LoginForm'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Log in' }

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to log in</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-foreground font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
