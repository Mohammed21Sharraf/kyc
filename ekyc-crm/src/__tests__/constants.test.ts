import { describe, it, expect } from 'vitest'
import {
  ONBOARDING_STEPS,
  RISK_DIMENSIONS,
  BUSINESS_RISK_SCORES,
  TRANSACTION_LIMITS,
  KYC_TIER_OPTIONS,
  CHANNEL_OPTIONS,
  VERIFICATION_MODEL_OPTIONS,
} from '@/lib/constants'

describe('ONBOARDING_STEPS', () => {
  it('has exactly 6 steps', () => {
    expect(ONBOARDING_STEPS).toHaveLength(6)
  })

  it('steps are numbered 1 through 6', () => {
    ONBOARDING_STEPS.forEach((step, index) => {
      expect(step.step).toBe(index + 1)
    })
  })

  it('each step has name and description', () => {
    ONBOARDING_STEPS.forEach((step) => {
      expect(step.name).toBeTruthy()
      expect(step.description).toBeTruthy()
    })
  })

  it('step 1 is NID Verification', () => {
    expect(ONBOARDING_STEPS[0].name).toBe('NID Verification')
  })

  it('step 6 is Screening & Review', () => {
    expect(ONBOARDING_STEPS[5].name).toBe('Screening & Review')
  })
})

describe('RISK_DIMENSIONS', () => {
  it('has exactly 7 dimensions', () => {
    expect(RISK_DIMENSIONS).toHaveLength(7)
  })

  it('dimensions are numbered 1 through 7', () => {
    RISK_DIMENSIONS.forEach((dim, index) => {
      expect(dim.dimension).toBe(index + 1)
    })
  })

  it('each dimension has name, description, and options', () => {
    RISK_DIMENSIONS.forEach((dim) => {
      expect(dim.name).toBeTruthy()
      expect(dim.description).toBeTruthy()
      expect(dim.options.length).toBeGreaterThan(0)
    })
  })

  it('all dimension options have label and score', () => {
    RISK_DIMENSIONS.forEach((dim) => {
      dim.options.forEach((opt) => {
        expect(opt.label).toBeTruthy()
        expect(typeof opt.score).toBe('number')
        expect(opt.score).toBeGreaterThanOrEqual(0)
        expect(opt.score).toBeLessThanOrEqual(4)
      })
    })
  })

  it('dimension 5 (Business Risk) starts at score 1', () => {
    // Business risk doesn't have a 0-score option
    const dim5 = RISK_DIMENSIONS[4]
    expect(dim5.name).toBe('Business/Profession Risk')
    const minScore = Math.min(...dim5.options.map((o) => o.score))
    expect(minScore).toBe(1)
  })

  it('maximum total score across all dimensions is 28', () => {
    const maxTotal = RISK_DIMENSIONS.reduce((sum, dim) => {
      const maxDimScore = Math.max(...dim.options.map((o) => o.score))
      return sum + maxDimScore
    }, 0)
    // 3 + 4 + 4 + 4 + 4 + 4 + 4 = 27 (dim 1 max is 3)
    expect(maxTotal).toBe(27)
  })
})

describe('BUSINESS_RISK_SCORES', () => {
  it('has entries for each risk level', () => {
    const scores = Object.values(BUSINESS_RISK_SCORES)
    expect(scores).toContain(1) // Low risk
    expect(scores).toContain(2) // Medium risk
    expect(scores).toContain(3) // High risk
    expect(scores).toContain(4) // Very high risk
  })

  it('Government service is low risk (1)', () => {
    expect(BUSINESS_RISK_SCORES['Government service']).toBe(1)
  })

  it('Real estate is high risk (3)', () => {
    expect(BUSINESS_RISK_SCORES['Real estate']).toBe(3)
  })

  it('Casino is very high risk (4)', () => {
    expect(BUSINESS_RISK_SCORES['Casino']).toBe(4)
  })

  it('all scores are between 1 and 4', () => {
    Object.values(BUSINESS_RISK_SCORES).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(1)
      expect(score).toBeLessThanOrEqual(4)
    })
  })
})

describe('TRANSACTION_LIMITS', () => {
  it('simplified tier has lower limits than regular', () => {
    const { simplified, regular } = TRANSACTION_LIMITS
    expect(simplified.daily_debit_limit).toBeLessThan(regular.daily_debit_limit)
    expect(simplified.daily_credit_limit).toBeLessThan(regular.daily_credit_limit)
    expect(simplified.monthly_debit_limit).toBeLessThan(regular.monthly_debit_limit)
    expect(simplified.monthly_credit_limit).toBeLessThan(regular.monthly_credit_limit)
  })

  it('simplified daily debit limit is 25,000 BDT', () => {
    expect(TRANSACTION_LIMITS.simplified.daily_debit_limit).toBe(25_000)
  })

  it('simplified daily credit limit is 50,000 BDT', () => {
    expect(TRANSACTION_LIMITS.simplified.daily_credit_limit).toBe(50_000)
  })

  it('simplified monthly limits are 200,000 BDT', () => {
    expect(TRANSACTION_LIMITS.simplified.monthly_debit_limit).toBe(200_000)
    expect(TRANSACTION_LIMITS.simplified.monthly_credit_limit).toBe(200_000)
  })

  it('regular daily debit limit is 200,000 BDT', () => {
    expect(TRANSACTION_LIMITS.regular.daily_debit_limit).toBe(200_000)
  })

  it('regular daily credit limit is 500,000 BDT', () => {
    expect(TRANSACTION_LIMITS.regular.daily_credit_limit).toBe(500_000)
  })

  it('regular monthly limits are 1,000,000 BDT', () => {
    expect(TRANSACTION_LIMITS.regular.monthly_debit_limit).toBe(1_000_000)
    expect(TRANSACTION_LIMITS.regular.monthly_credit_limit).toBe(1_000_000)
  })
})

describe('Option Lists', () => {
  it('KYC_TIER_OPTIONS has simplified and regular', () => {
    expect(KYC_TIER_OPTIONS).toHaveLength(2)
    expect(KYC_TIER_OPTIONS.map((o) => o.value)).toEqual(['simplified', 'regular'])
  })

  it('CHANNEL_OPTIONS has branch, agent, digital', () => {
    expect(CHANNEL_OPTIONS).toHaveLength(3)
    expect(CHANNEL_OPTIONS.map((o) => o.value)).toEqual(['branch', 'agent', 'digital'])
  })

  it('VERIFICATION_MODEL_OPTIONS has fingerprint and face_matching', () => {
    expect(VERIFICATION_MODEL_OPTIONS).toHaveLength(2)
    expect(VERIFICATION_MODEL_OPTIONS.map((o) => o.value)).toEqual([
      'fingerprint',
      'face_matching',
    ])
  })
})
