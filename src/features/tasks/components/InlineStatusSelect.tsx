import { useState } from 'react'
import { Select, Tooltip } from 'antd'
import { TASK_STATUSES, type TaskStatus } from '../types'
import { STATUS_META } from '../utils/taskMeta'
import { TaskStatusTag } from './tags'

export interface InlineStatusSelectProps {
  status: TaskStatus
  taskTitle: string
  onChange: (status: TaskStatus) => void
}

export function InlineStatusSelect({
  status,
  taskTitle,
  onChange,
}: InlineStatusSelectProps) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return (
      <Tooltip title="Change status">
        <button
          type="button"
          aria-label={`Change status of ${taskTitle}`}
          onClick={() => setEditing(true)}
          className="cursor-pointer rounded-full outline-none transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 p-0 border-0"
        >
          <TaskStatusTag status={status} />
        </button>
      </Tooltip>
    )
  }

  return (
    <Select<TaskStatus>
      autoFocus
      open
      size="small"
      variant="borderless"
      value={status}
      onChange={(next) => {
        onChange(next)
        setEditing(false)
      }}
      onBlur={() => setEditing(false)}
      options={TASK_STATUSES.map((value) => ({
        value,
        label: STATUS_META[value].label,
      }))}
      className="!w-auto !min-w-[120px] !shadow-none"
      popupMatchSelectWidth={false}
    />
  )
}
