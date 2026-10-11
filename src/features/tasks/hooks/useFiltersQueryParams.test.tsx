import { configureStore } from '@reduxjs/toolkit'
import { act, renderHook, waitFor } from '@testing-library/react'
import React, { type ReactNode } from 'react'
import { Provider } from 'react-redux'
import {
  MemoryRouter,
  useLocation,
  useNavigate,
  type NavigateFunction,
} from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { selectFilters } from '../store/selectors'
import { createPreloadedTasksState } from '../store/preloadedState'
import tasksReducer, { resetFilters, setFilter } from '../store/tasksSlice'
import { useFiltersQueryParams } from './useFiltersQueryParams'

function makeStore(initialEntry: string) {
  const search = initialEntry.includes('?')
    ? initialEntry.slice(initialEntry.indexOf('?'))
    : ''

  return configureStore({
    reducer: { tasks: tasksReducer },
    preloadedState: { tasks: createPreloadedTasksState(search) },
  })
}

interface Harness {
  store: ReturnType<typeof makeStore>
  getSearch: () => string
  navigate: (to: string) => void
  getDispatches: () => number
  resetDispatches: () => void
}

function setup(initialEntry: string, { strict = false } = {}): Harness {
  const store = makeStore(initialEntry)
  let search = ''
  let navigate: NavigateFunction | undefined
  let dispatches = 0

  store.subscribe(() => {
    dispatches += 1
  })

  function Probe() {
    navigate = useNavigate()
    search = useLocation().search
    return null
  }

  function Wrap({ children }: { children: ReactNode }) {
    const content = (
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Probe />
          {children}
        </MemoryRouter>
      </Provider>
    )
    return strict ? <React.StrictMode>{content}</React.StrictMode> : content
  }

  renderHook(() => useFiltersQueryParams(), { wrapper: Wrap })

  return {
    store,
    getSearch: () => search,
    navigate: (to: string) => navigate?.(to),
    getDispatches: () => dispatches,
    resetDispatches: () => {
      dispatches = 0
    },
  }
}

describe('useFiltersQueryParams', () => {
  it('hydrates the store from the URL on mount', async () => {
    const harness = setup('/tasks?q=abc&status=done')

    await waitFor(() => {
      const filters = selectFilters(harness.store.getState())
      expect(filters.searchText).toBe('abc')
      expect(filters.status).toEqual(['done'])
    })

    expect(harness.getSearch()).toBe('?q=abc&status=done')
  })

  it('hydrates from the URL on mount under StrictMode', async () => {
    const harness = setup('/tasks?q=abc&status=done', { strict: true })

    await waitFor(
      () => {
        const filters = selectFilters(harness.store.getState())
        expect(filters.searchText).toBe('abc')
        expect(filters.status).toEqual(['done'])
      },
      { timeout: 2000 },
    )

    expect(harness.getSearch()).toBe('?q=abc&status=done')
  })

  it('writes filters to the URL', async () => {
    const harness = setup('/tasks')

    act(() => {
      harness.store.dispatch(setFilter({ searchText: 'abc' }))
    })

    await waitFor(() => {
      expect(harness.getSearch()).toBe('?q=abc')
    })
  })

  it('clears the URL when the filters are reset', async () => {
    const harness = setup('/tasks?status=done')

    await waitFor(() => {
      expect(selectFilters(harness.store.getState()).status).toEqual(['done'])
    })

    act(() => {
      harness.store.dispatch(resetFilters())
    })

    await waitFor(() => {
      expect(harness.getSearch()).toBe('')
    })
  })

  it('clears the store when the URL is cleared, without oscillating', async () => {
    const harness = setup('/tasks?status=done')

    await waitFor(() => {
      expect(selectFilters(harness.store.getState()).status).toEqual(['done'])
    })

    harness.resetDispatches()

    act(() => {
      harness.navigate('/tasks')
    })

    await waitFor(() => {
      expect(selectFilters(harness.store.getState()).status).toEqual([])
    })

    const settled = harness.getDispatches()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(harness.getDispatches()).toBe(settled)
    expect(harness.getSearch()).toBe('')
  })

  it('leaves an already-clean URL untouched', async () => {
    const harness = setup('/tasks')

    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(harness.getSearch()).toBe('')
    expect(selectFilters(harness.store.getState()).searchText).toBe('')
    expect(harness.getDispatches()).toBe(0)
  })

  it('preserves unrelated query params when writing filters', async () => {
    const harness = setup('/tasks?tab=board')

    act(() => {
      harness.store.dispatch(setFilter({ searchText: 'abc' }))
    })

    await waitFor(() => {
      const params = new URLSearchParams(harness.getSearch())
      expect(params.get('q')).toBe('abc')
      expect(params.get('tab')).toBe('board')
    })
  })

  it('adopts a filter value that changes in the URL', async () => {
    const harness = setup('/tasks?status=done')

    await waitFor(() => {
      expect(selectFilters(harness.store.getState()).status).toEqual(['done'])
    })

    act(() => {
      harness.navigate('/tasks?status=todo')
    })

    await waitFor(() => {
      expect(selectFilters(harness.store.getState()).status).toEqual(['todo'])
    })
  })
})
