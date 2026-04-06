'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100),
})

type FormData = z.infer<typeof schema>

interface CompanySettingsFormProps {
  company: { id: string; name: string; slug: string }
}

export function CompanySettingsForm({ company }: CompanySettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: company.name },
  })

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Update failed')
      return json
    },
    onSuccess: () => {
      toast.success('Company updated')
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Company name</Label>
        <Input id="name" type="text" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Slug</Label>
        <Input value={company.slug} disabled className="opacity-60" />
        <p className="text-xs text-muted-foreground">Slug cannot be changed</p>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  )
}
