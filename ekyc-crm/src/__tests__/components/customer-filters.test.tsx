import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomerFilters } from '@/components/customers/customer-filters'

describe('CustomerFilters', () => {
  const defaultFilters = {
    search: '',
    tier: 'all',
    status: 'all',
    riskLevel: 'all',
  }

  it('renders search input', () => {
    render(<CustomerFilters filters={defaultFilters} onChange={vi.fn()} />)
    expect(
      screen.getByPlaceholderText('Search by name, NID, mobile, or reference ID...')
    ).toBeInTheDocument()
  })

  it('calls onChange when typing in search', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CustomerFilters filters={defaultFilters} onChange={onChange} />)
    const input = screen.getByPlaceholderText(
      'Search by name, NID, mobile, or reference ID...'
    )
    await user.type(input, 'R')
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall.search).toBe('R')
  })

  it('does not show clear button when no active filters', () => {
    render(<CustomerFilters filters={defaultFilters} onChange={vi.fn()} />)
    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument()
  })

  it('shows clear button when search has value', () => {
    render(
      <CustomerFilters
        filters={{ ...defaultFilters, search: 'test' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('Clear Filters')).toBeInTheDocument()
  })

  it('shows clear button when tier filter is active', () => {
    render(
      <CustomerFilters
        filters={{ ...defaultFilters, tier: 'simplified' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('Clear Filters')).toBeInTheDocument()
  })

  it('resets all filters when clear is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <CustomerFilters
        filters={{ search: 'test', tier: 'simplified', status: 'all', riskLevel: 'all' }}
        onChange={onChange}
      />
    )
    await user.click(screen.getByText('Clear Filters'))
    expect(onChange).toHaveBeenCalledWith({
      search: '',
      tier: 'all',
      status: 'all',
      riskLevel: 'all',
    })
  })
})
