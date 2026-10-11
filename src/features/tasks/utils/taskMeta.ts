import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from '../types'

export type TagPreset = 'default' | 'processing' | 'success' | 'warning' | 'error'

export interface TaskMeta {
  label: string
  color: string
  tagColor: TagPreset
}

export interface TaskOption<T extends string> {
  value: T
  label: string
}

export const STATUS_META: Record<TaskStatus, TaskMeta> = {
  todo: { label: 'Todo', color: '#94a3b8', tagColor: 'default' },
  in_progress: { label: 'In Progress', color: '#3b82f6', tagColor: 'processing' },
  done: { label: 'Done', color: '#22c55e', tagColor: 'success' },
}

export const PRIORITY_META: Record<TaskPriority, TaskMeta> = {
  low: { label: 'Low', color: '#22c55e', tagColor: 'success' },
  medium: { label: 'Medium', color: '#f59e0b', tagColor: 'warning' },
  high: { label: 'High', color: '#ef4444', tagColor: 'error' },
}

export const STATUS_OPTIONS: TaskOption<TaskStatus>[] = TASK_STATUSES.map(
  (value) => ({ value, label: STATUS_META[value].label }),
)

export const PRIORITY_OPTIONS: TaskOption<TaskPriority>[] = TASK_PRIORITIES.map(
  (value) => ({ value, label: PRIORITY_META[value].label }),
)
