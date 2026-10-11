import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from '../types'
import { createInitialFilters, type TaskFilters } from '../store/tasksSlice'

export const FILTER_PARAM = {
  search: 'q',
  status: 'status',
  priority: 'priority',
  from: 'from',
  to: 'to',
} as const

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value)
}

function isTaskPriority(value: string): value is TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value)
}

function splitList(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : []
}

export function filtersToQuery(filters: TaskFilters): string {
  const params = new URLSearchParams()

  const search = filters.searchText.trim()
  if (search) {
    params.set(FILTER_PARAM.search, search)
  }
  if (filters.status.length > 0) {
    params.set(FILTER_PARAM.status, filters.status.join(','))
  }
  if (filters.priority.length > 0) {
    params.set(FILTER_PARAM.priority, filters.priority.join(','))
  }
  if (filters.dateRange) {
    params.set(FILTER_PARAM.from, filters.dateRange[0])
    params.set(FILTER_PARAM.to, filters.dateRange[1])
  }

  return params.toString()
}

export function filtersFromQuery(search: string): Partial<TaskFilters> {
  const params = new URLSearchParams(search)
  const patch: Partial<TaskFilters> = {}

  const search_ = params.get(FILTER_PARAM.search)
  if (search_) {
    patch.searchText = search_
  }

  const statuses = splitList(params.get(FILTER_PARAM.status)).filter(
    isTaskStatus,
  )
  if (statuses.length > 0) {
    patch.status = statuses
  }

  const priorities = splitList(params.get(FILTER_PARAM.priority)).filter(
    isTaskPriority,
  )
  if (priorities.length > 0) {
    patch.priority = priorities
  }

  const from = params.get(FILTER_PARAM.from)
  const to = params.get(FILTER_PARAM.to)
  if (from && to && ISO_DATE.test(from) && ISO_DATE.test(to)) {
    patch.dateRange = [from, to]
  }

  return patch
}

const FILTER_PARAM_KEYS = Object.values(FILTER_PARAM)

export function mergeFilterQuery(
  current: URLSearchParams,
  filters: TaskFilters,
): string {
  const next = new URLSearchParams(current)

  for (const key of FILTER_PARAM_KEYS) {
    next.delete(key)
  }
  for (const [key, value] of new URLSearchParams(filtersToQuery(filters))) {
    next.set(key, value)
  }

  return next.toString()
}

export function canonicalFilterQuery(search: string): string {
  return filtersToQuery({
    ...createInitialFilters(),
    ...filtersFromQuery(search),
  })
}
