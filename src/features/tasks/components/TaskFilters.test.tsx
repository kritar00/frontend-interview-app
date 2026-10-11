import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  createInitialFilters,
  type TaskFilters as TaskFiltersState,
} from '../store/tasksSlice'
import { TaskFilters } from './TaskFilters'

function filters(overrides: Partial<TaskFiltersState> = {}): TaskFiltersState {
  return { ...createInitialFilters(), ...overrides }
}

function setup(filtersArg: TaskFiltersState = createInitialFilters()) {
  const onFilterChange = vi.fn()
  const onReset = vi.fn()

  const view = render(
    <TaskFilters
      filters={filtersArg}
      resultCount={0}
      totalCount={0}
      hasActiveFilters={false}
      onFilterChange={onFilterChange}
      onReset={onReset}
    />,
  )

  return { view, onFilterChange, onReset }
}

const searchInput = () =>
  screen.getByPlaceholderText('Search tasks by title…') as HTMLInputElement

describe('TaskFilters search input', () => {
  it('starts from the search text already in the store', () => {
    setup(filters({ ...createInitialFilters(), searchText: 'ship it' }))
    expect(searchInput().value).toBe('ship it')
  })

  it('adopts a search text that arrives from the URL', () => {
    const { view } = setup()

    view.rerender(
      <TaskFilters
        filters={{ ...createInitialFilters(), searchText: 'from url' }}
        resultCount={0}
        totalCount={0}
        hasActiveFilters
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />,
    )

    expect(searchInput().value).toBe('from url')
  })

  it('clears the input when the store filters are reset', () => {
    const { view, onReset } = setup(
      filters({ ...createInitialFilters(), searchText: 'stale' }),
    )

    view.rerender(
      <TaskFilters
        filters={createInitialFilters()}
        resultCount={0}
        totalCount={0}
        hasActiveFilters={false}
        onFilterChange={vi.fn()}
        onReset={onReset}
      />,
    )

    expect(searchInput().value).toBe('')
  })
})

describe('TaskFilters search debounce', () => {
  it('does not emit a change on mount', async () => {
    const { onFilterChange } = setup(filters({ searchText: 'existing' }))

    await new Promise((resolve) => setTimeout(resolve, 350))

    expect(onFilterChange).not.toHaveBeenCalled()
  })

  it('emits the debounced search after typing', async () => {
    const { onFilterChange } = setup()

    fireEvent.change(searchInput(), { target: { value: 'api' } })

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({ searchText: 'api' })
    })
  })

  it('does not echo a search value that arrived from the store', async () => {
    const onFilterChange = vi.fn()
    const { view } = setup()

    view.rerender(
      <TaskFilters
        filters={filters({ searchText: 'from url' })}
        resultCount={0}
        totalCount={0}
        hasActiveFilters
        onFilterChange={onFilterChange}
        onReset={vi.fn()}
      />,
    )

    await new Promise((resolve) => setTimeout(resolve, 350))

    expect(onFilterChange).not.toHaveBeenCalled()
  })
})