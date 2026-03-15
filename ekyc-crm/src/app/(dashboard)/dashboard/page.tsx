import { StatsCards } from "@/components/dashboard/stats-cards"
import { OnboardingChart } from "@/components/dashboard/onboarding-chart"
import { RiskChart } from "@/components/dashboard/risk-chart"
import { RecentCustomers } from "@/components/dashboard/recent-customers"

// ---------------------------------------------------------------------------
// Mock data helpers — replace these with real Supabase queries in Phase 2
// ---------------------------------------------------------------------------

function getMockStats() {
  return {
    totalCustomers: 1247,
    monthlyOnboarded: 89,
    pendingReview: 23,
    highRisk: 15,
  }
}

function getMockOnboardingTrend() {
  return [
    { month: "Oct 2025", simplified: 42, regular: 28 },
    { month: "Nov 2025", simplified: 38, regular: 31 },
    { month: "Dec 2025", simplified: 45, regular: 35 },
    { month: "Jan 2026", simplified: 50, regular: 30 },
    { month: "Feb 2026", simplified: 48, regular: 37 },
    { month: "Mar 2026", simplified: 55, regular: 34 },
  ]
}

function getMockRiskDistribution() {
  return [
    { name: "Regular", value: 1180, fill: "#22c55e" },
    { name: "High", value: 67, fill: "#ef4444" },
  ]
}

function getMockRecentCustomers() {
  return [
    {
      id: "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      reference_id: "EKYC-2026-000001",
      name_en: "Mohammad Rafiqul Islam",
      kyc_tier: "regular",
      onboarding_status: "completed",
      risk_level: "regular",
      created_at: "2026-03-15T10:30:00Z",
    },
    {
      id: "d2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d",
      reference_id: "EKYC-2026-000002",
      name_en: "Fatema Khatun",
      kyc_tier: "simplified",
      onboarding_status: "completed",
      risk_level: "regular",
      created_at: "2026-03-15T09:15:00Z",
    },
    {
      id: "e3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e",
      reference_id: "EKYC-2026-000003",
      name_en: "Abdul Karim Chowdhury",
      kyc_tier: "regular",
      onboarding_status: "screening_review",
      risk_level: "high",
      created_at: "2026-03-14T16:45:00Z",
    },
    {
      id: "f4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f",
      reference_id: "EKYC-2026-000004",
      name_en: "Nusrat Jahan Begum",
      kyc_tier: "simplified",
      onboarding_status: "completed",
      risk_level: "regular",
      created_at: "2026-03-14T14:20:00Z",
    },
    {
      id: "a5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a",
      reference_id: "EKYC-2026-000005",
      name_en: "Md. Shahinur Rahman",
      kyc_tier: "regular",
      onboarding_status: "failed",
      risk_level: null,
      created_at: "2026-03-14T11:00:00Z",
    },
    {
      id: "b6f7a8b9-c0d1-4e2f-3a4b-5c6d7e8f9a0b",
      reference_id: "EKYC-2026-000006",
      name_en: "Taslima Akter",
      kyc_tier: "simplified",
      onboarding_status: "completed",
      risk_level: "regular",
      created_at: "2026-03-13T17:30:00Z",
    },
    {
      id: "c7a8b9c0-d1e2-4f3a-4b5c-6d7e8f9a0b1c",
      reference_id: "EKYC-2026-000007",
      name_en: "Habibur Rahman Khan",
      kyc_tier: "regular",
      onboarding_status: "screening_review",
      risk_level: "high",
      created_at: "2026-03-13T15:10:00Z",
    },
    {
      id: "d8b9c0d1-e2f3-4a4b-5c6d-7e8f9a0b1c2d",
      reference_id: "EKYC-2026-000008",
      name_en: "Sumaiya Sultana",
      kyc_tier: "simplified",
      onboarding_status: "completed",
      risk_level: "regular",
      created_at: "2026-03-13T12:45:00Z",
    },
    {
      id: "e9c0d1e2-f3a4-4b5c-6d7e-8f9a0b1c2d3e",
      reference_id: "EKYC-2026-000009",
      name_en: "Md. Jamal Uddin",
      kyc_tier: "regular",
      onboarding_status: "completed",
      risk_level: "regular",
      created_at: "2026-03-12T10:20:00Z",
    },
    {
      id: "f0d1e2f3-a4b5-4c6d-7e8f-9a0b1c2d3e4f",
      reference_id: "EKYC-2026-000010",
      name_en: "Reshma Parvin",
      kyc_tier: "simplified",
      onboarding_status: "pending_verification",
      risk_level: null,
      created_at: "2026-03-12T08:50:00Z",
    },
  ]
}

// ---------------------------------------------------------------------------
// Dashboard Page (Server Component)
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const stats = getMockStats()
  const onboardingTrend = getMockOnboardingTrend()
  const riskDistribution = getMockRiskDistribution()
  const recentCustomers = getMockRecentCustomers()

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of e-KYC operations
        </p>
      </div>

      {/* Stats cards */}
      <StatsCards stats={stats} />

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OnboardingChart data={onboardingTrend} />
        <RiskChart data={riskDistribution} />
      </div>

      {/* Recent customers table */}
      <RecentCustomers customers={recentCustomers} />
    </div>
  )
}
