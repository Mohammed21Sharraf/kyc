import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '@/components/customers/pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('shows page info', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />
    )
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
  })

  it('disables Previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />
    )
    const prevBtn = screen.getByText('Previous').closest('button')
    expect(prevBtn).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />
    )
    const nextBtn = screen.getByText('Next').closest('button')
    expect(nextBtn).toBeDisabled()
  })

  it('calls onPageChange with next page when Next clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onChange} />
    )
    await user.click(screen.getByText('Next'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange with previous page when Previous clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onChange} />
    )
    await user.click(screen.getByText('Previous'))
    expect(onChange).toHaveBeenCalledWith(2)
  })
})
