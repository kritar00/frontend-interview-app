import { describe, expect, it } from 'vitest'
import { seedTasks } from './seedTasks'
import { createPreloadedTasksState } from './preloadedState'
import { DEFAULT_PAGE_SIZE } from './tasksSlice'

describe('createPreloadedTasksState', () => {
  it('starts with clean filters when the URL has none', () => {
    expect(createPreloadedTasksState('').filters).toEqual({
      searchText: '',
      status: [],
      priority: [],
      dateRange: null,
    })
  })

  it('applies the filters found in the URL', () => {
    const state = createPreloadedTasksState(
      '?q=ui&status=done&priority=high&from=2026-10-01&to=2026-10-31',
    )

    expect(state.filters).toEqual({
      searchText: 'ui',
      status: ['done'],
      priority: ['high'],
      dateRange: ['2026-10-01', '2026-10-31'],
    })
  })

  it('accepts the search string with or without a leading "?"', () => {
    const withMark = createPreloadedTasksState('?q=ui')
    const withoutMark = createPreloadedTasksState('q=ui')
    expect(withMark.filters).toEqual(withoutMark.filters)
  })

  it('leaves the rest of the tasks state at its defaults', () => {
    const state = createPreloadedTasksState('?q=ui')

    expect(state.items).toBe(seedTasks)
    expect(state.pagination).toEqual({
      currentPage: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    })
    expect(state.sort).toEqual({ field: null, order: null })
  })
})
