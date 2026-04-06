---
name: tailwind
description: Tailwind CSS v4.2 styling guidelines for this SaaS bootstrap. Apply when writing styles, class names, responsive design, dark mode variants, or component styling.
user-invocable: false
---

# Tailwind CSS v4.2

## Stack

- Tailwind CSS v4.2 (CSS-first config)
- Dark mode: `class` strategy (dark mode first)
- `tailwind-merge` + `clsx` via `cn()` utility
- `tailwindcss-animate` for animations

## Key v4 Changes

- Config is now in `tailwind.css` / `globals.css` using `@theme` directive — NOT in `tailwind.config.js`
- CSS variables define the design system
- `@import "tailwindcss"` replaces `@tailwind base/components/utilities`

## Dark Mode First Pattern

```tsx
// Always write dark variant first, then light override
<div className="bg-gray-900 text-white dark:bg-gray-900 dark:text-white lg:bg-white lg:text-gray-900">
// Actually: dark is the default in this project
// Write base = dark styles, then add light: override if needed
<div className="bg-background text-foreground">
```

## Class Merging

Always use `cn()` from `@/lib/utils`:
```tsx
import { cn } from '@/lib/utils'
<div className={cn('base-class', condition && 'conditional-class', className)} />
```

## Responsive Design

Mobile-first breakpoints:
- `sm:` → 640px
- `md:` → 768px
- `lg:` → 1024px
- `xl:` → 1280px
- `2xl:` → 1536px

Dashboard layout: sidebar is hidden on mobile (hamburger menu).

## Design Tokens (CSS Variables)

Use semantic tokens, not raw colors:
```
bg-background          # Page background
bg-card                # Card/panel background
bg-muted               # Subtle background
text-foreground        # Primary text
text-muted-foreground  # Secondary/hint text
border-border          # Default border
ring-ring              # Focus ring
bg-primary             # Brand primary (buttons)
text-primary-foreground
bg-destructive         # Error/danger
bg-accent              # Hover states
```

## Skeleton Pattern

```tsx
<div className="animate-pulse rounded-md bg-muted h-4 w-3/4" />
```

## Animation

Use `tailwindcss-animate` classes:
- `animate-in`, `fade-in`, `slide-in-from-top-2`, etc.
- `duration-200`, `ease-out`

## Rules

- Prefer semantic tokens over raw colors (`bg-card` not `bg-gray-800`)
- Always add `dark:` variants when using non-semantic colors
- Never write custom CSS when a Tailwind class exists
- Use `@apply` only in component CSS as a last resort
- All interactive elements need focus-visible styles
