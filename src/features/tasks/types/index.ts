export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: string
  dueDate?: string
  createdAt: string
  tags?: string[]
}

export const TASK_STATUSES: readonly TaskStatus[] = [
  'todo',
  'in_progress',
  'done',
]

export const TASK_PRIORITIES: readonly TaskPriority[] = [
  'low',
  'medium',
  'high',
]

export type NewTask = Omit<Task, 'id' | 'createdAt'>

export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt'>>

export interface BreakdownRow {
  key: string
  label: string
  color: string
  count: number
  percent: number
}
