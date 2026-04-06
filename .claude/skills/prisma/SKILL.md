---
name: prisma
description: Prisma ORM + PostgreSQL guidelines for this SaaS bootstrap. Apply when working with database schema, migrations, queries, relations, or multi-tenant data access patterns.
user-invocable: false
---

# Prisma ORM + PostgreSQL

## Stack

- Prisma ORM (latest)
- PostgreSQL (local via Docker, prod via managed service)
- Multi-tenant architecture: one DB, tenant isolation via `companyId`

## Client Singleton

```ts
// lib/db/index.ts — always import from here
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Multi-Tenant Schema Pattern

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  memberships   CompanyMember[]
}

model Company {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  plan      Plan     @default(FREE)
  createdAt DateTime @default(now())
  members   CompanyMember[]
  invites   Invite[]
}

model CompanyMember {
  id        String  @id @default(cuid())
  userId    String
  companyId String
  role      Role    @default(MEMBER)
  user      User    @relation(fields: [userId], references: [id])
  company   Company @relation(fields: [companyId], references: [id])
  @@unique([userId, companyId])
}

enum Role { OWNER ADMIN MEMBER }
enum Plan { FREE PRO ENTERPRISE }
```

## Tenant Isolation Pattern

**Every query in a dashboard context must scope by companyId:**

```ts
// CORRECT
await prisma.resource.findMany({
  where: { companyId: tenant.companyId }
})

// CORRECT — verify ownership before update
await prisma.resource.update({
  where: { id: resourceId, companyId: tenant.companyId },
  data: { ... }
})

// WRONG — missing tenant scope
await prisma.resource.findMany() // never
```

## Migration Workflow

```bash
# Create and apply migration
npx prisma migrate dev --name <description>

# Apply migrations in production
npx prisma migrate deploy

# Sync schema without migration (dev only)
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Regenerate client after schema change
npx prisma generate
```

## Query Patterns

```ts
// Create with relation
await prisma.company.create({
  data: {
    name,
    slug,
    members: { create: { userId, role: 'OWNER' } }
  }
})

// Upsert
await prisma.user.upsert({
  where: { email },
  update: { emailVerified: true },
  create: { email, passwordHash, emailVerified: true }
})

// Pagination
await prisma.resource.findMany({
  where: { companyId },
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
})

// Transaction
await prisma.$transaction([
  prisma.company.create({ data: companyData }),
  prisma.companyMember.create({ data: memberData }),
])
```

## Rules

- Always use `cuid()` for IDs (not auto-increment integers)
- Always include `createdAt` and `updatedAt` timestamps
- Soft delete: add `deletedAt DateTime?` and filter `where: { deletedAt: null }`
- Never use raw SQL (`$queryRaw`) unless truly impossible with Prisma API
- Use `select` to return only needed fields from queries
- Never return `passwordHash` from queries — always `select` explicitly
