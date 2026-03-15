// ─── Onboarding Steps ────────────────────────────────────────────────────────

export const ONBOARDING_STEPS = [
  {
    step: 1,
    name: 'NID Verification',
    description: 'Verify the customer\'s National ID number and date of birth against the NID database.',
  },
  {
    step: 2,
    name: 'NID Scan',
    description: 'Upload scanned copies of the front and back of the customer\'s NID card.',
  },
  {
    step: 3,
    name: 'Customer Information',
    description: 'Collect detailed personal, contact, and financial information from the customer.',
  },
  {
    step: 4,
    name: 'Photograph',
    description: 'Capture or upload a recent photograph of the customer for identity verification.',
  },
  {
    step: 5,
    name: 'Signature',
    description: 'Capture or upload the customer\'s specimen signature.',
  },
  {
    step: 6,
    name: 'Screening & Review',
    description: 'Run screening checks and review the complete application before submission.',
  },
] as const

// ─── Risk Dimensions (7-Dimension Matrix from Annexure-2 A3/A4/A5) ─────────

export const RISK_DIMENSIONS = [
  {
    dimension: 1,
    name: 'Type of On-boarding',
    description: 'Risk based on the method of customer on-boarding.',
    options: [
      { label: 'Face to face at branch', score: 0 },
      { label: 'Agent Banking', score: 1 },
      { label: 'Digital/Remote', score: 2 },
      { label: 'Third-party reliance', score: 3 },
    ],
  },
  {
    dimension: 2,
    name: 'Geographic/Jurisdictional Risk',
    description: 'Risk based on the geographic location of the customer.',
    options: [
      { label: 'Domestic - Urban', score: 0 },
      { label: 'Domestic - Rural', score: 1 },
      { label: 'Border district', score: 2 },
      { label: 'High-risk jurisdiction (FATF list)', score: 3 },
      { label: 'Sanctioned country', score: 4 },
    ],
  },
  {
    dimension: 3,
    name: 'Type of Customer (PEP/IP)',
    description: 'Risk based on whether the customer is a Politically Exposed Person or Influential Person.',
    options: [
      { label: 'General individual', score: 0 },
      { label: 'Family member of PEP', score: 1 },
      { label: 'Close associate of PEP', score: 2 },
      { label: 'Domestic PEP', score: 3 },
      { label: 'Foreign PEP', score: 4 },
    ],
  },
  {
    dimension: 4,
    name: 'Product and Channel Risk',
    description: 'Risk based on the banking products and channels used.',
    options: [
      { label: 'Savings account only', score: 0 },
      { label: 'Savings + debit card', score: 1 },
      { label: 'Full banking with digital', score: 2 },
      { label: 'International transaction enabled', score: 3 },
      { label: 'High-value investment products', score: 4 },
    ],
  },
  {
    dimension: 5,
    name: 'Business/Profession Risk',
    description: 'Risk based on the customer\'s profession or business type (see A6 lookup table).',
    options: [
      { label: 'Low risk profession', score: 1 },
      { label: 'Medium risk', score: 2 },
      { label: 'High risk', score: 3 },
      { label: 'Very high risk', score: 4 },
    ],
  },
  {
    dimension: 6,
    name: 'Transactional Risk',
    description: 'Risk based on expected transaction patterns and volumes.',
    options: [
      { label: 'Low transaction volume', score: 0 },
      { label: 'Moderate', score: 1 },
      { label: 'High volume', score: 2 },
      { label: 'Cash-intensive', score: 3 },
      { label: 'Unusual patterns', score: 4 },
    ],
  },
  {
    dimension: 7,
    name: 'Transparency Risk',
    description: 'Risk based on the completeness and quality of documentation provided.',
    options: [
      { label: 'Full documentation provided', score: 0 },
      { label: 'Minor gaps in documentation', score: 1 },
      { label: 'Significant gaps', score: 2 },
      { label: 'Reluctant to provide info', score: 3 },
      { label: 'Suspicious/inconsistent info', score: 4 },
    ],
  },
] as const

// ─── Business Risk Scores (Annexure-2 A6) ───────────────────────────────────

export const BUSINESS_RISK_SCORES: Record<string, number> = {
  // Low risk (score: 1)
  'Government service': 1,
  'Teaching': 1,
  'Doctor / Physician': 1,
  'Engineer': 1,
  'Farming / Agriculture': 1,
  'Retired persons': 1,
  'Lawyer / Legal professional': 1,
  // Medium risk (score: 2)
  'Business (small)': 2,
  'Private service': 2,
  'Student': 2,
  'Housewife': 2,
  'IT / Software': 2,
  'Garments / Textile': 2,
  'Transport': 2,
  'Construction': 2,
  'Freelancer': 2,
  // High risk (score: 3)
  'Money changer': 3,
  'Real estate': 3,
  'Jeweler / Precious metals': 3,
  'NGO / NPO': 3,
  'Arms dealer': 3,
  'Import / Export': 3,
  // Very high risk (score: 4)
  'Casino': 4,
  'Gambling': 4,
  'Virtual assets / Cryptocurrency': 4,
}

// ─── Transaction Limits (Section 2.3.1) ─────────────────────────────────────

export const TRANSACTION_LIMITS = {
  simplified: {
    daily_debit_limit: 25_000,
    daily_credit_limit: 50_000,
    monthly_debit_limit: 200_000,
    monthly_credit_limit: 200_000,
  },
  regular: {
    daily_debit_limit: 200_000,
    daily_credit_limit: 500_000,
    monthly_debit_limit: 1_000_000,
    monthly_credit_limit: 1_000_000,
  },
} as const

// ─── Option Lists ────────────────────────────────────────────────────────────

export const KYC_TIER_OPTIONS = [
  { label: 'Simplified', value: 'simplified' as const },
  { label: 'Regular', value: 'regular' as const },
] as const

export const CHANNEL_OPTIONS = [
  { label: 'Branch', value: 'branch' as const },
  { label: 'Agent Banking', value: 'agent' as const },
  { label: 'Digital', value: 'digital' as const },
] as const

export const VERIFICATION_MODEL_OPTIONS = [
  { label: 'Fingerprint', value: 'fingerprint' as const },
  { label: 'Face Matching', value: 'face_matching' as const },
] as const
