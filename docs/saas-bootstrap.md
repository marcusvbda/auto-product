# SAAS BOOTSTRAP – Official Starter Template

**Next.js 16.2.2 + Tailwind CSS v4.2 + Prisma + Stripe + Resend**  
Version: 1.0.1 (April 2026) – Updated for Next.js 16 proxy.ts

This bootstrap was built so you never waste time again on repetitive SaaS setup.  
Everything boring (auth, multi-tenancy, billing, design system, i18n, etc.) is already solved.  
You only need to focus on building **features**.

---

## Goal

Start a new SaaS in under 1 hour with a solid, production-ready, and secure foundation.

---

## Tech Stack (Fixed & Recommended)

| Layer                | Technology                      | Version | Notes                                  |
| -------------------- | ------------------------------- | ------- | -------------------------------------- |
| Framework            | Next.js                         | 16.2.2  | App Router + Turbopack                 |
| Styling              | Tailwind CSS                    | v4.2    | Dark mode first                        |
| UI Components        | shadcn/ui                       | latest  | Fully customizable                     |
| Database             | PostgreSQL + Prisma ORM         | latest  | Local first, easy to move to any cloud |
| Validation           | Zod                             | latest  | Forms and API validation               |
| Data Fetching        | TanStack Query (React Query) v5 | latest  | Server & client fetching               |
| Authentication       | Custom JWT + httpOnly cookies   | -       | Never use localStorage                 |
| Payments             | Stripe (Embedded Checkout)      | latest  | Configurable via .env                  |
| Emails               | Resend                          | latest  | Transactional emails + templates       |
| HTTP Client          | Native `fetch`                  | -       | No Axios                               |
| Internationalization | Simple JSON dictionaries        | -       | English by default, easy to extend     |

---

## Design & UX Requirements (Mandatory)

- **Dark mode first** (Tailwind v4 class-based)
- All application text in **English** (ready for i18n)
- Clean, modern, basic but professional and fully responsive design
- Public marketing pages + protected dashboard area
- Dashboard layout: fixed Sidebar + Navbar
- Use **standardized skeletons** for loading states (never raw spinners)
- All slow components and fetches must show skeletons

---

## Included Features

### Public / Marketing Area

- Landing page (`/`) – clean hero, features, and pricing teaser
- Login, Register, Forgot Password
- Email confirmation flow
- Plan selection screen (plans come from a constant)
- Clear links to login/register from landing

### Authenticated Dashboard Area

- Protected layout with Sidebar + Navbar
- Minimal dashboard home (ready for your features)
- Profile page:
  - Edit name
  - Change password
  - View current plan + upgrade button
- Multi-tenancy ready:
  - Users can have multiple **Companies** (organizations)
  - Invite other users to a company via email (using Resend)
  - Tenant isolation via proxy

### Authentication

- Email + password signup/login
- Social login (Google, GitHub, etc.) – configurable in `.env`
- JWT stored in **httpOnly cookies**
- Refresh token logic
- Route protection via **proxy.ts**
- Email confirmation required before full access

### Other Ready Features

- Reusable custom hooks (`useDebounce`, `useTenant`, `useAuth`, etc.)
- Well-separated, reusable components
- Good (but not over-engineered) TypeScript typing
- Stripe payment integration prepared (embedded checkout + webhook route)
- All repetitive logic extracted to hooks or lib folders

---

## Project Folder Structure

```bash
/
├── app/
│   ├── (auth)/                 # Public auth routes
│   ├── (marketing)/            # Landing pages
│   ├── (dashboard)/            # Protected area with shared layout
│   ├── api/                    # Route Handlers (Stripe webhook, etc.)
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn components
│   ├── layout/                 # Sidebar, Navbar, DashboardLayout
│   ├── common/                 # Skeletons, EmptyState, etc.
│   └── forms/                  # Reusable form components
├── hooks/                      # Custom hooks
├── lib/
│   ├── auth/                   # JWT helpers, verifyToken, etc.
│   ├── db/                     # Prisma client
│   ├── email/                  # Resend templates & sender
│   ├── stripe/                 # Stripe client & helpers
│   └── utils/
├── prisma/
│   ├── schema.prisma           # Multi-tenant models
│   └── migrations/
├── types/                      # Global TypeScript definitions
├── proxy.ts                    # ← Protection + Tenant logic (Next.js 16+)
├── .env.example
├── docker-compose.yml          # Local PostgreSQL
├── next.config.js
├── tailwind.config.ts
├── components.json             # shadcn config
└── SAAS-BOOTSTRAP.md           # This file
```
