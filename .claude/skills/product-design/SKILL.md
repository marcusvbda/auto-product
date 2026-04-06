---
name: product-design
description: UX, visual design, and component design system guidelines for this SaaS bootstrap. Apply when designing new screens, building layouts, creating loading states, or ensuring design consistency.
user-invocable: false
---

# Product Design

## Design Philosophy

- **Dark mode first** — design in dark, add light mode overrides
- **Clean and functional** — no decoration for decoration's sake
- **Professional and modern** — SaaS-grade UI, not startup-prototype feel
- **Mobile responsive** — every screen must work on 320px+
- **Accessibility baseline** — keyboard nav, focus rings, sufficient contrast

## Color System

Built on shadcn/ui CSS variables (Tailwind v4):
- Background: `bg-background` (dark: near-black)
- Surface: `bg-card` (dark: slightly lighter)
- Text: `text-foreground` / `text-muted-foreground`
- Border: `border-border`
- Primary action: `bg-primary` / `text-primary-foreground`
- Destructive: `bg-destructive`
- Success: custom `bg-success` / `text-success`

## Typography

```
Page title:     text-2xl font-bold
Section header: text-xl font-semibold
Card title:     text-lg font-medium
Body:           text-sm (default)
Caption/hint:   text-xs text-muted-foreground
```

## Spacing

Use Tailwind spacing scale consistently:
- Card padding: `p-6`
- Section gap: `gap-6`
- Form field gap: `gap-4`
- Button padding: default shadcn sizes

## Dashboard Layout

```
┌─────────────────────────────────────────┐
│ Navbar (fixed, full width)              │
├──────────┬──────────────────────────────┤
│ Sidebar  │ Main Content Area            │
│ (fixed,  │ (scrollable)                 │
│ 240px)   │                              │
│          │                              │
└──────────┴──────────────────────────────┘

Mobile: Sidebar hidden → hamburger → Sheet
```

## Skeleton System

Every data-fetching component must have a skeleton variant:

```tsx
// Pattern: same layout, replace content with pulse divs
export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border">
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
      </div>
    </div>
  )
}
```

Use in `loading.tsx` or with React Suspense:
```tsx
<Suspense fallback={<UserCardSkeleton />}>
  <UserCard userId={id} />
</Suspense>
```

## Empty States

For empty lists/tables, use an `EmptyState` component:
```tsx
<EmptyState
  icon={<Users className="h-8 w-8" />}
  title="No members yet"
  description="Invite your team to get started"
  action={<Button>Invite member</Button>}
/>
```

## Loading States Hierarchy

1. **Page load**: `loading.tsx` with full-page skeleton
2. **Section load**: `<Suspense fallback={<SectionSkeleton />}>`
3. **Action pending**: Button loading state (`disabled + spinner in button`)
4. **Refetch**: Subtle opacity overlay on stale data, no full skeleton

## Responsive Patterns

```
Mobile (< 768px):
  - Single column layout
  - Sidebar hidden (Sheet drawer)
  - Tables become cards or horizontal scroll
  - Forms full width

Tablet (768-1024px):
  - Sidebar collapses to icons
  - 2-column grids

Desktop (> 1024px):
  - Full sidebar
  - 3-4 column grids
  - Data tables with all columns
```

## Form Design

- Labels above inputs (never floating labels for SaaS)
- Inline error messages below each field (from React Hook Form)
- Submit button at bottom right
- Destructive actions require confirmation dialog
- Loading state on submit button during async operations

## Notification System

Use `sonner` (via shadcn):
```tsx
import { toast } from 'sonner'
toast.success('Saved successfully')
toast.error('Something went wrong')
```

## Micro-interactions

- Hover: subtle `bg-accent` on rows, cards
- Active: slight scale on buttons (`active:scale-95`)
- Transitions: `transition-colors duration-150`
- Sheet/Dialog: `animate-in slide-in-from-right`

## Marketing Pages

Landing page sections:
1. Hero — headline, subheadline, CTA buttons
2. Features — 3-column grid with icons
3. Pricing — comparison cards
4. CTA — final call to action

Keep marketing pages simple — no heavy animations, fast load.
