'use client'

import { useMutation } from '@tanstack/react-query'
import { verifyNID, lookupNID } from '@/lib/services/nid-verification'
import type { NIDVerificationRequest } from '@/lib/services/nid-verification'

export function useNIDVerification() {
  return useMutation({
    mutationFn: async (request: NIDVerificationRequest) => {
      const result = await verifyNID(request)
      if (!result.success) {
        throw new Error(result.error_message || 'NID verification failed')
      }
      return result
    },
  })
}

export function useNIDLookup() {
  return useMutation({
    mutationFn: async ({
      nidNumber,
      dateOfBirth,
    }: {
      nidNumber: string
      dateOfBirth: string
    }) => {
      const result = await lookupNID(nidNumber, dateOfBirth)
      if (!result.success) {
        throw new Error(result.error_message || 'NID lookup failed')
      }
      return result
    },
  })
}
