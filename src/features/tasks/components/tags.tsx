import { Tag } from 'antd'
import type { TaskPriority, TaskStatus } from '../types'
import { PRIORITY_META, STATUS_META } from '../utils/taskMeta'

const TAG_CLASS = '!m-0 !rounded-full !px-2.5 !font-medium'

export function TaskStatusTag({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status]
  return (
    <Tag color={meta.tagColor} className={TAG_CLASS}>
      {meta.label}
    </Tag>
  )
}

export function TaskPriorityTag({ priority }: { priority: TaskPriority }) {
  const meta = PRIORITY_META[priority]
  return (
    <Tag color={meta.tagColor} className={TAG_CLASS}>
      {meta.label}
    </Tag>
  )
}