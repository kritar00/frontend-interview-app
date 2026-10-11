import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import type {
  NewTask,
  Task,
  TaskPriority,
  TaskStatus,
  TaskUpdate,
} from '../types'
import { seedTasks } from './seedTasks'

export type DateRange = [string, string]

export interface TaskFilters {
  searchText: string
  status: TaskStatus[]
  priority: TaskPriority[]
  dateRange: DateRange | null
}

export interface TaskPagination {
  currentPage: number
  pageSize: number
}

export type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'dueDate'
export type SortOrder = 'ascend' | 'descend'

export interface TaskSort {
  field: SortField | null
  order: SortOrder | null
}

export interface TasksState {
  items: Task[]
  filters: TaskFilters
  pagination: TaskPagination
  sort: TaskSort
}

export const DEFAULT_PAGE_SIZE = 10

export const PAGE_SIZE_OPTIONS = [5, 10, 15] as const

export function createInitialFilters(): TaskFilters {
  return { searchText: '', status: [], priority: [], dateRange: null }
}

export const initialState: TasksState = {
  items: seedTasks,
  filters: createInitialFilters(),
  pagination: { currentPage: 1, pageSize: DEFAULT_PAGE_SIZE },
  sort: { field: null, order: null },
}

interface TaskUpdatePayload {
  id: string
  changes: TaskUpdate
}

interface TaskStatusUpdatePayload {
  id: string
  status: TaskStatus
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: {
      reducer(state, action: PayloadAction<Task>) {
        state.items.unshift(action.payload)
      },
      prepare(input: NewTask) {
        return {
          payload: {
            ...input,
            id: nanoid(),
            createdAt: new Date().toISOString(),
          } satisfies Task,
        }
      },
    },

    updateTask(state, action: PayloadAction<TaskUpdatePayload>) {
      const task = state.items.find((item) => item.id === action.payload.id)
      if (task) {
        Object.assign(task, action.payload.changes)
      }
    },

    deleteTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    deleteManyTasks(state, action: PayloadAction<string[]>) {
      const ids = new Set(action.payload)
      state.items = state.items.filter((item) => !ids.has(item.id))
    },

    updateTaskStatus(state, action: PayloadAction<TaskStatusUpdatePayload>) {
      const task = state.items.find((item) => item.id === action.payload.id)
      if (task) {
        task.status = action.payload.status
      }
    },

    setFilter(state, action: PayloadAction<Partial<TaskFilters>>) {
      Object.assign(state.filters, action.payload)
      state.pagination.currentPage = 1
    },

    resetFilters(state) {
      state.filters = createInitialFilters()
      state.pagination.currentPage = 1
    },

    setPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = Math.max(1, action.payload)
    },

    setPageSize(state, action: PayloadAction<number>) {
      state.pagination.pageSize = Math.max(1, action.payload)
      state.pagination.currentPage = 1
    },

    setSort(state, action: PayloadAction<TaskSort>) {
      state.sort = action.payload
      state.pagination.currentPage = 1
    },
  },
})

export const {
  addTask,
  updateTask,
  deleteTask,
  deleteManyTasks,
  updateTaskStatus,
  setFilter,
  resetFilters,
  setPage,
  setPageSize,
  setSort,
} = tasksSlice.actions

export default tasksSlice.reducer
