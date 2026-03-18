/**
 * EC NID Database API Integration
 *
 * Integrates with Bangladesh Election Commission's National ID Database
 * for biometric verification during e-KYC onboarding.
 *
 * API endpoint: Configured via NID_API_BASE_URL environment variable
 * Supports: fingerprint and face_matching verification models
 */

import type { VerificationModel } from '@/types/database'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NIDVerificationRequest {
  nid_number: string
  date_of_birth: string
  verification_model: VerificationModel
  biometric_data?: string // Base64-encoded fingerprint or face image
}

export interface NIDPersonData {
  nid_number: string
  name_en: string
  name_bn: string
  father_name_en: string
  father_name_bn: string
  mother_name_en: string
  mother_name_bn: string
  date_of_birth: string
  gender: 'M' | 'F' | 'T'
  present_address: string
  permanent_address: string
  photo_url: string | null
}

export interface NIDVerificationResponse {
  success: boolean
  verified: boolean
  match_score: number // 0-100 confidence score
  person_data: NIDPersonData | null
  error_code: string | null
  error_message: string | null
  verification_id: string
  verified_at: string
}

// ─── Error codes ─────────────────────────────────────────────────────────────

export const NID_ERROR_CODES = {
  INVALID_NID: 'INVALID_NID',
  NID_NOT_FOUND: 'NID_NOT_FOUND',
  DOB_MISMATCH: 'DOB_MISMATCH',
  BIOMETRIC_MISMATCH: 'BIOMETRIC_MISMATCH',
  API_UNAVAILABLE: 'API_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
} as const

export type NIDErrorCode = (typeof NID_ERROR_CODES)[keyof typeof NID_ERROR_CODES]

// ─── API Client ──────────────────────────────────────────────────────────────

const NID_API_BASE_URL = process.env.NEXT_PUBLIC_NID_API_URL || ''

export async function verifyNID(
  request: NIDVerificationRequest
): Promise<NIDVerificationResponse> {
  // If NID API URL is not configured, use simulated verification
  if (!NID_API_BASE_URL) {
    return simulateNIDVerification(request)
  }

  try {
    const response = await fetch(`${NID_API_BASE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_NID_API_KEY || ''}`,
      },
      body: JSON.stringify({
        nid_number: request.nid_number,
        date_of_birth: request.date_of_birth,
        verification_model: request.verification_model,
        biometric_data: request.biometric_data,
      }),
    })

    if (response.status === 429) {
      return {
        success: false,
        verified: false,
        match_score: 0,
        person_data: null,
        error_code: NID_ERROR_CODES.RATE_LIMITED,
        error_message: 'Too many verification requests. Please try again later.',
        verification_id: '',
        verified_at: new Date().toISOString(),
      }
    }

    if (!response.ok) {
      return {
        success: false,
        verified: false,
        match_score: 0,
        person_data: null,
        error_code: NID_ERROR_CODES.API_UNAVAILABLE,
        error_message: `NID API returned status ${response.status}`,
        verification_id: '',
        verified_at: new Date().toISOString(),
      }
    }

    const data = await response.json()
    return data as NIDVerificationResponse
  } catch {
    return {
      success: false,
      verified: false,
      match_score: 0,
      person_data: null,
      error_code: NID_ERROR_CODES.API_UNAVAILABLE,
      error_message: 'Unable to connect to NID verification service',
      verification_id: '',
      verified_at: new Date().toISOString(),
    }
  }
}

// ─── Simulated verification (fallback when API not configured) ───────────────

export function simulateNIDVerification(
  request: NIDVerificationRequest
): NIDVerificationResponse {
  const { nid_number, date_of_birth } = request

  // Validate NID format (10 digits)
  if (!/^\d{10}$/.test(nid_number)) {
    return {
      success: true,
      verified: false,
      match_score: 0,
      person_data: null,
      error_code: NID_ERROR_CODES.INVALID_NID,
      error_message: 'NID number must be exactly 10 digits',
      verification_id: `SIM-${Date.now()}`,
      verified_at: new Date().toISOString(),
    }
  }

  // Simulate a "not found" case for NIDs starting with 000
  if (nid_number.startsWith('000')) {
    return {
      success: true,
      verified: false,
      match_score: 0,
      person_data: null,
      error_code: NID_ERROR_CODES.NID_NOT_FOUND,
      error_message: 'NID number not found in EC database',
      verification_id: `SIM-${Date.now()}`,
      verified_at: new Date().toISOString(),
    }
  }

  // Simulate successful verification
  const verificationId = `SIM-${Date.now()}`
  const matchScore = request.verification_model === 'fingerprint' ? 95 : 88

  return {
    success: true,
    verified: true,
    match_score: matchScore,
    person_data: {
      nid_number,
      name_en: 'NOOR ALAM',
      name_bn: '\u09A8\u09C2\u09B0 \u0986\u09B2\u09AE',
      father_name_en: 'KALA MIA',
      father_name_bn: '\u0995\u09BE\u09B2\u09BE \u09AE\u09BF\u09AF\u09BC\u09BE',
      mother_name_en: 'SORU BEGUM',
      mother_name_bn: '\u09B8\u09B0\u09C1 \u09AC\u09C7\u0997\u09AE',
      date_of_birth,
      gender: 'M',
      present_address: 'Dhaka, Bangladesh',
      permanent_address: 'Dhaka, Bangladesh',
      photo_url: null,
    },
    error_code: null,
    error_message: null,
    verification_id: verificationId,
    verified_at: new Date().toISOString(),
  }
}

// ─── Lookup NID data only (no biometric) ─────────────────────────────────────

export async function lookupNID(
  nidNumber: string,
  dateOfBirth: string
): Promise<NIDVerificationResponse> {
  return verifyNID({
    nid_number: nidNumber,
    date_of_birth: dateOfBirth,
    verification_model: 'fingerprint', // default, not used for lookup
  })
}
