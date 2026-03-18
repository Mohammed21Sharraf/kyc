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
│   ├── hooks/                      # use-customers, use-dashboard, use-risk-grading, use-storage, use-nid-verification, use-ocr, use-screening, use-notifications
│   ├── lib/
│   │   ├── supabase/               # client.ts, server.ts, middleware.ts
│   │   ├── services/               # storage.ts, nid-verification.ts, ocr.ts, screening.ts, notifications.ts
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
- [x] 22 shadcn/ui components installed + Skeleton component
- [x] Auth system (login page, auth provider, middleware)
- [x] Dashboard (stats cards, bar chart, pie chart, recent customers table)
- [x] Customer list (search, filter by tier/status/risk, sortable table, pagination)
- [x] 6-step onboarding form (NID verification, NID scan, customer info, photo, signature, screening)
- [x] Customer profile (6-tab view: personal, documents, nominees, screening, risk grading, audit trail)
- [x] Risk grading (7-dimension form, score gauge, profession risk lookup, history)
- [x] Test user created in Supabase Auth
- [x] Production build passes (all TypeScript checks pass)

## Phase 2 Status (IN PROGRESS)
- [x] Testing infrastructure set up (Vitest + React Testing Library + jsdom)
- [x] 90 tests passing across 8 test files
- [x] Dashboard connected to real Supabase hooks (replaced mock data)
- [x] Customer list connected to real Supabase hooks (replaced mock data)
- [x] RiskLevel type mismatch fixed (hooks now use 'regular'|'high' matching DB schema)
- [x] Dashboard hook returns onboarding trend split by tier (simplified/regular) for bar chart
- [x] Dashboard hook returns risk distribution as {name, value, fill} for pie chart
- [x] Customer hook supports 'in_progress' virtual status filter
- [x] Customer table status badges aligned to actual OnboardingStatus enum values
- [x] Customer table risk badges aligned to actual RiskLevel enum ('regular'|'high')
- [x] Loading skeleton added to dashboard page
- [x] Supabase Storage service (upload, delete, signed URLs, document metadata)
- [x] EC NID Database API integration (biometric verification, simulated fallback)
- [x] OCR integration (Tesseract.js for NID data extraction in Bangla + English)
- [x] UNSCR API integration for automated screening (+ PEP, adverse media, beneficial ownership)
- [x] SMS gateway for notifications (simulated, production-ready interface)
- [x] Email notifications (account opening, status updates, risk alerts, review reminders)
- [x] React Query hooks for all services (use-storage, use-nid-verification, use-ocr, use-screening, use-notifications)
- [x] NID format corrected to 10 digits per reference NID image (was 17)
- [x] OCR patterns updated for actual NID card layout (DD Mon YYYY dates, NID No. label, মাতা/mother extraction)
- [x] Base UI `nativeButton={false}` fix for all `<Button render={<Link>}>` usages
- [x] 169 tests passing across 13 test files

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
- Dashboard and customer pages are **connected to real Supabase** via React Query hooks
- Loading skeletons shown while data fetches
- File uploads store metadata only - actual Supabase Storage bucket creation needed for Phase 2

### Testing
- **Framework**: Vitest + React Testing Library + jsdom
- **Test command**: `npm test` (single run) or `npm run test:watch` (watch mode)
- **Test files location**: `src/__tests__/` directory
- **Test setup**: `src/__tests__/setup.ts` (mocks Supabase client, next/navigation, next/headers)

## Run Commands
```bash
cd ekyc-crm
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npm test           # Run all tests (90 tests, 8 files)
npm run test:watch # Run tests in watch mode
```

---

## Session Log

### Session 3 — 2026-03-18: Phase 2 Kickoff (Supabase Integration + Testing)

**Goal:** Replace mock data with real Supabase queries, set up testing infrastructure, write tests for all features.

#### Changes Made

**Testing Infrastructure:**
- Installed Vitest, React Testing Library, jsdom, @testing-library/dom, @testing-library/user-event, @vitejs/plugin-react
- Created `vitest.config.ts` with path aliases, jsdom environment, globals
- Created `src/__tests__/setup.ts` with mocks for Supabase client, next/navigation, next/headers
- Added `test` and `test:watch` scripts to package.json

