'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadAndSaveDocument, deleteFile } from '@/lib/services/storage'
import type { DocumentType } from '@/types/database'
import type { StorageBucket } from '@/lib/services/storage'

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      customerId,
      documentType,
    }: {
      file: File
      customerId: string
      documentType: DocumentType
    }) => {
      return uploadAndSaveDocument(file, customerId, documentType)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bucket,
      storagePath,
    }: {
      bucket: StorageBucket
      storagePath: string
      customerId: string
    }) => {
      return deleteFile(bucket, storagePath)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] })
    },
  })
}
