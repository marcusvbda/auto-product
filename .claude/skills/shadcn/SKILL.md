---
name: shadcn
description: shadcn/ui guidelines for this SaaS bootstrap. Apply when creating, using, or modifying UI components, forms, dialogs, navigation, or any Radix-based primitive.
user-invocable: false
---

# shadcn/ui

## Stack

- shadcn/ui latest (2025)
- Radix UI primitives (via shadcn)
- `lucide-react` icons
- `class-variance-authority` (cva)
- `clsx` + `tailwind-merge` via `cn()`

## Configuration (`components.json`)

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": { "cssVariables": true, "baseColor": "neutral" },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "utils": "@/lib/utils",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

## Installing Components

```bash
npx shadcn@latest add <component-name>
```

## Path Aliases

- UI components: `@/components/ui/`
- Class utility: `@/lib/utils` → `cn()`
- Hooks: `@/hooks/`

## Component Variants (cva)

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('base-classes', {
  variants: {
    variant: { default: '...', destructive: '...', outline: '...' },
    size: { default: '...', sm: '...', lg: '...' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})
```

## Icons

Only `lucide-react`. Pattern:
```tsx
import { Settings, User, LogOut } from 'lucide-react'
<Settings className="h-4 w-4" />
```

## Key Components for Dashboard

- `Button` — primary actions
- `Sheet` — mobile sidebar
- `Dialog` — modals (confirmations, forms)
- `DropdownMenu` — user menu, row actions
- `Table` — data tables
- `Form` + `Input` + `Select` — forms
- `Skeleton` — loading states
- `Toast` / `Sonner` — notifications
- `Avatar` — user avatars
- `Badge` — status indicators
- `Separator` — visual dividers
- `Tooltip` — contextual hints
- `Card` — dashboard panels

## Dark Mode

All shadcn components support dark mode via CSS variables. Never override with hardcoded colors.

## Rules

- Never manually copy component code — always use `npx shadcn@latest add`
- Extend components via wrapper components, not by editing `components/ui/` files
- Use `cn()` for all conditional class merging
- Add `className` prop to every custom component for composability
- Keep `components/ui/` clean — custom components go in `components/common/` or `components/forms/`
