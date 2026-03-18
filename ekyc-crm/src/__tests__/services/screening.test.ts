import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runScreening, saveScreeningResults } from '@/lib/services/screening'

describe('runScreening', () => {
  it('returns clear status for normal name', async () => {
    const result = await runScreening({
      customer_name: 'Mohammad Rahman',
      nid_number: '6004589963',
    })

    expect(result.success).toBe(true)
    expect(result.overall_status).toBe('clear')
    expect(result.results).toHaveLength(4) // all 4 default types
  })

  it('runs all 4 default screening types', async () => {
    const result = await runScreening({
      customer_name: 'Normal User',
      nid_number: '6004589963',
    })

    const types = result.results.map((r) => r.screening_type)
    expect(types).toContain('unscr')
    expect(types).toContain('pep_check')
    expect(types).toContain('adverse_media')
    expect(types).toContain('beneficial_ownership')
  })

  it('flags names containing "sanction" in UNSCR check', async () => {
    const result = await runScreening({
      customer_name: 'John Sanction',
      nid_number: '6004589963',
    })

    expect(result.overall_status).toBe('flagged')

    const unscrResult = result.results.find((r) => r.screening_type === 'unscr')
    expect(unscrResult?.status).toBe('flagged')
    expect(unscrResult?.matches).toHaveLength(1)
    expect(unscrResult?.matches[0].match_score).toBeGreaterThan(0)
  })

  it('flags PEP-related names', async () => {
    const result = await runScreening({
      customer_name: 'Minister Khan',
      nid_number: '6004589963',
    })

    expect(result.overall_status).toBe('flagged')

    const pepResult = result.results.find((r) => r.screening_type === 'pep_check')
    expect(pepResult?.status).toBe('flagged')
  })

  it('flags names with MP indicator', async () => {
    const result = await runScreening({
      customer_name: 'MP Abdul Karim',
      nid_number: '6004589963',
    })

    const pepResult = result.results.find((r) => r.screening_type === 'pep_check')
    expect(pepResult?.status).toBe('flagged')
  })

  it('runs only specified screening types', async () => {
    const result = await runScreening({
      customer_name: 'Test User',
      nid_number: '6004589963',
      screening_types: ['unscr', 'pep_check'],
    })

    expect(result.results).toHaveLength(2)
    const types = result.results.map((r) => r.screening_type)
    expect(types).toContain('unscr')
    expect(types).toContain('pep_check')
    expect(types).not.toContain('adverse_media')
  })

  it('includes checked_at timestamps in results', async () => {
    const result = await runScreening({
      customer_name: 'Test User',
      nid_number: '6004589963',
    })

    for (const r of result.results) {
      expect(r.checked_at).toBeTruthy()
      expect(new Date(r.checked_at).getTime()).not.toBeNaN()
    }
  })

  it('includes source info in each result', async () => {
    const result = await runScreening({
      customer_name: 'Test User',
      nid_number: '6004589963',
    })

    for (const r of result.results) {
      expect(r.source).toBeTruthy()
      expect(typeof r.source).toBe('string')
    }
  })

  it('handles ip_check type (routed to PEP check)', async () => {
    const result = await runScreening({
      customer_name: 'Normal Person',
      nid_number: '6004589963',
      screening_types: ['ip_check'],
    })

    expect(result.results).toHaveLength(1)
    expect(result.results[0].screening_type).toBe('pep_check')
  })

  it('adverse media always returns clear for simulated data', async () => {
    const result = await runScreening({
      customer_name: 'Test User',
      nid_number: '6004589963',
      screening_types: ['adverse_media'],
    })

    expect(result.results[0].status).toBe('clear')
    expect(result.results[0].matches).toHaveLength(0)
  })

  it('beneficial ownership always returns clear for simulated data', async () => {
    const result = await runScreening({
      customer_name: 'Test User',
      nid_number: '6004589963',
      screening_types: ['beneficial_ownership'],
    })

    expect(result.results[0].status).toBe('clear')
  })
})

describe('saveScreeningResults', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is exported as a function', () => {
    expect(typeof saveScreeningResults).toBe('function')
  })
})
