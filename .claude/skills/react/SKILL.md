---
name: react
description: React 19 + TanStack Query v5 guidelines for this SaaS bootstrap. Apply when writing components, hooks, forms, state management, or data fetching logic.
user-invocable: false
---

# React 19 + TanStack Query v5

## Stack

- React 19
- TypeScript strict
- TanStack Query v5 (React Query)
- React Hook Form v7 + Zod resolvers
- No Redux — local state + React Query + URL state

## State Management Hierarchy

1. **URL state** — page params, filters (use `useSearchParams`)
2. **Server state** — React Query (remote data, caching, sync)
3. **Form state** — React Hook Form
4. **UI state** — `useState` / `useReducer` (modals, toggles)
5. **Global client state** — React Context (auth user, tenant) — keep minimal

## TanStack Query v5 Patterns

```tsx
// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['users', companyId],
  queryFn: () => fetchUsers(companyId),
  staleTime: 1000 * 60 * 5, // 5 min
})

// Mutation
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
})

// Query key conventions: ['resource', id, ...filters]
```

## React Hook Form + Zod

```tsx
const schema = z.object({ email: z.string().email(), password: z.string().min(8) })
type FormData = z.infer<typeof schema>

const form = useForm<FormData>({ resolver: zodResolver(schema) })

<form onSubmit={form.handleSubmit(onSubmit)}>
  <input {...form.register('email')} />
  {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
</form>
```

## Custom Hooks

Located in `hooks/`. Standard hooks for this project:
- `useAuth()` — current user from context
- `useTenant()` — active company/organization
- `useDebounce(value, delay)` — debounced value
- `usePagination()` — pagination state
- `useToast()` — toast notifications (shadcn)

## Component Patterns

```tsx
// Named exports for all components
export function UserCard({ user }: UserCardProps) { ... }
export function UserCardSkeleton() { ... }  // Always paired

// Props interface
interface UserCardProps {
  user: User
  className?: string
}
```

## Performance

- `useMemo` / `useCallback` only with measurable need
- `React.memo` only for components that re-render with the same props often
- Lazy load heavy components with `React.lazy` + `Suspense`
- `useTransition` for non-urgent updates (search, filters)

## Error Handling

- React Query handles async errors — check `error` state
- Form errors via React Hook Form `formState.errors`
- Global errors via `error.tsx` (Next.js error boundary)
- Toast notifications for user-facing action feedback

## Form Submit Pattern (Mandatory)

**Always use `useMutation` for form submit handlers — never `useState` for loading.**

```tsx
const mutation = useMutation({
  mutationFn: async (data: FormData) => {
    const res = await fetch('/api/...', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Failed')
    return json
  },
  onSuccess: () => toast.success('Done'),
  onError: (err) => toast.error(err.message),
})

<form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
  <Button disabled={mutation.isPending}>
    {mutation.isPending ? 'Saving...' : 'Save'}
  </Button>
```

Use `mutation.isPending` (not a local state variable) to disable the button and show loading text.
UI-only state (e.g. `open`, `step`, `sent`) still uses `useState`. Only async/loading state uses `useMutation`.

## Rules

- No Axios — use native `fetch`
- No moment.js — use `date-fns`
- No class components — functional only
- Named exports, not default exports for components
- Co-locate component, skeleton, and types in same file for small components
