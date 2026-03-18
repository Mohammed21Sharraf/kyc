'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
  Customer,
  CustomerWithRelations,
  CustomerFormData,
  CustomerFilters,
} from '@/types/database'

const supabase = createClient()

// In-progress statuses (not completed, not failed)
const IN_PROGRESS_STATUSES = [
  'nid_verification',
  'nid_scan',
  'customer_info',
  'photograph_capture',
  'signature_capture',
  'screening_review',
]

// ─── Fetch customer list with filters ────────────────────────────────────────

async function fetchCustomers(filters: CustomerFilters) {
  const {
    search,
    kyc_tier,
    onboarding_status,
    risk_level,
    page = 1,
    pageSize = 20,
  } = filters

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(
      `name_en.ilike.%${search}%,nid_number.ilike.%${search}%,mobile_number.ilike.%${search}%,reference_id.ilike.%${search}%`
    )
  }

  if (kyc_tier && kyc_tier !== 'all') query = query.eq('kyc_tier', kyc_tier)

  // Handle "in_progress" as a virtual status filter
  if (onboarding_status && onboarding_status !== 'all') {
    if (onboarding_status === 'in_progress') {
      query = query.in('onboarding_status', IN_PROGRESS_STATUSES)
    } else {
      query = query.eq('onboarding_status', onboarding_status)
    }
  }

  if (risk_level && risk_level !== 'all') query = query.eq('risk_level', risk_level)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    customers: data as Customer[],
    total: count ?? 0,
    page,
    pageSize,
  }
}

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => fetchCustomers(filters),
  })
}

// ─── Fetch single customer with relations ────────────────────────────────────

async function fetchCustomer(id: string): Promise<CustomerWithRelations> {
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  const [nominees, documents, screeningResults, riskGrading] = await Promise.all([
    supabase.from('nominees').select('*').eq('customer_id', id),
    supabase.from('customer_documents').select('*').eq('customer_id', id),
    supabase.from('screening_results').select('*').eq('customer_id', id),
    supabase
      .from('risk_gradings')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  return {
    ...customer,
    nominees: nominees.data ?? [],
    documents: documents.data ?? [],
    screening_results: screeningResults.data ?? [],
    risk_grading: riskGrading.data ?? null,
  } as CustomerWithRelations
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomer(id),
    enabled: !!id,
  })
}

// ─── Create customer ─────────────────────────────────────────────────────────

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const { data: customer, error } = await supabase
        .from('customers')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return customer as Customer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

// ─── Update customer ─────────────────────────────────────────────────────────

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<CustomerFormData>
    }) => {
      const { data: customer, error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return customer as Customer
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] })
    },
  })
}
