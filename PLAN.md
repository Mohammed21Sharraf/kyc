# e-KYC CRM System - Implementation Plan

## Overview

A CRM system implementing Bangladesh Bank's **e-KYC Guidelines** (BRPD-1 Circular No.08, March 2026) for electronic customer onboarding, identity verification, risk grading, and regulatory compliance.

**Effective date of circular:** 01 September 2026
**Target users:** Banks, Finance Companies, MFS Providers, PSPs, PSOs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | **Supabase** (PostgreSQL + Auth + Storage + RLS) |
| Frontend | **Next.js 14+** (App Router, TypeScript) |
| Styling | **Tailwind CSS** + **shadcn/ui** (Radix UI primitives) |
| Forms | **React Hook Form** + **Zod** validation |
| Data Fetching | **TanStack React Query** |
| Charts | **Recharts** |

---

## Database Schema

### Core Tables

```
profiles            - System users (bank officers/agents)
user_roles           - Role assignments (maker/checker/admin/auditor)
customers            - e-KYC customer records (simplified + regular tiers)
nominees             - Customer nominee information (incl. minor guardian)
risk_gradings        - 7-dimension risk scoring (from Annexure-2 A3/A4/A5)
customer_documents   - NID images, photos, signatures (→ Supabase Storage)
screening_results    - UNSCRs, IP, adverse media, beneficial ownership checks
transaction_limits   - Deposit/withdrawal limits per tier (Section 2.3.1)
periodic_reviews     - Scheduled KYC review records (Section 5.5)
audit_logs           - Complete digital audit trail (Section 3.2.3/4.3)
```

### Key Enums

- `kyc_tier`: simplified | regular
- `onboarding_status`: nid_verification → nid_scan → customer_info → photograph_capture → signature_capture → screening_review → completed/failed
- `risk_level`: regular (<15 score) | high (>=15 score)
- `app_role`: maker | checker | admin | auditor
- `verification_model`: fingerprint | face_matching
- `gender_type`: M | F | T

### Storage Buckets

- `nid-images` - NID front/back scans
- `photographs` - Customer live photos
- `signatures` - Wet/electronic/digital signatures
- `nominee-documents` - Nominee photos and IDs

---

## Project Structure

```
ekyc-crm/
├── src/
│   ├── app/
│   │   ├── (auth)/login/           - Login page
│   │   └── (dashboard)/
│   │       ├── dashboard/          - Stats, charts, recent activity
│   │       ├── customers/          - Customer list + search/filter
│   │       │   ├── new/            - 6-step onboarding form
│   │       │   └── [id]/           - Customer profile (tabbed)
│   │       │       └── risk-grading/ - Risk grading form
│   │       └── settings/           - User settings
│   ├── components/
│   │   ├── ui/                     - shadcn/ui base components
│   │   ├── layout/                 - Sidebar, header, breadcrumbs
│   │   ├── dashboard/              - Stats cards, charts
│   │   ├── customers/              - Table, filters, cards
│   │   ├── onboarding/             - 6-step form components
│   │   ├── profile/                - Customer detail tabs
│   │   └── risk-grading/           - Score form, gauge, history
│   ├── hooks/                      - Custom React hooks for data
│   ├── lib/
│   │   ├── supabase/               - Client, server, types
│   │   ├── constants.ts            - Risk scores from A6, limits
│   │   └── validations/            - Zod schemas
│   ├── providers/                  - Query, Auth, Theme providers
│   └── types/                      - TypeScript type definitions
├── supabase/
│   └── migrations/                 - SQL migration files
├── middleware.ts                   - Auth guard
└── .env.local                      - Supabase credentials
```

---

## Phase 1: Foundation + Core Features

### 1. Database & Auth Setup
- [x] Create Supabase project
- [ ] Write migration files (enums, tables, functions, RLS, seeds)
- [ ] Create storage buckets with access policies
- [ ] Generate TypeScript types from schema

### 2. Next.js Project Scaffolding
- [ ] Initialize Next.js with App Router + TypeScript + Tailwind
- [ ] Install all dependencies
- [ ] Setup Supabase clients (browser + server)
- [ ] Auth middleware for route protection
- [ ] Auth provider with login/logout flow
- [ ] Dashboard layout (sidebar + header)

