import { describe, it, expect } from 'vitest'
import { calculateRiskLevel } from '@/hooks/use-risk-grading'

describe('calculateRiskLevel', () => {
  it('returns "regular" for score 0', () => {
    expect(calculateRiskLevel(0)).toBe('regular')
  })

  it('returns "regular" for score 14 (boundary)', () => {
    expect(calculateRiskLevel(14)).toBe('regular')
  })

  it('returns "high" for score 15 (threshold)', () => {
    expect(calculateRiskLevel(15)).toBe('high')
  })

  it('returns "high" for maximum possible score 28', () => {
    expect(calculateRiskLevel(28)).toBe('high')
  })

  it('returns "regular" for scores 1-14', () => {
    for (let i = 1; i <= 14; i++) {
      expect(calculateRiskLevel(i)).toBe('regular')
    }
  })

  it('returns "high" for scores 15-28', () => {
    for (let i = 15; i <= 28; i++) {
      expect(calculateRiskLevel(i)).toBe('high')
    }
  })
})
