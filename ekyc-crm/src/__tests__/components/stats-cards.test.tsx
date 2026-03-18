import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsCards } from '@/components/dashboard/stats-cards'

describe('StatsCards', () => {
  const mockStats = {
    totalCustomers: 1247,
    monthlyOnboarded: 89,
    pendingReview: 23,
    highRisk: 15,
  }

  it('renders all four stat cards', () => {
    render(<StatsCards stats={mockStats} />)
    expect(screen.getByText('Total Customers')).toBeInTheDocument()
    expect(screen.getByText('Monthly Onboarded')).toBeInTheDocument()
    expect(screen.getByText('Pending Review')).toBeInTheDocument()
    expect(screen.getByText('High Risk')).toBeInTheDocument()
  })

  it('displays formatted numbers', () => {
    render(<StatsCards stats={mockStats} />)
    expect(screen.getByText('1,247')).toBeInTheDocument()
    expect(screen.getByText('89')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('renders zero values correctly', () => {
    const zeroStats = {
      totalCustomers: 0,
      monthlyOnboarded: 0,
      pendingReview: 0,
      highRisk: 0,
    }
    render(<StatsCards stats={zeroStats} />)
    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(4)
  })
})
