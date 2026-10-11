import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatCard } from './StatCard'

function valueOf(container: HTMLElement): string {
  return container.querySelector('.ant-statistic-content-value')?.textContent ?? ''
}

describe('StatCard', () => {
  it('renders the title and the value', () => {
    const { container } = render(
      <StatCard title="Total tasks" value={42} />,
    )

    expect(screen.getByText('Total tasks')).toBeInTheDocument()
    expect(valueOf(container)).toBe('42')
  })

  it('renders the hint when provided', () => {
    render(<StatCard title="Done" value={7} hint="25% of all tasks" />)
    expect(screen.getByText('25% of all tasks')).toBeInTheDocument()
  })

  it('omits the hint when not provided', () => {
    const { container } = render(<StatCard title="Done" value={7} />)
    expect(container.querySelector('.ant-card')).not.toHaveTextContent('%')
  })

  it('renders the icon', () => {
    render(<StatCard title="Done" value={7} icon={<span data-testid="icon" />} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('applies the accent colour to the value and the icon tile', () => {
    const { container } = render(
      <StatCard title="Done" value={7} color="#22c55e" icon={<span />} />,
    )

    const value = container.querySelector<HTMLElement>(
      '.ant-statistic-content-value',
    )
    expect(value).toHaveStyle({ color: '#22c55e' })

    const tile = container.querySelector<HTMLElement>('.ant-card-body > div > span')
    expect(tile).toHaveStyle({
      color: '#22c55e',
      backgroundColor: '#22c55e1a',
    })
  })

  it('shows a skeleton instead of the value while loading', () => {
    const { container } = render(
      <StatCard title="Done" value={7} loading />,
    )

    expect(valueOf(container)).not.toBe('7')
    expect(container.querySelector('.ant-skeleton')).toBeInTheDocument()
  })

  it('merges a caller supplied className', () => {
    const { container } = render(
      <StatCard title="Done" value={7} className="my-extra" />,
    )
    expect(container.querySelector('.ant-card')).toHaveClass('my-extra')
  })
})