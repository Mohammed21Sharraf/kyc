'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Customer, DashboardStats } from '@/types/database'

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
        .not('onboarding_status', 'eq', 'failed'),
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('risk_level', 'high'),
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

// ─── Onboarding Trend (monthly counts split by tier for bar chart) ──────────

export interface OnboardingTrendItem {
  month: string
  simplified: number
  regular: number
}

async function fetchOnboardingTrend(): Promise<OnboardingTrendItem[]> {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)

  const { data, error } = await supabase
    .from('customers')
    .select('created_at, kyc_tier')
    .gte('created_at', twelveMonthsAgo.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  // Initialize all 12 months
  const monthMap = new Map<string, { simplified: number; regular: number }>()
  const monthLabels: string[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - (11 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    monthMap.set(key, { simplified: 0, regular: 0 })
    monthLabels.push(key)
  }

  // Count per month per tier
  for (const row of data ?? []) {
    const d = new Date(row.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const bucket = monthMap.get(key)
    if (bucket) {
      if (row.kyc_tier === 'simplified') {
        bucket.simplified++
      } else {
        bucket.regular++
      }
    }
  }

  return monthLabels.map((key) => {
    const [year, month] = key.split('-')
    const d = new Date(Number(year), Number(month) - 1)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const counts = monthMap.get(key)!
    return {
      month: label,
      simplified: counts.simplified,
      regular: counts.regular,
    }
  })
}

export function useOnboardingTrend() {
  return useQuery({
    queryKey: ['dashboard', 'onboarding-trend'],
    queryFn: fetchOnboardingTrend,
  })
}

// ─── Risk Distribution (for pie chart) ───────────────────────────────────────

export interface RiskDistributionItem {
  name: string
  value: number
  fill: string
}

async function fetchRiskDistribution(): Promise<RiskDistributionItem[]> {
  const [regularResult, highResult] = await Promise.all([
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('risk_level', 'regular'),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('risk_level', 'high'),
  ])

  return [
    { name: 'Regular', value: regularResult.count ?? 0, fill: '#22c55e' },
    { name: 'High', value: highResult.count ?? 0, fill: '#ef4444' },
  ]
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
