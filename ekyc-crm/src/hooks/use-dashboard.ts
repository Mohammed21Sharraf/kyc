'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Customer, DashboardStats, RiskLevel } from '@/types/database'

const supabase = createClient()

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [totalResult, monthlyResult, pendingResult, highRiskResult] =
    await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth),
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .not('onboarding_status', 'eq', 'completed')
        .not('onboarding_status', 'eq', 'rejected'),
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .in('risk_level', ['high', 'very_high']),
    ])

  return {
    totalCustomers: totalResult.count ?? 0,
    monthlyOnboarded: monthlyResult.count ?? 0,
    pendingReview: pendingResult.count ?? 0,
    highRisk: highRiskResult.count ?? 0,
  }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
  })
}

// ─── Onboarding Trend (monthly counts for chart) ────────────────────────────

interface MonthlyTrendItem {
  month: string
  count: number
}

async function fetchOnboardingTrend(): Promise<MonthlyTrendItem[]> {
  // Fetch last 12 months of data
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)

  const { data, error } = await supabase
    .from('customers')
    .select('created_at')
    .gte('created_at', twelveMonthsAgo.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  // Group by month
  const monthCounts = new Map<string, number>()

  // Initialize all 12 months
  for (let i = 0; i < 12; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthCounts.set(key, 0)
  }

  // Count per month
  for (const row of data ?? []) {
    const d = new Date(row.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1)
  }

  return Array.from(monthCounts.entries()).map(([month, count]) => ({
    month,
    count,
  }))
}

export function useOnboardingTrend() {
  return useQuery({
    queryKey: ['dashboard', 'onboarding-trend'],
    queryFn: fetchOnboardingTrend,
  })
}

// ─── Risk Distribution (for pie chart) ───────────────────────────────────────

interface RiskDistributionItem {
  risk_level: string
  count: number
}

async function fetchRiskDistribution(): Promise<RiskDistributionItem[]> {
  const levels: RiskLevel[] = ['low' as RiskLevel, 'medium' as RiskLevel, 'high' as RiskLevel, 'very_high' as RiskLevel]

  const results = await Promise.all(
    levels.map(async (level) => {
      const { count } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('risk_level', level)

      return { risk_level: level, count: count ?? 0 }
    })
  )

  return results
}

export function useRiskDistribution() {
  return useQuery({
    queryKey: ['dashboard', 'risk-distribution'],
    queryFn: fetchRiskDistribution,
  })
}

// ─── Recent Customers ────────────────────────────────────────────────────────

async function fetchRecentCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return data as Customer[]
}

export function useRecentCustomers() {
  return useQuery({
    queryKey: ['dashboard', 'recent-customers'],
    queryFn: fetchRecentCustomers,
  })
}
