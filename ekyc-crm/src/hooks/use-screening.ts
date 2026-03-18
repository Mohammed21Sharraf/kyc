'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runScreening, saveScreeningResults } from '@/lib/services/screening'
import type { ScreeningRequest } from '@/lib/services/screening'

export function useRunScreening() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      request,
      customerId,
    }: {
      request: ScreeningRequest
      customerId: string
    }) => {
      const response = await runScreening(request)

      if (!response.success) {
        throw new Error(response.error || 'Screening failed')
      }

      // Save results to database
      await saveScreeningResults(customerId, response.results)

      return response
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] })
    },
  })
}
