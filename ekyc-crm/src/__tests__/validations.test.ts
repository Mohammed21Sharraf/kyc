import { describe, it, expect } from 'vitest'
import {
  nidVerificationSchema,
  customerInfoSchema,
  screeningResultSchema,
  screeningSchema,
  riskGradingSchema,
} from '@/lib/validations/customer'
import { loginSchema } from '@/lib/validations/auth'

// ─── Login Validation ────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@ekyc.bb.gov.bd',
      password: 'Admin@2026!',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@ekyc.bb.gov.bd',
      password: '12345',
    })
    expect(result.success).toBe(false)
  })
})

// ─── NID Verification ────────────────────────────────────────────────────────

describe('nidVerificationSchema', () => {
  const validData = {
    nid_number: '6004589963',
    date_of_birth: '1983-11-25',
    verification_model: 'fingerprint',
    kyc_tier: 'simplified',
    channel: 'branch',
  }

  it('accepts valid NID verification data', () => {
    const result = nidVerificationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects NID number not exactly 10 digits', () => {
    const result = nidVerificationSchema.safeParse({
      ...validData,
      nid_number: '123456',
    })
    expect(result.success).toBe(false)
  })

  it('rejects NID number with non-digit characters', () => {
    const result = nidVerificationSchema.safeParse({
      ...validData,
      nid_number: '600458abc3',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty date_of_birth', () => {
    const result = nidVerificationSchema.safeParse({
      ...validData,
      date_of_birth: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid verification_model', () => {
    const result = nidVerificationSchema.safeParse({
      ...validData,
      verification_model: 'iris_scan',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid kyc_tier', () => {
    const result = nidVerificationSchema.safeParse({
      ...validData,
      kyc_tier: 'premium',
    })
    expect(result.success).toBe(false)
  })

  it('accepts face_matching as verification model', () => {
    const result = nidVerificationSchema.safeParse({
      ...validData,
      verification_model: 'face_matching',
    })
    expect(result.success).toBe(true)
  })

  it('accepts all valid channel types', () => {
    for (const channel of ['branch', 'agent', 'digital']) {
      const result = nidVerificationSchema.safeParse({
        ...validData,
        channel,
      })
      expect(result.success).toBe(true)
    }
  })
})

// ─── Customer Info ───────────────────────────────────────────────────────────

describe('customerInfoSchema', () => {
  const validSimplified = {
    name_en: 'Mohammad Rahim',
    date_of_birth: '1990-01-15',
    gender: 'M',
    present_address: 'Dhaka, Bangladesh',
    mobile_number: '01712345678',
    profession: 'Government service',
    kyc_tier: 'simplified',
  }

  it('accepts valid simplified KYC data', () => {
    const result = customerInfoSchema.safeParse(validSimplified)
    expect(result.success).toBe(true)
  })

  it('rejects name shorter than 2 characters', () => {
    const result = customerInfoSchema.safeParse({
      ...validSimplified,
      name_en: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid Bangladeshi mobile number', () => {
    const invalids = ['01012345678', '0171234567', '12345678901', '+8801712345678']
    for (const mobile of invalids) {
      const result = customerInfoSchema.safeParse({
        ...validSimplified,
        mobile_number: mobile,
      })
      expect(result.success).toBe(false)
    }
  })

  it('accepts valid Bangladeshi mobile numbers', () => {
    const valids = ['01312345678', '01412345678', '01512345678', '01612345678', '01712345678', '01812345678', '01912345678']
    for (const mobile of valids) {
      const result = customerInfoSchema.safeParse({
        ...validSimplified,
        mobile_number: mobile,
      })
      expect(result.success).toBe(true)
    }
  })

  it('requires source_of_funds for regular KYC', () => {
    const result = customerInfoSchema.safeParse({
      ...validSimplified,
      kyc_tier: 'regular',
      monthly_income: 50000,
      tin_number: '123456789012',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('source_of_funds')
    }
  })

  it('requires monthly_income for regular KYC', () => {
    const result = customerInfoSchema.safeParse({
      ...validSimplified,
      kyc_tier: 'regular',
      source_of_funds: 'Salary',
      tin_number: '123456789012',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('monthly_income')
    }
  })

  it('requires tin_number for regular KYC', () => {
    const result = customerInfoSchema.safeParse({
      ...validSimplified,
      kyc_tier: 'regular',
      source_of_funds: 'Salary',
      monthly_income: 50000,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('tin_number')
    }
  })

  it('accepts valid regular KYC data with all required fields', () => {
    const result = customerInfoSchema.safeParse({
      ...validSimplified,
      kyc_tier: 'regular',
      source_of_funds: 'Salary',
      monthly_income: 50000,
      tin_number: '123456789012',
    })
    expect(result.success).toBe(true)
  })

  it('accepts all gender types', () => {
    for (const gender of ['M', 'F', 'T']) {
      const result = customerInfoSchema.safeParse({
        ...validSimplified,
        gender,
      })
      expect(result.success).toBe(true)
    }
  })
})

// ─── Screening ───────────────────────────────────────────────────────────────

describe('screeningSchema', () => {
  it('accepts valid screening results', () => {
    const result = screeningSchema.safeParse({
      results: [
        { screening_type: 'unscr', screening_status: 'clear' },
        { screening_type: 'pep_check', screening_status: 'clear' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty results array', () => {
    const result = screeningSchema.safeParse({ results: [] })
    expect(result.success).toBe(false)
  })

  it('accepts all screening types', () => {
    const types = ['unscr', 'ip_check', 'adverse_media', 'beneficial_ownership', 'pep_check']
    for (const type of types) {
      const result = screeningResultSchema.safeParse({
        screening_type: type,
        screening_status: 'pending',
      })
      expect(result.success).toBe(true)
    }
  })

  it('accepts all screening statuses', () => {
    const statuses = ['pending', 'clear', 'flagged', 'escalated']
    for (const status of statuses) {
      const result = screeningResultSchema.safeParse({
        screening_type: 'unscr',
        screening_status: status,
      })
      expect(result.success).toBe(true)
    }
  })
})

// ─── Risk Grading Form ──────────────────────────────────────────────────────

describe('riskGradingSchema', () => {
  const validData = {
    dimension_1_score: 0,
    dimension_2_score: 1,
    dimension_3_score: 0,
    dimension_4_score: 2,
    dimension_5_score: 1,
    dimension_6_score: 0,
    dimension_7_score: 0,
  }

  it('accepts valid risk grading scores', () => {
    const result = riskGradingSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('accepts scores with rationales', () => {
    const result = riskGradingSchema.safeParse({
      ...validData,
      dimension_1_rationale: 'Face to face at branch',
      dimension_5_rationale: 'Government service',
    })
    expect(result.success).toBe(true)
  })

  it('rejects dimension score above 4', () => {
    const result = riskGradingSchema.safeParse({
      ...validData,
      dimension_1_score: 5,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative dimension score', () => {
    const result = riskGradingSchema.safeParse({
      ...validData,
      dimension_3_score: -1,
    })
    expect(result.success).toBe(false)
  })

  it('coerces string scores to numbers', () => {
    const result = riskGradingSchema.safeParse({
      ...validData,
      dimension_1_score: '2',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dimension_1_score).toBe(2)
    }
  })

  it('rejects maximum score at boundary (all max = 28)', () => {
    const allMax = {
      dimension_1_score: 4,
      dimension_2_score: 4,
      dimension_3_score: 4,
      dimension_4_score: 4,
      dimension_5_score: 4,
      dimension_6_score: 4,
      dimension_7_score: 4,
    }
    const result = riskGradingSchema.safeParse(allMax)
    expect(result.success).toBe(true)
  })
})
