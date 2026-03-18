import { createClient } from '@/lib/supabase/client'
import type { DocumentType } from '@/types/database'

// ─── Storage Bucket Names ────────────────────────────────────────────────────

export const STORAGE_BUCKETS = {
  nidImages: 'nid-images',
  photographs: 'photographs',
  signatures: 'signatures',
  nomineeDocuments: 'nominee-documents',
} as const

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]

// ─── Bucket for document type mapping ────────────────────────────────────────

const DOCUMENT_TYPE_BUCKET: Record<DocumentType, StorageBucket> = {
  nid_front: STORAGE_BUCKETS.nidImages,
  nid_back: STORAGE_BUCKETS.nidImages,
  photograph: STORAGE_BUCKETS.photographs,
  signature: STORAGE_BUCKETS.signatures,
  nominee_photo: STORAGE_BUCKETS.nomineeDocuments,
  nominee_nid: STORAGE_BUCKETS.nomineeDocuments,
}

// ─── File validation ─────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` }
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed. Accepted: JPEG, PNG, WebP` }
  }
  return { valid: true }
}

// ─── Generate storage path ──────────────────────────────────────────────────

export function generateStoragePath(
  customerId: string,
  documentType: DocumentType,
  fileName: string
): string {
  const parts = fileName.split('.')
  const ext = parts.length > 1 ? parts.pop()! : 'jpg'
  const timestamp = Date.now()
  return `${customerId}/${documentType}_${timestamp}.${ext}`
}

// ─── Upload file to Supabase Storage ─────────────────────────────────────────

export interface UploadResult {
  storagePath: string
  publicUrl: string
  bucket: StorageBucket
}

export async function uploadFile(
  file: File,
  customerId: string,
  documentType: DocumentType
): Promise<UploadResult> {
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const bucket = DOCUMENT_TYPE_BUCKET[documentType]
  const storagePath = generateStoragePath(customerId, documentType, file.name)

  const supabase = createClient()

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath)

  return {
    storagePath,
    publicUrl: urlData.publicUrl,
    bucket,
  }
}

// ─── Save document metadata to DB ────────────────────────────────────────────

export async function saveDocumentMetadata(
  customerId: string,
  documentType: DocumentType,
  storagePath: string,
  fileName: string,
  fileSize: number,
  mimeType: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('customer_documents')
    .insert({
      customer_id: customerId,
      document_type: documentType,
      storage_path: storagePath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to save document metadata: ${error.message}`)
  return data
}

// ─── Combined upload + save ──────────────────────────────────────────────────

export async function uploadAndSaveDocument(
  file: File,
  customerId: string,
  documentType: DocumentType
) {
  const uploadResult = await uploadFile(file, customerId, documentType)

  const metadata = await saveDocumentMetadata(
    customerId,
    documentType,
    uploadResult.storagePath,
    file.name,
    file.size,
    file.type
  )

  return {
    ...uploadResult,
    document: metadata,
  }
}

// ─── Delete file from storage ────────────────────────────────────────────────

export async function deleteFile(
  bucket: StorageBucket,
  storagePath: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).remove([storagePath])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

// ─── Get signed URL (for private buckets) ────────────────────────────────────

export async function getSignedUrl(
  bucket: StorageBucket,
  storagePath: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}
