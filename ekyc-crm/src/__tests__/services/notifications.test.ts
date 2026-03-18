import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sendSMS,
  sendEmail,
  sendAccountOpeningNotification,
  sendKYCStatusUpdateNotification,
  sendPeriodicReviewReminder,
  sendRiskAlertNotification,
} from '@/lib/services/notifications'

describe('sendSMS', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('succeeds for valid Bangladeshi mobile number', async () => {
    const result = await sendSMS({
      to: '01712345678',
      message: 'Test message',
    })

    expect(result.success).toBe(true)
    expect(result.channel).toBe('sms')
    expect(result.message_id).toMatch(/^SIM-SMS-/)
    expect(result.error).toBeNull()
  })

  it('fails for invalid mobile number format', async () => {
    const result = await sendSMS({
      to: '1234567890',
      message: 'Test message',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid Bangladeshi mobile')
  })

  it('fails for mobile numbers not starting with 01', async () => {
    const result = await sendSMS({
      to: '02712345678',
      message: 'Test',
    })

    expect(result.success).toBe(false)
  })

  it('fails for mobile numbers with wrong length', async () => {
    const result = await sendSMS({
      to: '0171234567', // 10 digits instead of 11
      message: 'Test',
    })

    expect(result.success).toBe(false)
  })

  it('accepts numbers starting with valid prefixes (013-019)', async () => {
    const prefixes = ['013', '014', '015', '016', '017', '018', '019']
    for (const prefix of prefixes) {
      const result = await sendSMS({
        to: `${prefix}12345678`,
        message: 'Test',
      })
      expect(result.success).toBe(true)
    }
  })

  it('includes sent_at timestamp', async () => {
    const result = await sendSMS({
      to: '01712345678',
      message: 'Test',
    })

    expect(result.sent_at).toBeTruthy()
    expect(new Date(result.sent_at).getTime()).not.toBeNaN()
  })
})

describe('sendEmail', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('succeeds for valid email address', async () => {
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test Subject',
      body: 'Test body',
    })

    expect(result.success).toBe(true)
    expect(result.channel).toBe('email')
    expect(result.message_id).toMatch(/^SIM-EMAIL-/)
    expect(result.error).toBeNull()
  })

  it('fails for empty email', async () => {
    const result = await sendEmail({
      to: '',
      subject: 'Test',
      body: 'Test',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid email')
  })

  it('fails for email without @', async () => {
    const result = await sendEmail({
      to: 'notanemail',
      subject: 'Test',
      body: 'Test',
    })

    expect(result.success).toBe(false)
  })

  it('supports optional html body', async () => {
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      body: 'Plain text',
      html: '<h1>HTML</h1>',
    })

    expect(result.success).toBe(true)
  })
})

describe('sendAccountOpeningNotification', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('sends SMS for customer without email', async () => {
    const results = await sendAccountOpeningNotification({
      customer_name: 'Test User',
      reference_id: 'EKYC-2026-000001',
      mobile_number: '01712345678',
    })

    expect(results).toHaveLength(1)
    expect(results[0].channel).toBe('sms')
    expect(results[0].success).toBe(true)
  })

  it('sends both SMS and email when email is provided', async () => {
    const results = await sendAccountOpeningNotification({
      customer_name: 'Test User',
      reference_id: 'EKYC-2026-000001',
      mobile_number: '01712345678',
      email: 'user@example.com',
    })

    expect(results).toHaveLength(2)
    expect(results.map((r) => r.channel)).toEqual(['sms', 'email'])
    expect(results.every((r) => r.success)).toBe(true)
  })

  it('includes reference_id in SMS message', async () => {
    const consoleSpy = vi.spyOn(console, 'log')

    await sendAccountOpeningNotification({
      customer_name: 'Test User',
      reference_id: 'EKYC-2026-000001',
      mobile_number: '01712345678',
    })

    const smsLog = consoleSpy.mock.calls.find((c) =>
      String(c[0]).includes('[SMS Simulated]')
    )
    expect(smsLog).toBeTruthy()
    expect(String(smsLog![0])).toContain('EKYC-2026-000001')
  })
})

describe('sendKYCStatusUpdateNotification', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('sends SMS with status update', async () => {
    const result = await sendKYCStatusUpdateNotification(
      {
        customer_name: 'Test User',
        reference_id: 'EKYC-2026-000001',
        mobile_number: '01712345678',
      },
      'completed'
    )

    expect(result.success).toBe(true)
    expect(result.channel).toBe('sms')
  })
})

describe('sendPeriodicReviewReminder', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('sends SMS with due date', async () => {
    const result = await sendPeriodicReviewReminder(
      {
        customer_name: 'Test User',
        reference_id: 'EKYC-2026-000001',
        mobile_number: '01712345678',
      },
      '2026-06-15'
    )

    expect(result.success).toBe(true)
  })
})

describe('sendRiskAlertNotification', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('sends both SMS and email for risk alert when email provided', async () => {
    const results = await sendRiskAlertNotification(
      {
        customer_name: 'Test User',
        reference_id: 'EKYC-2026-000001',
        mobile_number: '01712345678',
        email: 'user@example.com',
      },
      'high'
    )

    expect(results).toHaveLength(2)
    expect(results.every((r) => r.success)).toBe(true)
  })

  it('sends only SMS when no email', async () => {
    const results = await sendRiskAlertNotification(
      {
        customer_name: 'Test User',
        reference_id: 'EKYC-2026-000001',
        mobile_number: '01712345678',
      },
      'high'
    )

    expect(results).toHaveLength(1)
    expect(results[0].channel).toBe('sms')
  })
})
