import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { resetFilters, setFilter } from '../store/tasksSlice'
import { selectFilters } from '../store/selectors'
import {
  canonicalFilterQuery,
  filtersFromQuery,
  filtersToQuery,
  mergeFilterQuery,
} from '../utils/queryParams'

export function useFiltersQueryParams(): void {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectFilters)
  const [searchParams, setSearchParams] = useSearchParams()

  const searchString = searchParams.toString()
  const lastSyncedUrl = useRef(searchString)

  useEffect(() => {
    if (searchString !== lastSyncedUrl.current) {
      lastSyncedUrl.current = searchString
      if (canonicalFilterQuery(searchString) === filtersToQuery(filters)) {
        return
      }
      const patch = filtersFromQuery(searchString)
      dispatch(Object.keys(patch).length > 0 ? setFilter(patch) : resetFilters())
      return
    }

    const next = mergeFilterQuery(new URLSearchParams(searchString), filters)
    if (next !== searchString) {
      lastSyncedUrl.current = next
      setSearchParams(next, { replace: true })
    }
  }, [dispatch, filters, searchString, setSearchParams])
}
