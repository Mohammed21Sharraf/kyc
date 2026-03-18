'use client'

import { useMutation } from '@tanstack/react-query'
import {
  sendAccountOpeningNotification,
  sendKYCStatusUpdateNotification,
  sendPeriodicReviewReminder,
  sendRiskAlertNotification,
} from '@/lib/services/notifications'
import type { CustomerNotificationData } from '@/lib/services/notifications'

export function useAccountOpeningNotification() {
  return useMutation({
    mutationFn: async (customer: CustomerNotificationData) => {
      return sendAccountOpeningNotification(customer)
    },
  })
}

export function useKYCStatusNotification() {
  return useMutation({
    mutationFn: async ({
      customer,
      status,
    }: {
      customer: CustomerNotificationData
      status: string
    }) => {
      return sendKYCStatusUpdateNotification(customer, status)
    },
  })
}

export function usePeriodicReviewReminder() {
  return useMutation({
    mutationFn: async ({
      customer,
      dueDate,
    }: {
      customer: CustomerNotificationData
      dueDate: string
    }) => {
      return sendPeriodicReviewReminder(customer, dueDate)
    },
  })
}

export function useRiskAlertNotification() {
  return useMutation({
    mutationFn: async ({
      customer,
      riskLevel,
    }: {
      customer: CustomerNotificationData
      riskLevel: string
    }) => {
      return sendRiskAlertNotification(customer, riskLevel)
    },
  })
}
