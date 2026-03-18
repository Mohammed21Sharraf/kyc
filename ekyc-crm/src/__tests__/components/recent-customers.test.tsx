import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecentCustomers } from '@/components/dashboard/recent-customers'

describe('RecentCustomers', () => {
  const mockCustomers = [
    {
      id: 'c1',
      reference_id: 'EKYC-2026-000001',
      name_en: 'Mohammad Rafiqul Islam',
      kyc_tier: 'regular',
      onboarding_status: 'completed',
      risk_level: 'regular',
      created_at: '2026-03-15T10:30:00Z',
    },
    {
      id: 'c2',
      reference_id: 'EKYC-2026-000002',
      name_en: 'Fatema Khatun',
      kyc_tier: 'simplified',
      onboarding_status: 'screening_review',
      risk_level: 'high',
      created_at: '2026-03-14T09:15:00Z',
    },
    {
      id: 'c3',
      reference_id: 'EKYC-2026-000003',
      name_en: 'Abdul Karim',
      kyc_tier: 'regular',
      onboarding_status: 'failed',
      risk_level: null,
      created_at: '2026-03-13T16:45:00Z',
    },
  ]

  it('renders the table headers', () => {
    render(<RecentCustomers customers={mockCustomers} />)
    expect(screen.getByText('Reference ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Tier')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Risk Level')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
  })

  it('renders customer names', () => {
    render(<RecentCustomers customers={mockCustomers} />)
    expect(screen.getByText('Mohammad Rafiqul Islam')).toBeInTheDocument()
    expect(screen.getByText('Fatema Khatun')).toBeInTheDocument()
    expect(screen.getByText('Abdul Karim')).toBeInTheDocument()
  })

  it('renders reference IDs as links', () => {
    render(<RecentCustomers customers={mockCustomers} />)
    const link = screen.getByText('EKYC-2026-000001')
    expect(link.closest('a')).toHaveAttribute('href', '/customers/c1')
  })

  it('shows N/A for null risk level', () => {
    render(<RecentCustomers customers={mockCustomers} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('renders formatted status labels', () => {
    render(<RecentCustomers customers={mockCustomers} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Screening Review')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('renders empty table when no customers', () => {
    render(<RecentCustomers customers={[]} />)
    expect(screen.getByText('Recent Customers')).toBeInTheDocument()
    // Table headers should still be present
    expect(screen.getByText('Reference ID')).toBeInTheDocument()
  })
})
