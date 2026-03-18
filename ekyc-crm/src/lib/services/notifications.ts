/**
 * Notification Service
 *
 * SMS and Email notifications for e-KYC events:
 * - Account opening confirmation
 * - KYC status updates
 * - Periodic review reminders
 * - Risk alert notifications
 *
 * SMS: Configurable gateway (default: simulated)
 * Email: Configurable SMTP/API (default: simulated)
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationChannel = 'sms' | 'email'

export interface SMSRequest {
  to: string // Bangladeshi mobile: 01XXXXXXXXX
  message: string
}

export interface EmailRequest {
  to: string
  subject: string
  body: string
  html?: string
}

export interface NotificationResult {
  success: boolean
  channel: NotificationChannel
  message_id: string | null
  error: string | null
  sent_at: string
}

// ─── SMS Gateway ─────────────────────────────────────────────────────────────

const SMS_API_URL = process.env.NEXT_PUBLIC_SMS_API_URL || ''
const SMS_API_KEY = process.env.SMS_API_KEY || ''

export async function sendSMS(request: SMSRequest): Promise<NotificationResult> {
  // Validate Bangladeshi mobile format
  if (!/^01[3-9]\d{8}$/.test(request.to)) {
    return {
      success: false,
      channel: 'sms',
      message_id: null,
      error: 'Invalid Bangladeshi mobile number format. Expected: 01XXXXXXXXX',
      sent_at: new Date().toISOString(),
    }
  }

  if (!SMS_API_URL) {
    return simulateSMS(request)
  }

  try {
    const response = await fetch(`${SMS_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SMS_API_KEY}`,
      },
      body: JSON.stringify({
        to: `+88${request.to}`, // Bangladesh country code
        message: request.message,
      }),
    })

    if (!response.ok) {
      throw new Error(`SMS API returned ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      channel: 'sms',
      message_id: data.message_id || `MSG-${Date.now()}`,
      error: null,
      sent_at: new Date().toISOString(),
    }
  } catch (err) {
    return {
      success: false,
      channel: 'sms',
      message_id: null,
      error: err instanceof Error ? err.message : 'SMS delivery failed',
      sent_at: new Date().toISOString(),
    }
  }
}

function simulateSMS(request: SMSRequest): NotificationResult {
  console.log(`[SMS Simulated] To: ${request.to} | Message: ${request.message}`)
  return {
    success: true,
    channel: 'sms',
    message_id: `SIM-SMS-${Date.now()}`,
    error: null,
    sent_at: new Date().toISOString(),
  }
}

// ─── Email Service ───────────────────────────────────────────────────────────

const EMAIL_API_URL = process.env.NEXT_PUBLIC_EMAIL_API_URL || ''
const EMAIL_API_KEY = process.env.EMAIL_API_KEY || ''
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@ekyc.bb.gov.bd'

export async function sendEmail(request: EmailRequest): Promise<NotificationResult> {
  if (!request.to || !request.to.includes('@')) {
    return {
      success: false,
      channel: 'email',
      message_id: null,
      error: 'Invalid email address',
      sent_at: new Date().toISOString(),
    }
  }

  if (!EMAIL_API_URL) {
    return simulateEmail(request)
  }

  try {
    const response = await fetch(`${EMAIL_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: request.to,
        subject: request.subject,
        text: request.body,
        html: request.html,
      }),
    })

    if (!response.ok) {
      throw new Error(`Email API returned ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      channel: 'email',
      message_id: data.message_id || `EMAIL-${Date.now()}`,
      error: null,
      sent_at: new Date().toISOString(),
    }
  } catch (err) {
    return {
      success: false,
      channel: 'email',
      message_id: null,
      error: err instanceof Error ? err.message : 'Email delivery failed',
      sent_at: new Date().toISOString(),
    }
  }
}

function simulateEmail(request: EmailRequest): NotificationResult {
  console.log(`[Email Simulated] To: ${request.to} | Subject: ${request.subject}`)
  return {
    success: true,
    channel: 'email',
    message_id: `SIM-EMAIL-${Date.now()}`,
    error: null,
    sent_at: new Date().toISOString(),
  }
}

// ─── Notification Templates ──────────────────────────────────────────────────

export interface CustomerNotificationData {
  customer_name: string
  reference_id: string
  mobile_number: string
  email?: string | null
}

export function sendAccountOpeningNotification(
  customer: CustomerNotificationData
): Promise<NotificationResult[]> {
  const promises: Promise<NotificationResult>[] = []

  // SMS notification
  promises.push(
    sendSMS({
      to: customer.mobile_number,
      message: `Dear ${customer.customer_name}, your e-KYC account (Ref: ${customer.reference_id}) has been successfully opened. Thank you for banking with us. - Bangladesh Bank e-KYC`,
    })
  )

  // Email notification (if email provided)
  if (customer.email) {
    promises.push(
      sendEmail({
        to: customer.email,
        subject: `e-KYC Account Opening Confirmation - ${customer.reference_id}`,
        body: `Dear ${customer.customer_name},\n\nYour e-KYC onboarding has been completed successfully.\n\nReference ID: ${customer.reference_id}\n\nThank you for choosing our services.\n\nRegards,\ne-KYC System\nBangladesh Bank`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a56db;">e-KYC Account Opening Confirmation</h2>
            <p>Dear <strong>${customer.customer_name}</strong>,</p>
            <p>Your e-KYC onboarding has been completed successfully.</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Reference ID:</strong> ${customer.reference_id}</p>
            </div>
            <p>Thank you for choosing our services.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #6b7280; font-size: 12px;">e-KYC System | Bangladesh Bank</p>
          </div>
        `,
      })
    )
  }

  return Promise.all(promises)
}

export function sendKYCStatusUpdateNotification(
  customer: CustomerNotificationData,
  status: string
): Promise<NotificationResult> {
  return sendSMS({
    to: customer.mobile_number,
    message: `Dear ${customer.customer_name}, your e-KYC application (Ref: ${customer.reference_id}) status has been updated to: ${status}. - Bangladesh Bank e-KYC`,
  })
}

export function sendPeriodicReviewReminder(
  customer: CustomerNotificationData,
  dueDate: string
): Promise<NotificationResult> {
  return sendSMS({
    to: customer.mobile_number,
    message: `Dear ${customer.customer_name}, your KYC periodic review (Ref: ${customer.reference_id}) is due on ${dueDate}. Please visit your nearest branch. - Bangladesh Bank e-KYC`,
  })
}

export function sendRiskAlertNotification(
  customer: CustomerNotificationData,
  riskLevel: string
): Promise<NotificationResult[]> {
  const promises: Promise<NotificationResult>[] = []

  promises.push(
    sendSMS({
      to: customer.mobile_number,
      message: `Dear ${customer.customer_name}, your account (Ref: ${customer.reference_id}) risk level has been updated to ${riskLevel}. Additional verification may be required. - Bangladesh Bank e-KYC`,
    })
  )

  if (customer.email) {
    promises.push(
      sendEmail({
        to: customer.email,
        subject: `Risk Level Update - ${customer.reference_id}`,
        body: `Dear ${customer.customer_name},\n\nYour account risk level has been updated to: ${riskLevel}.\n\nReference ID: ${customer.reference_id}\n\nAdditional verification may be required. Please contact your branch for more information.\n\nRegards,\ne-KYC System\nBangladesh Bank`,
      })
    )
  }

  return Promise.all(promises)
}
