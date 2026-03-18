"use client"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { OnboardingChart } from "@/components/dashboard/onboarding-chart"
import { RiskChart } from "@/components/dashboard/risk-chart"
import { RecentCustomers } from "@/components/dashboard/recent-customers"
import {
  useDashboardStats,
  useOnboardingTrend,
  useRiskDistribution,
  useRecentCustomers,
} from "@/hooks/use-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-1 h-5 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
      <Skeleton className="h-80 rounded-lg" />
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: onboardingTrend, isLoading: trendLoading } = useOnboardingTrend()
  const { data: riskDistribution, isLoading: riskLoading } = useRiskDistribution()
  const { data: recentCustomers, isLoading: customersLoading } = useRecentCustomers()

  const isLoading = statsLoading || trendLoading || riskLoading || customersLoading

  if (isLoading) {
    return <DashboardSkeleton />
  }

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
      <StatsCards
        stats={
          stats ?? {
            totalCustomers: 0,
            monthlyOnboarded: 0,
            pendingReview: 0,
            highRisk: 0,
          }
        }
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OnboardingChart data={onboardingTrend ?? []} />
        <RiskChart data={riskDistribution ?? []} />
      </div>

      {/* Recent customers table */}
      <RecentCustomers customers={recentCustomers ?? []} />
    </div>
  )
}
