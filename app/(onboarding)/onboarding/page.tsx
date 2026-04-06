import { Metadata } from 'next'
import { Building2 } from 'lucide-react'
import { CreateCompanyForm } from '@/components/forms/CreateCompanyForm'

export const metadata: Metadata = { title: 'Create your workspace' }

export default function OnboardingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Create your workspace</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          A workspace is where you and your team collaborate. You can create more workspaces later.
        </p>
      </div>

      <CreateCompanyForm />
    </div>
  )
}
