import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { BreakdownRow } from '../types'
import { BreakdownCard } from './BreakdownCard'

const ROWS: BreakdownRow[] = [
  { key: 'todo', label: 'Todo', color: '#94a3b8', count: 3, percent: 38 },
  { key: 'in_progress', label: 'In Progress', color: '#3b82f6', count: 3, percent: 38 },
  { key: 'done', label: 'Done', color: '#22c55e', count: 2, percent: 25 },
]

describe('BreakdownCard', () => {
  it('renders the title', () => {
    render(<BreakdownCard title="Status breakdown" rows={ROWS} total={8} />)
    expect(screen.getByText('Status breakdown')).toBeInTheDocument()
  })

  it('renders every row with its label, count and percentage', () => {
    render(<BreakdownCard title="Status breakdown" rows={ROWS} total={8} />)

    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()

    expect(screen.getAllByText('38%')).toHaveLength(2)
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('renders one progress bar and one stacked segment per row', () => {
    const { container } = render(
      <BreakdownCard title="Status breakdown" rows={ROWS} total={8} />,
    )

    expect(container.querySelectorAll('.ant-progress')).toHaveLength(3)

    const segments = container.querySelectorAll(
      '[title$="%"]',
    )
    expect(segments).toHaveLength(3)
  })

  it('sizes each stacked segment by its percentage', () => {
    const { container } = render(
      <BreakdownCard title="Status breakdown" rows={ROWS} total={8} />,
    )

    const widths = Array.from(
      container.querySelectorAll<HTMLElement>('[title$="%"]'),
    ).map((node) => node.style.width)

    expect(widths).toEqual(['38%', '38%', '25%'])
  })

  it('renders the empty state when there is nothing to show', () => {
    render(
      <BreakdownCard
        title="Status breakdown"
        rows={ROWS.map((row) => ({ ...row, count: 0, percent: 0 }))}
        total={0}
        emptyDescription="No tasks yet"
      />,
    )

    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(screen.queryByText('25%')).not.toBeInTheDocument()
  })
})