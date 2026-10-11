import type { TaskPriority, TaskStatus } from '../types'

export type TagPreset = 'default' | 'processing' | 'success' | 'warning' | 'error'

export interface TaskMeta {
  label: string
  color: string
  tagColor: TagPreset
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
