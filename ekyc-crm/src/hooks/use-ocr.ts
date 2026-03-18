'use client'

import { useMutation } from '@tanstack/react-query'
import { extractTextFromImage, extractNIDData } from '@/lib/services/ocr'

export function useOCRExtract() {
  return useMutation({
    mutationFn: async ({
      image,
      languages,
    }: {
      image: File
      languages?: string
    }) => {
      const result = await extractTextFromImage(image, languages)
      if (!result.success) {
        throw new Error(result.error || 'OCR extraction failed')
      }
      return result
    },
  })
}

export function useNIDOCR() {
  return useMutation({
    mutationFn: async ({
      frontImage,
      backImage,
    }: {
      frontImage: File
      backImage: File
    }) => {
      return extractNIDData(frontImage, backImage)
    },
  })
}