### 3. Dashboard (`/dashboard`)
- [ ] Stats cards: Total customers, monthly onboarded, pending review, high risk
- [ ] Bar chart: Monthly onboarding trend (simplified vs regular)
- [ ] Pie chart: Risk level distribution
- [ ] Recent customers table (last 10)

### 4. Customer List (`/customers`)
- [ ] Data table with sortable columns
- [ ] Search by name, NID, mobile, reference ID
- [ ] Filter by: KYC tier, onboarding status, risk level
- [ ] Pagination (20 per page)

### 5. Customer Onboarding (`/customers/new`)
6-step workflow matching BB guidelines Sections 3.2/3.3:

| Step | Name | Fields |
|------|------|--------|
| 1 | NID Verification | NID number, DOB, verification model, tier, channel |
| 2 | NID Scan | Front/back image upload (OCR simulated in Phase 1) |
| 3 | Customer Info | Name, parents, spouse, gender, profession, phone, email, address, nominee(s) |
| 4 | Photograph | Live photo capture/upload |
| 5 | Signature | Wet/electronic/digital signature capture |
| 6 | Screening | UNSCRs, IP, adverse media checklist + review summary |

**Regular e-KYC** adds: monthly income, source of funds, nationality, TIN, account numbers

### 6. Customer Profile (`/customers/[id]`)
Tabbed view:
- **Personal Info** - All customer fields (read-only, matching Annexure-1 A1/A2)
- **Documents** - NID images, photo, signature thumbnails
- **Nominees** - Nominee details + guardian info for minors
- **Screening** - Screening results per type
- **Risk Grading** - Score gauge + 7-dimension breakdown
- **Audit Trail** - Chronological action timeline

### 7. Risk Grading (`/customers/[id]/risk-grading`)
Interactive 7-dimension scoring form (Annexure-2):

| # | Dimension | Source |
|---|-----------|--------|
| 1 | Type of On-boarding | A3/A4/A5 item 1 |
| 2 | Geographic Risks | A3/A4/A5 item 2 |
| 3 | Type of Customer (PEP/IP) | A3/A4/A5 item 3 |
| 4 | Product and Channel Risk | A3/A4/A5 item 4 |
| 5 | Business and Activity Risk | A6 lookup table |
| 6 | Transactional Risks | A3/A4/A5 item 6 |
| 7 | Transparency Risk | A3/A4/A5 item 7 |

**Scoring:** Total < 15 = Regular risk | Total >= 15 = High risk (triggers EDD)

---

## Phase 2: Integrations (Future)

- [ ] EC NID Database API integration (biometric verification)
- [ ] OCR integration (Tesseract.js for NID data extraction in Bangla + English)
- [ ] Liveness detection for face-matching (ISO/IEC 30107)
- [ ] UNSCRs API integration for automated screening
- [ ] SMS gateway for notifications (SIM-based)
- [ ] Email notifications (account opening confirmation)

## Phase 3: Advanced Features (Future)

- [ ] Transaction monitoring with limit enforcement
- [ ] Automated periodic review scheduling and reminders
- [ ] Maker-checker approval workflow UI
- [ ] Enhanced Due Diligence (EDD) workflow for high-risk customers
- [ ] Quarterly reporting (Appendix-A format) export
- [ ] Existing client CDD digital transformation (Section 5.4)
- [ ] Address change workflow with verification (Section 5.5)

## Phase 4: Security Hardening (Future)

- [ ] 2FA/MFA implementation
- [ ] IP logging and geo-location tracking
- [ ] Data encryption at rest
- [ ] Role-based access control enforcement
- [ ] Data residency compliance (Bangladesh-only servers)

---

## Key Regulatory References

| Requirement | Guideline Section |
|-------------|------------------|
| Simplified e-KYC scope | Section 2.3.1 |
| Regular e-KYC scope | Section 2.3.2 |
| Fingerprint onboarding steps | Section 3.2 |
| Face-matching onboarding steps | Section 3.3 |
| Transaction limits | Section 2.3.1(d) |
| Risk grading matrices | Annexure-2 (A3/A4/A5/A6) |
| e-KYC profile templates | Annexure-1 (A1/A2) |
| Security measures | Section 3.2.5, 4.5 |
| Periodic review | Section 5.5 |
| Record keeping | Section 5.1 |
| Third-party reliance | Section 5.2 |
| Data residency | Section 5.2 |

