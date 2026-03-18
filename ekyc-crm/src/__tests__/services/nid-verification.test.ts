import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  simulateNIDVerification,
  verifyNID,
  lookupNID,
  NID_ERROR_CODES,
} from '@/lib/services/nid-verification'

describe('simulateNIDVerification', () => {
  it('returns verified=true for valid 10-digit NID', () => {
    const result = simulateNIDVerification({
      nid_number: '6004589963',
      date_of_birth: '1983-11-25',
      verification_model: 'fingerprint',
    })

    expect(result.success).toBe(true)
    expect(result.verified).toBe(true)
    expect(result.match_score).toBeGreaterThan(0)
    expect(result.person_data).not.toBeNull()
    expect(result.verification_id).toMatch(/^SIM-/)
  })

  it('returns higher match score for fingerprint than face matching', () => {
    const fingerprint = simulateNIDVerification({
      nid_number: '6004589963',
      date_of_birth: '1983-11-25',
      verification_model: 'fingerprint',
    })

    const face = simulateNIDVerification({
      nid_number: '6004589963',
      date_of_birth: '1983-11-25',
      verification_model: 'face_matching',
    })

    expect(fingerprint.match_score).toBeGreaterThan(face.match_score)
  })

  it('returns INVALID_NID for non-10-digit NID', () => {
    const result = simulateNIDVerification({
      nid_number: '123456',
      date_of_birth: '1983-11-25',
      verification_model: 'fingerprint',
    })

    expect(result.verified).toBe(false)
    expect(result.error_code).toBe(NID_ERROR_CODES.INVALID_NID)
  })

  it('returns INVALID_NID for NID with letters', () => {
    const result = simulateNIDVerification({
      nid_number: '600458abc3',
      date_of_birth: '1983-11-25',
      verification_model: 'fingerprint',
    })

    expect(result.verified).toBe(false)
    expect(result.error_code).toBe(NID_ERROR_CODES.INVALID_NID)
  })

  it('returns NID_NOT_FOUND for NIDs starting with 000', () => {
    const result = simulateNIDVerification({
      nid_number: '0001234567',
      date_of_birth: '1983-11-25',
      verification_model: 'fingerprint',
    })

    expect(result.verified).toBe(false)
    expect(result.error_code).toBe(NID_ERROR_CODES.NID_NOT_FOUND)
  })

  it('returns person_data with correct NID and DOB', () => {
    const result = simulateNIDVerification({
      nid_number: '6004589963',
      date_of_birth: '1983-11-25',
      verification_model: 'face_matching',
    })

    expect(result.person_data?.nid_number).toBe('6004589963')
    expect(result.person_data?.date_of_birth).toBe('1983-11-25')
    expect(result.person_data?.name_en).toBeTruthy()
    expect(result.person_data?.name_bn).toBeTruthy()
  })

  it('returns verified_at timestamp', () => {
    const before = new Date().toISOString()
    const result = simulateNIDVerification({
      nid_number: '6004589963',
      date_of_birth: '1983-11-25',
      verification_model: 'fingerprint',
    })
    const after = new Date().toISOString()

    expect(result.verified_at).toBeTruthy()
    expect(result.verified_at >= before).toBe(true)
    expect(result.verified_at <= after).toBe(true)
  })

  it('includes gender in person data', () => {
    const result = simulateNIDVerification({
      nid_number: '6004589963',
      date_of_birth: '1983-11-25',
      verification_model: 'fingerprint',
    })

    expect(['M', 'F', 'T']).toContain(result.person_data?.gender)
  })

  it('returns INVALID_NID for 17-digit NID (too long)', () => {
    const result = simulateNIDVerification({
      nid_number: '12345678901234567',
      date_of_birth: '1983-11-25',
      verification_model: 'fingerprint',
    })

    expect(result.verified).toBe(false)
    expect(result.error_code).toBe(NID_ERROR_CODES.INVALID_NID)
  })
})

describe('verifyNID (without API configured)', () => {
  it('falls back to simulation when NID_API_BASE_URL is empty', async () => {
    const result = await verifyNID({
      nid_number: '6004589963',
      date_of_birth: '1983-11-25',
      verification_model: 'fingerprint',
    })

    expect(result.success).toBe(true)
    expect(result.verified).toBe(true)
    expect(result.verification_id).toMatch(/^SIM-/)
  })
})

describe('lookupNID', () => {
  it('performs lookup using default verification model', async () => {
    const result = await lookupNID('6004589963', '1983-11-25')

    expect(result.success).toBe(true)
    expect(result.verified).toBe(true)
    expect(result.person_data).not.toBeNull()
  })

  it('returns error for invalid NID', async () => {
    const result = await lookupNID('123', '1983-11-25')

    expect(result.verified).toBe(false)
    expect(result.error_code).toBe(NID_ERROR_CODES.INVALID_NID)
  })
})

describe('NID_ERROR_CODES', () => {
  it('defines all expected error codes', () => {
    expect(NID_ERROR_CODES.INVALID_NID).toBe('INVALID_NID')
    expect(NID_ERROR_CODES.NID_NOT_FOUND).toBe('NID_NOT_FOUND')
    expect(NID_ERROR_CODES.DOB_MISMATCH).toBe('DOB_MISMATCH')
    expect(NID_ERROR_CODES.BIOMETRIC_MISMATCH).toBe('BIOMETRIC_MISMATCH')
    expect(NID_ERROR_CODES.API_UNAVAILABLE).toBe('API_UNAVAILABLE')
    expect(NID_ERROR_CODES.RATE_LIMITED).toBe('RATE_LIMITED')
  })
})
