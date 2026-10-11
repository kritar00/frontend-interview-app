import { describe, expect, it } from 'vitest'
import tasksReducer, {
  DEFAULT_PAGE_SIZE,
  resetFilters,
  setFilter,
  setPage,
  setPageSize,
  setSort,
  type TasksState,
} from './tasksSlice'

function stateWithPage(currentPage: number, pageSize = DEFAULT_PAGE_SIZE): TasksState {
  return { ...tasksReducer(undefined, { type: 'init' }), pagination: { currentPage, pageSize } }
}

describe('tasksSlice pagination', () => {
  it('clamps setPage to at least 1', () => {
    const next = tasksReducer(stateWithPage(3), setPage(0))
    expect(next.pagination.currentPage).toBe(1)
  })

  it('stores the requested page', () => {
    const next = tasksReducer(stateWithPage(1), setPage(4))
    expect(next.pagination.currentPage).toBe(4)
  })

  it('changes the page size and returns to the first page', () => {
    const next = tasksReducer(stateWithPage(3, 10), setPageSize(5))
    expect(next.pagination).toEqual({ currentPage: 1, pageSize: 5 })
  })

  it('clamps setPageSize to at least 1', () => {
    const next = tasksReducer(stateWithPage(2), setPageSize(0))
    expect(next.pagination.pageSize).toBe(1)
    expect(next.pagination.currentPage).toBe(1)
  })
})

describe('tasksSlice filter actions reset the page', () => {
  it('setFilter returns to the first page', () => {
    const next = tasksReducer(stateWithPage(3), setFilter({ searchText: 'a' }))
    expect(next.pagination.currentPage).toBe(1)
    expect(next.filters.searchText).toBe('a')
  })

  it('resetFilters clears the filters and returns to the first page', () => {
    const dirty: TasksState = {
      ...stateWithPage(3),
      filters: { searchText: 'a', status: ['done'], priority: [], dateRange: null },
    }
    const next = tasksReducer(dirty, resetFilters())
    expect(next.pagination.currentPage).toBe(1)
    expect(next.filters).toEqual({
      searchText: '',
      status: [],
      priority: [],
      dateRange: null,
    })
  })

  it('setSort returns to the first page', () => {
    const next = tasksReducer(
      stateWithPage(2),
      setSort({ field: 'title', order: 'ascend' }),
    )
    expect(next.pagination.currentPage).toBe(1)
    expect(next.sort).toEqual({ field: 'title', order: 'ascend' })
  })
})
