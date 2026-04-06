---
name: engineering-standards
description: Core engineering principles for this SaaS bootstrap. Always active — apply when writing, reviewing, or refactoring any code. Enforces scope control, security-first mindset, and production readiness.
user-invocable: false
---

# Engineering Standards

## Project Context

- Next.js 16 App Router SaaS bootstrap
- Production-grade — assume real users, real payments, real data
- Multi-tenant architecture
- Custom JWT auth (httpOnly cookies)
- Stripe billing + Resend emails

## Core Principles

- All code in **English** — no Portuguese in code, comments, or variables
- Do not add comments unless explicitly requested
- Do not modify anything outside the explicit scope of the request
- No implicit refactors, cleanups, or convenience improvements
- Preserve existing behavior unless changing it was the explicit goal

## Mindset

- **Security over convenience** — always choose the safer option
- **Stability over cleverness** — boring, predictable code wins
- **Minimal change surface** — surgical edits, not sweeping rewrites
- **Production-first** — every line ships to real users

## Scope Control

- Never change unrelated files
- Never rename variables, functions, or components unless requested
- Never adjust behavior unless explicitly required
- Avoid cascading changes — fix the target, leave everything else alone

## Security (Non-Negotiable)

- JWT in httpOnly cookies — **never** localStorage or sessionStorage
- Always verify Stripe webhook signatures before processing
- Never expose sensitive env variables to the client
- Sanitize all user input before rendering or storing
- Never log passwords, tokens, card data, or PII
- Tenant isolation on every database query — never skip `companyId` scope

## Performance

- Server Components by default — `'use client'` only when necessary
- No unnecessary re-renders — use `useMemo`/`useCallback` only with measurable need
- Bundle size awareness — avoid heavy client-side imports
- Skeletons for every loading state — never raw spinners

## TypeScript

- Strict mode — avoid `any` unless truly unavoidable
- Zod for all runtime validation (forms + API bodies)
- Keep types co-located with their usage or in `types/`

## Final Rule

**If it was not explicitly requested, do not do it.**
