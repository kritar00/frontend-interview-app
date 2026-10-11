import { describe, expect, it } from 'vitest'
import type { RootState } from '@/app/store'
import type { Task } from '../types'
import { createInitialFilters, type DateRange, type TaskFilters, type TasksState } from './tasksSlice'
import {
  selectAllTasks,
  selectFilteredTasks,
  selectHasActiveFilters,
  selectPaginatedTasks,
  selectSortedTasks,
  selectTaskStats,
} from './selectors'

let seq = 0

function makeTask(overrides: Partial<Task> = {}): Task {
  seq += 1
  return {
    id: `task-${seq}`,
    title: `Task ${seq}`,
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeState(
  items: Task[],
  overrides: Partial<TasksState> = {},
): RootState {
  return {
    tasks: {
      items,
      filters: createInitialFilters(),
      pagination: { currentPage: 1, pageSize: 10 },
      sort: { field: null, order: null },
      ...overrides,
    },
  }
}

describe('selectAllTasks', () => {
  it('returns every task', () => {
    const items = [makeTask(), makeTask(), makeTask()]
    expect(selectAllTasks(makeState(items))).toHaveLength(3)
  })

  it('returns an empty array for an empty list', () => {
    expect(selectAllTasks(makeState([]))).toEqual([])
  })
})

describe('selectTaskStats', () => {
  it('counts total, todo, inProgress and done', () => {
    const items = [
      makeTask({ status: 'todo' }),
      makeTask({ status: 'todo' }),
      makeTask({ status: 'in_progress' }),
      makeTask({ status: 'done' }),
      makeTask({ status: 'done' }),
      makeTask({ status: 'done' }),
    ]

    expect(selectTaskStats(makeState(items))).toEqual({
      total: 6,
      todo: 2,
      inProgress: 1,
      done: 3,
    })
  })

  it('returns zeroes for an empty list', () => {
    expect(selectTaskStats(makeState([]))).toEqual({
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
    })
  })

  it('memoizes between calls with the same input', () => {
    const state = makeState([makeTask()])
    expect(selectTaskStats(state)).toBe(selectTaskStats(state))
  })
})

describe('selectFilteredTasks', () => {
  const items = [
    makeTask({ title: 'Write spec', status: 'todo', priority: 'high' }),
    makeTask({
      title: 'Build UI',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2026-10-15',
    }),
    makeTask({
      title: 'Ship release',
      status: 'done',
      priority: 'low',
      dueDate: '2026-10-25',
    }),
  ]

  it('returns everything when no filter is active', () => {
    expect(selectFilteredTasks(makeState(items))).toHaveLength(3)
  })

  it('matches the search text against the title, case-insensitively', () => {
    const state = makeState(items, {
      filters: { ...createInitialFilters(), searchText: 'BUILD' },
    })
    expect(selectFilteredTasks(state).map((t) => t.title)).toEqual(['Build UI'])
  })

  it('does not match the search text against other fields', () => {
    const withDescription = [
      makeTask({ title: 'Refactor', description: 'needle in a haystack' }),
    ]
    const state = makeState(withDescription, {
      filters: { ...createInitialFilters(), searchText: 'needle' },
    })
    expect(selectFilteredTasks(state)).toHaveLength(0)
  })

  it('treats an empty status selection as "no filter"', () => {
    const state = makeState(items, {
      filters: { ...createInitialFilters(), status: [] },
    })
    expect(selectFilteredTasks(state)).toHaveLength(3)
  })

  it('matches any of the selected statuses', () => {
    const state = makeState(items, {
      filters: { ...createInitialFilters(), status: ['done', 'in_progress'] },
    })
    expect(selectFilteredTasks(state).map((t) => t.title)).toEqual([
      'Build UI',
      'Ship release',
    ])
  })

  it('filters by a single priority', () => {
    const state = makeState(items, {
      filters: { ...createInitialFilters(), priority: ['low'] },
    })
    expect(selectFilteredTasks(state).map((t) => t.title)).toEqual([
      'Ship release',
    ])
  })

  it('keeps tasks inside an inclusive due-date range', () => {
    const state = makeState(items, {
      filters: {
        ...createInitialFilters(),
        dateRange: ['2026-10-15', '2026-10-20'],
      },
    })
    expect(selectFilteredTasks(state).map((t) => t.title)).toEqual(['Build UI'])
  })

  it('excludes tasks without a due date while a date filter is active', () => {
    const state = makeState(items, {
      filters: {
        ...createInitialFilters(),
        dateRange: ['2026-10-01', '2026-10-31'],
      },
    })
    expect(selectFilteredTasks(state).map((t) => t.title)).toEqual([
      'Build UI',
      'Ship release',
    ])
  })

  it('combines every filter (AND)', () => {
    const state = makeState(items, {
      filters: {
        searchText: 'ship',
        status: ['done'],
        priority: ['low'],
        dateRange: ['2026-10-20', '2026-10-30'],
      },
    })
    expect(selectFilteredTasks(state)).toHaveLength(1)
  })
})

describe('selectPaginatedTasks', () => {
  const items = Array.from({ length: 25 }, (_, i) =>
    makeTask({ title: `Task ${i + 1}` }),
  )

  it('returns the first page by default', () => {
    const result = selectPaginatedTasks(
      makeState(items, { pagination: { currentPage: 1, pageSize: 10 } }),
    )
    expect(result).toHaveLength(10)
    expect(result[0]?.title).toBe('Task 1')
  })

  it('slices the correct window for a later page', () => {
    const result = selectPaginatedTasks(
      makeState(items, { pagination: { currentPage: 3, pageSize: 10 } }),
    )
    expect(result).toHaveLength(5)
    expect(result[0]?.title).toBe('Task 21')
  })

  it('returns an empty array when the page is past the end', () => {
    const result = selectPaginatedTasks(
      makeState(items, { pagination: { currentPage: 9, pageSize: 10 } }),
    )
    expect(result).toEqual([])
  })

  it('sorts the whole result set before slicing the page', () => {
    const mixed = [
      makeTask({ title: 'Charlie' }),
      makeTask({ title: 'Alpha' }),
      makeTask({ title: 'Bravo' }),
    ]
    const result = selectPaginatedTasks(
      makeState(mixed, {
        sort: { field: 'title', order: 'ascend' },
        pagination: { currentPage: 1, pageSize: 2 },
      }),
    )
    expect(result.map((t) => t.title)).toEqual(['Alpha', 'Bravo'])
  })

  it('sorts descending when asked', () => {
    const itemsForSort = [
      makeTask({ title: 'A', status: 'todo' }),
      makeTask({ title: 'C', status: 'done' }),
      makeTask({ title: 'B', status: 'in_progress' }),
    ]
    const result = selectSortedTasks(
      makeState(itemsForSort, { sort: { field: 'title', order: 'descend' } }),
    )
    expect(result.map((t) => t.title)).toEqual(['C', 'B', 'A'])
  })

  it('orders priority logically (low → high ascending)', () => {
    const itemsForSort = [
      makeTask({ title: 'A', priority: 'high' }),
      makeTask({ title: 'B', priority: 'low' }),
      makeTask({ title: 'C', priority: 'medium' }),
    ]
    const result = selectSortedTasks(
      makeState(itemsForSort, {
        sort: { field: 'priority', order: 'ascend' },
      }),
    )
    expect(result.map((t) => t.priority)).toEqual(['low', 'medium', 'high'])
  })

  it('keeps the original order when no sort is set', () => {
    const original = [makeTask({ title: 'Z' }), makeTask({ title: 'A' })]
    const result = selectSortedTasks(makeState(original))
    expect(result.map((t) => t.title)).toEqual(['Z', 'A'])
  })
})

describe('selectHasActiveFilters', () => {
  it('is false for the initial filters', () => {
    expect(selectHasActiveFilters(makeState([]))).toBe(false)
  })

  it('ignores a whitespace-only search', () => {
    const state = makeState([], {
      filters: { ...createInitialFilters(), searchText: '   ' },
    })
    expect(selectHasActiveFilters(state)).toBe(false)
  })

  it.each<[string, Partial<TaskFilters>]>([
    ['searchText', { searchText: 'abc' }],
    ['status', { status: ['done'] }],
    ['priority', { priority: ['high'] }],
    [
      'dateRange',
      { dateRange: ['2026-10-01', '2026-10-02'] satisfies DateRange },
    ],
  ])('is true when %s is set', (_label, patch) => {
    const state = makeState([], {
      filters: { ...createInitialFilters(), ...patch },
    })
    expect(selectHasActiveFilters(state)).toBe(true)
  })
})