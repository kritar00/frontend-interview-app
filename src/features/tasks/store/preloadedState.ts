import {
  createInitialFilters,
  initialState,
  type TasksState,
} from './tasksSlice'
import { filtersFromQuery } from '../utils/queryParams'

export function createPreloadedTasksState(search: string): TasksState {
  return {
    ...initialState,
    filters: {
      ...createInitialFilters(),
      ...filtersFromQuery(search),
    },
  }
}
