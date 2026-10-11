import { configureStore } from '@reduxjs/toolkit'
import tasksReducer from '@/features/tasks/store/tasksSlice'
import { createPreloadedTasksState } from '@/features/tasks/store/preloadedState'

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
  preloadedState: {
    tasks: createPreloadedTasksState(
      typeof window === 'undefined' ? '' : window.location.search,
    ),
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
