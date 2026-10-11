import type { Task } from '../types'

export function isOverdue(task: Pick<Task, 'dueDate' | 'status'>): boolean {
  if (!task.dueDate || task.status === 'done') {
    return false
  }
  return new Date(task.dueDate).getTime() < Date.now()
}

export function sortByCreatedDesc<T extends Pick<Task, 'createdAt'>>(
  tasks: T[],
): T[] {
  return [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
