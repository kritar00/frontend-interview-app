import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type BreakdownRow,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '../types'
import type {
  SortField,
  TaskFilters,
  TaskPagination,
  TaskSort,
} from './tasksSlice'
import { sortByCreatedDesc } from '../utils/task'
import { PRIORITY_META, STATUS_META, type TaskMeta } from '../utils/taskMeta'

export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  done: number
}

export const selectAllTasks = (state: RootState): Task[] => state.tasks.items

export const selectFilters = (state: RootState): TaskFilters =>
  state.tasks.filters

export const selectPagination = (state: RootState): TaskPagination =>
  state.tasks.pagination

export const selectSort = (state: RootState): TaskSort => state.tasks.sort

export const selectTaskStats = createSelector(
  [selectAllTasks],
  (tasks): TaskStats => {
    const stats: TaskStats = { total: tasks.length, todo: 0, inProgress: 0, done: 0 }
    for (const task of tasks) {
      if (task.status === 'todo') {
        stats.todo += 1
      } else if (task.status === 'in_progress') {
        stats.inProgress += 1
      } else {
        stats.done += 1
      }
    }
    return stats
  },
)

function startOfDay(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00`).getTime()
}

function endOfDay(isoDate: string): number {
  return new Date(`${isoDate}T23:59:59.999`).getTime()
}

export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectFilters],
  (tasks, { searchText, status, priority, dateRange }) => {
    const query = searchText.trim().toLowerCase()
    const statusSet = new Set<TaskStatus>(status)
    const prioritySet = new Set<TaskPriority>(priority)
    const from = dateRange ? startOfDay(dateRange[0]) : null
    const to = dateRange ? endOfDay(dateRange[1]) : null

    return tasks.filter((task) => {
      if (statusSet.size > 0 && !statusSet.has(task.status)) {
        return false
      }

      if (prioritySet.size > 0 && !prioritySet.has(task.priority)) {
        return false
      }

      if (from !== null || to !== null) {
        if (!task.dueDate) {
          return false
        }
        const due = startOfDay(task.dueDate)
        if (from !== null && due < from) {
          return false
        }
        if (to !== null && due > to) {
          return false
        }
      }

      if (query && !task.title.toLowerCase().includes(query)) {
        return false
      }

      return true
    })
  },
)

const SORTERS: Record<SortField, (a: Task, b: Task) => number> = {
  title: (a, b) => a.title.localeCompare(b.title),
  status: (a, b) =>
    TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status),
  priority: (a, b) =>
    TASK_PRIORITIES.indexOf(a.priority) - TASK_PRIORITIES.indexOf(b.priority),
  assignee: (a, b) => (a.assignee ?? '').localeCompare(b.assignee ?? ''),
  dueDate: (a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return -1
    if (!b.dueDate) return 1
    return a.dueDate.localeCompare(b.dueDate)
  },
}

export const selectSortedTasks = createSelector(
  [selectFilteredTasks, selectSort],
  (tasks, { field, order }) => {
    if (!field || !order) {
      return tasks
    }
    const sorted = [...tasks].sort(SORTERS[field])
    return order === 'descend' ? sorted.reverse() : sorted
  },
)

export const selectPaginatedTasks = createSelector(
  [selectSortedTasks, selectPagination],
  (tasks, { currentPage, pageSize }) => {
    const start = (currentPage - 1) * pageSize
    return tasks.slice(start, start + pageSize)
  },
)

export const selectTotalCount = createSelector(
  [selectAllTasks],
  (tasks) => tasks.length,
)

export const selectTotalPages = createSelector(
  [selectFilteredTasks, selectPagination],
  (tasks, { pageSize }) => Math.max(1, Math.ceil(tasks.length / pageSize)),
)

export const selectHasActiveFilters = createSelector(
  [selectFilters],
  ({ searchText, status, priority, dateRange }) =>
    searchText.trim() !== '' ||
    status.length > 0 ||
    priority.length > 0 ||
    dateRange !== null,
)

function countBy<K extends string>(
  tasks: Task[],
  keys: readonly K[],
  getKey: (task: Task) => K,
): Record<K, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<
    K,
    number
  >
  for (const task of tasks) {
    counts[getKey(task)] += 1
  }
  return counts
}

export const selectCountByStatus = createSelector(
  [selectAllTasks],
  (tasks) => countBy(tasks, TASK_STATUSES, (task) => task.status),
)

export const selectCountByPriority = createSelector(
  [selectAllTasks],
  (tasks) => countBy(tasks, TASK_PRIORITIES, (task) => task.priority),
)

function toBreakdownRow(
  key: string,
  meta: TaskMeta,
  count: number,
  total: number,
): BreakdownRow {
  return {
    key,
    label: meta.label,
    color: meta.color,
    count,
    percent: total === 0 ? 0 : Math.round((count / total) * 100),
  }
}

export const selectStatusBreakdown = createSelector(
  [selectCountByStatus, selectTotalCount],
  (counts, total): BreakdownRow[] =>
    TASK_STATUSES.map((status: TaskStatus) =>
      toBreakdownRow(status, STATUS_META[status], counts[status], total),
    ),
)

export const selectPriorityBreakdown = createSelector(
  [selectCountByPriority, selectTotalCount],
  (counts, total): BreakdownRow[] =>
    TASK_PRIORITIES.map((priority: TaskPriority) =>
      toBreakdownRow(priority, PRIORITY_META[priority], counts[priority], total),
    ),
)

export const RECENT_TASKS_LIMIT = 5

export const selectRecentTasks = createSelector([selectAllTasks], (tasks) =>
  sortByCreatedDesc(tasks).slice(0, RECENT_TASKS_LIMIT),
)