**Bug Fixes:**
- `src/hooks/use-risk-grading.ts` — Fixed `calculateRiskLevel()`: was returning 4 risk levels (`low/medium/high/very_high`) that don't exist in DB. Now returns `regular` (score < 15) or `high` (score >= 15) per BB guidelines. Exported the function for testing.
- `src/components/customers/customer-table.tsx` — Fixed `getStatusBadge()`: was matching old status values (`initiated`, `nid_verified`, etc.) that don't exist in OnboardingStatus enum. Now matches actual values (`nid_verification`, `nid_scan`, `customer_info`, etc.).
- `src/components/customers/customer-table.tsx` — Fixed `getRiskBadge()`: removed references to non-existent `low/medium/very_high` levels. Now handles only `regular/high/null`.
- `src/types/database.ts` — Added `'in_progress'` to `CustomerFilters.onboarding_status` union type to support virtual status grouping.

**Supabase Integration (replaced all mock data):**
- `src/app/(dashboard)/dashboard/page.tsx` — Converted from server component with hardcoded mock data to client component using `useDashboardStats`, `useOnboardingTrend`, `useRiskDistribution`, `useRecentCustomers` hooks. Added `DashboardSkeleton` loading state.
- `src/app/(dashboard)/customers/page.tsx` — Removed 50 procedurally-generated mock customers, seeded PRNG, name arrays. Now uses `useCustomers` hook with server-side pagination, search, and filtering via Supabase queries.
- `src/hooks/use-dashboard.ts` — Rewrote `fetchOnboardingTrend()` to return `{month, simplified, regular}` (split by `kyc_tier`) matching the `OnboardingChart` component props. Rewrote `fetchRiskDistribution()` to return `{name, value, fill}` matching the `RiskChart` component props. Only queries `regular` and `high` risk levels (matching DB enum). Fixed pending review query to exclude `failed` instead of non-existent `rejected`.
- `src/hooks/use-customers.ts` — Added `IN_PROGRESS_STATUSES` array and `in_progress` virtual status filter support using Supabase `.in()` query.

**New Files:**
- `src/components/ui/skeleton.tsx` — Skeleton loading component
- `src/__tests__/setup.ts` — Test setup with Supabase/Next.js mocks
- `src/__tests__/validations.test.ts` — 31 tests covering login, NID verification, customer info (simplified + regular KYC conditional validation), screening, risk grading schemas
- `src/__tests__/constants.test.ts` — 26 tests covering onboarding steps, risk dimensions, business risk scores, transaction limits, option lists
- `src/__tests__/risk-grading.test.ts` — 6 tests covering `calculateRiskLevel` for all score ranges (0-28)
- `src/__tests__/utils.test.ts` — 5 tests covering `cn()` class merging utility
- `src/__tests__/components/stats-cards.test.tsx` — 3 tests for stat card rendering
- `src/__tests__/components/recent-customers.test.tsx` — 6 tests for recent customers table
- `src/__tests__/components/pagination.test.tsx` — 7 tests for pagination navigation and button states
- `src/__tests__/components/customer-filters.test.tsx` — 6 tests for search input, filter clear, active filter detection
- `vitest.config.ts` — Vitest configuration

**Verification:**
- `npm test` — 90 tests passing across 8 test files
- `npm run build` — Production build passes with no TypeScript errors

### Session 4 — 2026-03-18: Phase 2 Completion (Services + Integrations)

**Goal:** Implement all remaining Phase 2 features: file storage, NID verification, OCR, screening, SMS, email.

#### Changes Made

**New Service Modules (`src/lib/services/`):**
- `storage.ts` — Supabase Storage file upload/delete/signed URLs, document metadata saving, file validation (5MB/JPEG/PNG/WebP), storage path generation, bucket-to-document-type mapping
- `nid-verification.ts` — EC NID Database API client with simulated fallback. Supports fingerprint and face_matching models. Returns person data (name EN/BN, parents, DOB, gender, address). Error codes: INVALID_NID, NID_NOT_FOUND, DOB_MISMATCH, BIOMETRIC_MISMATCH, API_UNAVAILABLE, RATE_LIMITED
- `ocr.ts` — Tesseract.js OCR for NID card text extraction (eng+ben). Parses NID number (10/17 digit), DOB (DD/MM/YYYY variants), names (EN/BN), father's name. Supports front+back merge
- `screening.ts` — Automated screening: UNSCR sanctions list API, PEP check, adverse media, beneficial ownership. Saves results to DB. Simulated fallback when API not configured
- `notifications.ts` — SMS (Bangladeshi mobile validation 01X format) and Email services with notification templates: account opening, KYC status update, periodic review reminder, risk alert

