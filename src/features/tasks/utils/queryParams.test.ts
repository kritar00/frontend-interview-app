import { describe, expect, it } from 'vitest'
import { createInitialFilters } from '../store/tasksSlice'
import type { TaskFilters } from '../store/tasksSlice'
import { filtersFromQuery, filtersToQuery, canonicalFilterQuery, mergeFilterQuery } from './queryParams'

function filters(overrides: Partial<TaskFilters> = {}): TaskFilters {
  return { ...createInitialFilters(), ...overrides }
}

describe('filtersToQuery', () => {
  it('returns an empty string when nothing is filtered', () => {
    expect(filtersToQuery(filters())).toBe('')
  })

  it('serialises the search text', () => {
    expect(filtersToQuery(filters({ searchText: 'build ui' }))).toBe(
      'q=build+ui',
    )
  })

  it('ignores a whitespace-only search', () => {
    expect(filtersToQuery(filters({ searchText: '   ' }))).toBe('')
  })

  it('serialises multiple statuses as a comma separated list', () => {
    expect(filtersToQuery(filters({ status: ['todo', 'done'] }))).toBe(
      'status=todo%2Cdone',
    )
  })

  it('serialises a date range as from/to', () => {
    expect(
      filtersToQuery(filters({ dateRange: ['2026-10-01', '2026-10-31'] })),
    ).toBe('from=2026-10-01&to=2026-10-31')
  })

  it('serialises every filter at once in a stable order', () => {
    const query = filtersToQuery(
      filters({
        searchText: 'ui',
        status: ['done'],
        priority: ['high', 'low'],
        dateRange: ['2026-10-01', '2026-10-05'],
      }),
    )

    expect(query).toBe(
      'q=ui&status=done&priority=high%2Clow&from=2026-10-01&to=2026-10-05',
    )
  })
})

describe('filtersFromQuery', () => {
  it('returns an empty patch for an empty query', () => {
    expect(filtersFromQuery('')).toEqual({})
  })

  it('parses the search text', () => {
    expect(filtersFromQuery('q=build+ui')).toEqual({ searchText: 'build ui' })
  })

  it('parses multiple statuses', () => {
    expect(filtersFromQuery('status=todo%2Cdone')).toEqual({
      status: ['todo', 'done'],
    })
  })

  it('parses a date range', () => {
    expect(filtersFromQuery('from=2026-10-01&to=2026-10-31')).toEqual({
      dateRange: ['2026-10-01', '2026-10-31'],
    })
  })

  it('drops unknown status values', () => {
    expect(filtersFromQuery('status=done%2Cbogus')).toEqual({
      status: ['done'],
    })
  })

  it('drops a malformed date range', () => {
    expect(filtersFromQuery('from=not-a-date&to=2026-10-31')).toEqual({})
  })

  it('drops a half-specified date range', () => {
    expect(filtersFromQuery('from=2026-10-01')).toEqual({})
  })
})

describe('mergeFilterQuery', () => {
  it('adds the filter params to an empty query', () => {
    const result = mergeFilterQuery(
      new URLSearchParams(),
      filters({ status: ['done'] }),
    )
    expect(result).toBe('status=done')
  })

  it('preserves unrelated params', () => {
    const result = mergeFilterQuery(
      new URLSearchParams('tab=board&page=2'),
      filters({ searchText: 'ui' }),
    )
    expect(new URLSearchParams(result).get('tab')).toBe('board')
    expect(new URLSearchParams(result).get('page')).toBe('2')
    expect(new URLSearchParams(result).get('q')).toBe('ui')
  })

  it('replaces stale filter params instead of appending', () => {
    const result = mergeFilterQuery(
      new URLSearchParams('status=done&q=old'),
      filters({ status: ['todo'] }),
    )
    expect(new URLSearchParams(result).get('status')).toBe('todo')
    expect(new URLSearchParams(result).get('q')).toBeNull()
  })

  it('removes filter params when the filters are cleared', () => {
    const result = mergeFilterQuery(
      new URLSearchParams('status=done&tab=board'),
      filters(),
    )
    expect(new URLSearchParams(result).get('status')).toBeNull()
    expect(new URLSearchParams(result).get('tab')).toBe('board')
  })
})

describe('canonicalFilterQuery', () => {
  it('is empty for a query with no filter params', () => {
    expect(canonicalFilterQuery('tab=board')).toBe('')
  })

  it('normalises param order', () => {
    expect(canonicalFilterQuery('to=2026-10-31&from=2026-10-01')).toBe(
      'from=2026-10-01&to=2026-10-31',
    )
  })

  it('drops invalid values', () => {
    expect(canonicalFilterQuery('status=done%2Cbogus')).toBe('status=done')
  })

  it('matches filtersToQuery for a well formed query', () => {
    const current = filters({ status: ['todo'], priority: ['high'] })
    expect(canonicalFilterQuery(filtersToQuery(current))).toBe(
      filtersToQuery(current),
    )
  })
})

describe('round trip', () => {
  const cases: TaskFilters[] = [
    filters({ searchText: 'ship release' }),
    filters({ status: ['in_progress'] }),
    filters({ priority: ['medium', 'high'] }),
    filters({ dateRange: ['2026-10-05', '2026-10-12'] }),
    filters({
      searchText: 'a',
      status: ['todo', 'done'],
      priority: ['low'],
      dateRange: ['2026-10-01', '2026-10-02'],
    }),
  ]

  it.each(cases.map((c, i) => [i, c] as const))(
    'preserves filters through serialise → parse (#%i)',
    (_index, original) => {
      const parsed = filtersFromQuery(filtersToQuery(original))
      expect({ ...createInitialFilters(), ...parsed }).toEqual(original)
    },
  )
})