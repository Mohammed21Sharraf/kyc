import { z } from 'zod'

// ─── Step 1: NID Verification ────────────────────────────────────────────────

export const nidVerificationSchema = z.object({
  nid_number: z
    .string()
    .regex(/^\d{10}$/, 'NID number must be exactly 10 digits'),
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required'),
  verification_model: z.enum(['fingerprint', 'face_matching']),
  kyc_tier: z.enum(['simplified', 'regular']),
  channel: z.enum(['branch', 'agent', 'digital']),
})

export type NidVerificationFormData = z.infer<typeof nidVerificationSchema>

// ─── Step 2: NID Scan ────────────────────────────────────────────────────────

export const nidScanSchema = z.object({
  nid_front: z
    .instanceof(File, { message: 'NID front image is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be JPEG, PNG, or WebP'
    ),
  nid_back: z
    .instanceof(File, { message: 'NID back image is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be JPEG, PNG, or WebP'
    ),
})

export type NidScanFormData = z.infer<typeof nidScanSchema>

// ─── Step 3: Customer Information ────────────────────────────────────────────

export const customerInfoSchema = z
  .object({
    name_en: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(200, 'Name must be at most 200 characters'),
    name_bn: z.string().optional(),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['M', 'F', 'T']),
    father_name_en: z.string().optional(),
    father_name_bn: z.string().optional(),
    mother_name_en: z.string().optional(),
    mother_name_bn: z.string().optional(),
    spouse_name_en: z.string().optional(),
    spouse_name_bn: z.string().optional(),
    present_address: z
      .string()
      .min(5, 'Address must be at least 5 characters')
      .max(500, 'Address must be at most 500 characters'),
    permanent_address: z.string().max(500).optional(),
    mobile_number: z
      .string()
      .regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladeshi mobile number'),
    email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
    profession: z.string().min(1, 'Profession is required'),
    employer_name: z.string().optional(),
    source_of_funds: z.string().optional(),
    monthly_income: z.coerce.number().nonnegative().optional(),
    tin_number: z.string().optional(),
    other_bank_accounts: z.string().optional(),
    kyc_tier: z.enum(['simplified', 'regular']),
  })
  .superRefine((data, ctx) => {
    if (data.kyc_tier === 'regular') {
      if (!data.source_of_funds || data.source_of_funds.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Source of funds is required for regular KYC',
          path: ['source_of_funds'],
        })
      }
      if (!data.monthly_income || data.monthly_income <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Monthly income is required for regular KYC',
          path: ['monthly_income'],
        })
      }
      if (!data.tin_number || data.tin_number.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'TIN number is required for regular KYC',
          path: ['tin_number'],
        })
      }
    }
  })

export type CustomerInfoFormData = z.infer<typeof customerInfoSchema>

// ─── Step 4: Photograph ──────────────────────────────────────────────────────

export const photographSchema = z.object({
  photograph: z
    .instanceof(File, { message: 'Photograph is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be JPEG, PNG, or WebP'
    ),
})

export type PhotographFormData = z.infer<typeof photographSchema>

// ─── Step 5: Signature ───────────────────────────────────────────────────────

export const signatureSchema = z.object({
  signature: z
    .instanceof(File, { message: 'Signature is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be JPEG, PNG, or WebP'
    ),
})

export type SignatureFormData = z.infer<typeof signatureSchema>

// ─── Step 6: Screening ───────────────────────────────────────────────────────

export const screeningResultSchema = z.object({
  screening_type: z.enum(['unscr', 'ip_check', 'adverse_media', 'beneficial_ownership', 'pep_check']),
  screening_status: z.enum(['pending', 'clear', 'flagged', 'escalated']),
  notes: z.string().optional(),
})

export const screeningSchema = z.object({
  results: z
    .array(screeningResultSchema)
    .min(1, 'At least one screening result is required'),
})

export type ScreeningFormData = z.infer<typeof screeningSchema>

// ─── Risk Grading ────────────────────────────────────────────────────────────

const dimensionScore = z.coerce.number().int().min(0).max(4)

export const riskGradingSchema = z.object({
  dimension_1_score: dimensionScore,
  dimension_1_rationale: z.string().optional(),
  dimension_2_score: dimensionScore,
  dimension_2_rationale: z.string().optional(),
  dimension_3_score: dimensionScore,
  dimension_3_rationale: z.string().optional(),
  dimension_4_score: dimensionScore,
  dimension_4_rationale: z.string().optional(),
  dimension_5_score: dimensionScore,
  dimension_5_rationale: z.string().optional(),
  dimension_6_score: dimensionScore,
  dimension_6_rationale: z.string().optional(),
  dimension_7_score: dimensionScore,
  dimension_7_rationale: z.string().optional(),
})

export type RiskGradingFormValues = z.infer<typeof riskGradingSchema>