**New React Query Hooks:**
- `src/hooks/use-storage.ts` — `useUploadDocument()`, `useDeleteDocument()` mutations
- `src/hooks/use-nid-verification.ts` — `useNIDVerification()`, `useNIDLookup()` mutations
- `src/hooks/use-ocr.ts` — `useOCRExtract()`, `useNIDOCR()` mutations
- `src/hooks/use-screening.ts` — `useRunScreening()` mutation (runs + saves to DB)
- `src/hooks/use-notifications.ts` — `useAccountOpeningNotification()`, `useKYCStatusNotification()`, `usePeriodicReviewReminder()`, `useRiskAlertNotification()` mutations

**New Test Files (74 new tests):**
- `src/__tests__/services/storage.test.ts` — 17 tests: file validation, path generation, bucket constants, upload rejection
- `src/__tests__/services/nid-verification.test.ts` — 12 tests: simulation, error codes, NID lookup, verification models
- `src/__tests__/services/ocr.test.ts` — 16 tests: text parsing, NID/DOB/name extraction, Bangla support, front+back merge
- `src/__tests__/services/screening.test.ts` — 12 tests: UNSCR/PEP/adverse media/beneficial ownership checks, selective types
- `src/__tests__/services/notifications.test.ts` — 17 tests: SMS validation, email validation, notification templates, multi-channel

**Dependencies Added:**
- `tesseract.js@5` — OCR engine for NID data extraction

**Verification:**
- `npm test` — 164 tests passing across 13 test files
- `npm run build` — Production build passes with no TypeScript errors

### Session 5 — 2026-03-18: NID Format Correction + Base UI Fix

**Goal:** Update all NID-related code to match the actual Bangladesh NID card format (10-digit NID number, DD Mon YYYY date, নাম/পিতা/মাতা labels) based on reference image in `ekyc-crm/Images/nid.jpg`. Fix Base UI `nativeButton` warning.

#### Reference NID Image Fields
- **NID No.:** 600 458 9963 (10 digits, displayed with spaces)
- **নাম / Name:** নূর আলম / NOOR ALAM
- **পিতা (Father):** কালা মিয়া
- **মাতা (Mother):** সরু বেগম
- **Date of Birth:** 25 Nov 1983 (DD Mon YYYY format)

#### Changes Made

**NID Number Format (17 → 10 digits):**
- `src/lib/validations/customer.ts` — Regex `^\d{17}$` → `^\d{10}$`, error message updated
- `src/components/onboarding/step-1-nid.tsx` — Regex, placeholder "Enter 10-digit NID number", `maxLength={10}`
- `src/lib/services/nid-verification.ts` — Validation regex `^\d{10}$`, error message, simulated person data now returns NID image names (NOOR ALAM / নূর আলম, KALA MIA / কালা মিয়া, SORU BEGUM / সরু বেগম)

**OCR Patterns Updated for Actual NID Layout:**
- `src/lib/services/ocr.ts`:
  - NID number pattern: `\d{3}\s?\d{3}\s?\d{4}` (10 digits with optional spaces, e.g. "600 458 9963")
  - Added `NID No.` label pattern for labeled extraction
  - Added `DD Mon YYYY` date format (e.g. "25 Nov 1983") with month name → number mapping
  - Added `মাতা` (mother) name extraction pattern
  - Added `mother_name_en` field to `OCRExtractedData` interface
  - Name regex uses negative lookaheads `(?!NID|Date|DOB|No\.)` to stop matching at known labels
  - Father/mother name regex also has negative lookaheads for boundary detection

**Base UI Button Fix:**
- `src/app/(dashboard)/customers/page.tsx` — Added `nativeButton={false}` to `<Button render={<Link>}>`
- `src/app/(dashboard)/customers/[id]/page.tsx` — Same fix
- `src/components/profile/risk-grading-tab.tsx` — Same fix (2 instances: "Grade Now" and "Re-grade" buttons)

**Test Updates (all NID test data → 10-digit format):**
- `src/__tests__/services/nid-verification.test.ts` — 13 tests: all NID numbers → `6004589963`, DOB → `1983-11-25`, added test verifying 17-digit NID is now rejected
- `src/__tests__/services/ocr.test.ts` — 20 tests: uses NID image data (NOOR ALAM, 600 458 9963, 25 Nov 1983), added mother name extraction test, NID No. label test, DD Mon YYYY format test
- `src/__tests__/services/screening.test.ts` — All NID numbers → `6004589963`
- `src/__tests__/validations.test.ts` — NID valid data → `6004589963`, test description "not exactly 10 digits"

**Verification:**
- `npm test` — 169 tests passing across 13 test files
- `npm run build` — Production build passes with no TypeScript errors
