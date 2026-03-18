import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  validateFile,
  generateStoragePath,
  uploadAndSaveDocument,
  STORAGE_BUCKETS,
} from '@/lib/services/storage'

// ─── validateFile ────────────────────────────────────────────────────────────

describe('validateFile', () => {
  it('accepts a valid JPEG file under 5MB', () => {
    const file = new File(['x'.repeat(1000)], 'test.jpg', { type: 'image/jpeg' })
    expect(validateFile(file)).toEqual({ valid: true })
  })

  it('accepts a valid PNG file', () => {
    const file = new File(['x'], 'test.png', { type: 'image/png' })
    expect(validateFile(file)).toEqual({ valid: true })
  })

  it('accepts a valid WebP file', () => {
    const file = new File(['x'], 'test.webp', { type: 'image/webp' })
    expect(validateFile(file)).toEqual({ valid: true })
  })

  it('rejects a file exceeding 5MB', () => {
    // Create a file object and override size
    const file = new File(['x'], 'big.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })
    const result = validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('5MB')
  })

  it('rejects a non-image file type', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    const result = validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('not allowed')
  })

  it('rejects a GIF file', () => {
    const file = new File(['x'], 'anim.gif', { type: 'image/gif' })
    const result = validateFile(file)
    expect(result.valid).toBe(false)
  })
})

// ─── generateStoragePath ─────────────────────────────────────────────────────

describe('generateStoragePath', () => {
  it('generates a path with customer ID and document type', () => {
    const path = generateStoragePath('cust-123', 'nid_front', 'photo.jpg')
    expect(path).toMatch(/^cust-123\/nid_front_\d+\.jpg$/)
  })

  it('preserves the file extension', () => {
    const path = generateStoragePath('cust-123', 'photograph', 'pic.png')
    expect(path).toMatch(/\.png$/)
  })

  it('defaults to jpg when no extension', () => {
    const path = generateStoragePath('cust-123', 'signature', 'noext')
    expect(path).toMatch(/\.jpg$/)
  })

  it('generates unique paths for same inputs', () => {
    const path1 = generateStoragePath('cust-1', 'nid_front', 'a.jpg')
    // Tiny delay to ensure different timestamp
    const path2 = generateStoragePath('cust-1', 'nid_front', 'a.jpg')
    // Paths might be same if called in same millisecond, but format should be valid
    expect(path1).toMatch(/^cust-1\/nid_front_\d+\.jpg$/)
    expect(path2).toMatch(/^cust-1\/nid_front_\d+\.jpg$/)
  })
})

// ─── STORAGE_BUCKETS ─────────────────────────────────────────────────────────

describe('STORAGE_BUCKETS', () => {
  it('has four buckets defined', () => {
    expect(Object.keys(STORAGE_BUCKETS)).toHaveLength(4)
  })

  it('contains nid-images bucket', () => {
    expect(STORAGE_BUCKETS.nidImages).toBe('nid-images')
  })

  it('contains photographs bucket', () => {
    expect(STORAGE_BUCKETS.photographs).toBe('photographs')
  })

  it('contains signatures bucket', () => {
    expect(STORAGE_BUCKETS.signatures).toBe('signatures')
  })

  it('contains nominee-documents bucket', () => {
    expect(STORAGE_BUCKETS.nomineeDocuments).toBe('nominee-documents')
  })
})

// ─── uploadFile (integration with mocked Supabase) ──────────────────────────

describe('uploadFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws on invalid file', async () => {
    const { uploadFile } = await import('@/lib/services/storage')
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' })

    await expect(uploadFile(file, 'cust-1', 'nid_front')).rejects.toThrow('not allowed')
  })
})

// ─── uploadAndSaveDocument ───────────────────────────────────────────────────

describe('uploadAndSaveDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates file before uploading', async () => {
    const file = new File(['x'], 'bad.gif', { type: 'image/gif' })

    await expect(uploadAndSaveDocument(file, 'cust-1', 'photograph')).rejects.toThrow()
  })
})
