import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '../types'
import { TaskTable } from './TaskTable'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: Math.random().toString(36).slice(2),
    title: 'Task',
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('TaskTable controlled mode', () => {
  it('changes the page without touching the sort', () => {
    const onSortChange = vi.fn()
    const onPageChange = vi.fn()

    render(
      <TaskTable
        tasks={[makeTask({ title: 'A' }), makeTask({ title: 'B' })]}
        onSortChange={onSortChange}
        sortField={null}
        sortOrder={null}
        pagination={{
          current: 1,
          pageSize: 2,
          total: 6,
          onChange: onPageChange,
        }}
      />,
    )

    fireEvent.click(screen.getByTitle('2'))

    expect(onPageChange).toHaveBeenCalledWith(2, 2)
    expect(onSortChange).not.toHaveBeenCalled()
  })

  it('reports a sort change when a sortable header is clicked', () => {
    const onSortChange = vi.fn()

    render(
      <TaskTable
        tasks={[makeTask({ title: 'A' }), makeTask({ title: 'B' })]}
        onSortChange={onSortChange}
        sortField={null}
        sortOrder={null}
      />,
    )

    fireEvent.click(screen.getByRole('columnheader', { name: /title/i }))

    expect(onSortChange).toHaveBeenCalledWith({
      field: 'title',
      order: 'ascend',
    })
  })
})
