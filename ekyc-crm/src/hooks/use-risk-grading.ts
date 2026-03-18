'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { RiskGrading, RiskGradingFormData, RiskLevel } from '@/types/database'

const supabase = createClient()

// ─── Risk level calculation ──────────────────────────────────────────────────

export function calculateRiskLevel(totalScore: number): RiskLevel {
  // Per BB guidelines: total score < 15 = Regular, >= 15 = High (triggers EDD)
  return totalScore < 15 ? 'regular' : 'high'
}

// ─── Fetch risk grading for a customer ───────────────────────────────────────

async function fetchRiskGrading(customerId: string): Promise<RiskGrading | null> {
  const { data, error } = await supabase
    .from('risk_gradings')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as RiskGrading | null
}

export function useRiskGrading(customerId: string) {
  return useQuery({
    queryKey: ['risk-grading', customerId],
    queryFn: () => fetchRiskGrading(customerId),
    enabled: !!customerId,
  })
}

// ─── Create risk grading ─────────────────────────────────────────────────────

export function useCreateRiskGrading() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RiskGradingFormData) => {
      const totalScore =
        data.dimension_1_score +
        data.dimension_2_score +
        data.dimension_3_score +
        data.dimension_4_score +
        data.dimension_5_score +
        data.dimension_6_score +
        data.dimension_7_score

      const riskLevel = calculateRiskLevel(totalScore)

      const { data: grading, error } = await supabase
        .from('risk_gradings')
        .insert({
          ...data,
          total_score: totalScore,
          risk_level: riskLevel,
        })
        .select()
        .single()

      if (error) throw error

      // Update customer risk level
      await supabase
        .from('customers')
        .update({
          risk_level: riskLevel,
          risk_score: totalScore,
        })
        .eq('id', data.customer_id)

      return grading as RiskGrading
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['risk-grading', variables.customer_id],
      })
      queryClient.invalidateQueries({
        queryKey: ['risk-grading-history', variables.customer_id],
      })
      queryClient.invalidateQueries({
        queryKey: ['customer', variables.customer_id],
      })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ─── Fetch risk grading history ──────────────────────────────────────────────

async function fetchRiskGradingHistory(
  customerId: string
): Promise<RiskGrading[]> {
  const { data, error } = await supabase
    .from('risk_gradings')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as RiskGrading[]
}

export function useRiskGradingHistory(customerId: string) {
  return useQuery({
    queryKey: ['risk-grading-history', customerId],
    queryFn: () => fetchRiskGradingHistory(customerId),
    enabled: !!customerId,
  })
}
