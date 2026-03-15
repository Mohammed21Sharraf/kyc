# e-KYC CRM - Project Context

## Overview
A CRM system implementing Bangladesh Bank's **e-KYC Guidelines** (BRPD-1 Circular No.08, March 2026) for electronic customer onboarding, identity verification, risk grading, and regulatory compliance.

**Effective date of circular:** 01 September 2026
**Target users:** Banks, Finance Companies, MFS Providers, PSPs, PSOs

## Tech Stack
- **Database**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Frontend**: Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **UI**: shadcn/ui (base-ui primitives, not Radix) + lucide-react icons
- **Forms**: React Hook Form + Zod v4 validation
- **Data Fetching**: TanStack React Query
- **Charts**: Recharts

## Supabase Project
- **Project name**: kyc
- **Reference ID**: rbcjfaggjlzkymiwvhvi
- **Region**: South Asia (Mumbai) / ap-south-1
- **Organization ID**: xrtxpaxcoysyylqeotug
- **URL**: https://rbcjfaggjlzkymiwvhvi.supabase.co
- **Test user**: admin@ekyc.bb.gov.bd / Admin@2026!

## Project Structure
All source code is inside `ekyc-crm/` directory.

```
ekyc-crm/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx          # Login page (email/password)
│   │   ├── (auth)/layout.tsx              # Centered auth layout
│   │   ├── (dashboard)/layout.tsx         # Sidebar + header layout
│   │   ├── (dashboard)/dashboard/page.tsx # Stats, charts, recent customers
│   │   ├── (dashboard)/customers/page.tsx # Customer list + search/filter
│   │   ├── (dashboard)/customers/new/page.tsx # 6-step onboarding form
│   │   ├── (dashboard)/customers/[id]/page.tsx # Customer profile (6 tabs)
│   │   └── (dashboard)/customers/[id]/risk-grading/page.tsx # Risk grading form
│   ├── components/
│   │   ├── ui/                     # shadcn/ui base components (22 components)
│   │   ├── layout/                 # sidebar.tsx, header.tsx
│   │   ├── dashboard/              # stats-cards, onboarding-chart, risk-chart, recent-customers
│   │   ├── customers/              # customer-filters, customer-table, pagination
│   │   ├── onboarding/             # step-indicator, step-1 through step-6
│   │   ├── profile/                # personal-info-tab, documents-tab, nominees-tab, screening-tab, risk-grading-tab, audit-trail-tab
│   │   └── risk-grading/           # score-gauge, dimension-form, risk-grading-form, grading-history
│   ├── hooks/                      # use-customers, use-dashboard, use-risk-grading
│   ├── lib/
│   │   ├── supabase/               # client.ts, server.ts, middleware.ts
│   │   ├── constants.ts            # Risk dimensions, business risk scores (A6), transaction limits, options
│   │   ├── validations/            # customer.ts (all Zod schemas), auth.ts
│   │   └── utils.ts                # cn() helper
│   ├── providers/                  # query-provider.tsx, auth-provider.tsx
│   ├── types/                      # database.ts (all types as string unions)
│   └── middleware.ts               # Auth guard (redirects to /login)
├── supabase/
│   └── migrations/
│       └── 00001_initial_schema.sql # Full schema (enums, 10 tables, functions, RLS, seeds)
├── .env.local                      # Supabase credentials (real, connected)
└── package.json
```

## Database Schema (10 tables)
- **profiles** - System users (extends auth.users)
- **user_roles** - Role assignments (maker/checker/admin/auditor)
- **customers** - Core e-KYC records with auto-generated reference_id (EKYC-YYYY-NNNNNN)
- **nominees** - Customer nominee info (supports minor guardians)
- **risk_gradings** - 7-dimension risk scoring (Annexure-2 A3/A4/A5)
- **customer_documents** - File metadata (storage_path references)
- **screening_results** - UNSCR, IP, adverse media, beneficial ownership, PEP checks
- **transaction_limits** - Daily/monthly debit/credit limits per tier
- **periodic_reviews** - Scheduled KYC review tracking
- **audit_logs** - Immutable action log with old/new values (JSONB)

## Phase 1 Status (COMPLETED)
- [x] Supabase project created and schema migrated (via Management API due to IPv6 issue)
- [x] Next.js project scaffolded with all dependencies
- [x] 22 shadcn/ui components installed
- [x] Auth system (login page, auth provider, middleware)
- [x] Dashboard (stats cards, bar chart, pie chart, recent customers table)
- [x] Customer list (search, filter by tier/status/risk, sortable table, pagination)
- [x] 6-step onboarding form (NID verification, NID scan, customer info, photo, signature, screening)
- [x] Customer profile (6-tab view: personal, documents, nominees, screening, risk grading, audit trail)
- [x] Risk grading (7-dimension form, score gauge, profession risk lookup, history)
- [x] Test user created in Supabase Auth
- [x] Production build passes (all TypeScript checks pass)

## Important Notes

### shadcn/ui v4 (base-ui, not Radix)
- Button uses `render` prop instead of `asChild`: `<Button render={<Link href="..." />}>text</Button>`
- Select `onValueChange` callback signature: `(value: string | null) => void` (value can be null)
- RadioGroup has same pattern as Select for onValueChange

### Zod v4 Compatibility
- Use `z.enum([...], { message: "..." })` instead of `{ required_error: "..." }`
- Use `z.coerce.number()` instead of `z.number({ coerce: true })`
- `z.instanceof(File)` works in Zod v4
- `zodResolver()` may need `as any` cast due to type mismatch between @hookform/resolvers and react-hook-form

### Types
- All database types are defined as **string union types** (not TypeScript enums) for Supabase compatibility
- Field naming follows snake_case matching the database columns exactly

### Network
- IPv6 is NOT supported on this network - use Supabase Management API for database operations instead of `supabase db push`
- Management API endpoint: `https://api.supabase.com/v1/projects/{ref}/database/query`
- Access token stored in macOS keychain under "Supabase CLI"

### Current State
- Dashboard and customer pages use **mock data** for Phase 1 demonstration
- Supabase hooks are implemented and ready to replace mock data when backend is connected
- File uploads store metadata only - actual Supabase Storage bucket creation needed for Phase 2

## Run Commands
```bash
cd ekyc-crm
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint
```
