import { useMemo } from 'react'
import {
  Avatar,
  Button,
  Empty,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd'
import type {
  TableColumnsType,
  TablePaginationConfig,
  TableProps,
} from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { TASK_PRIORITIES, type Task, type TaskStatus } from '../types'
import type { SortField, SortOrder, TaskSort } from '../store/tasksSlice'
import { formatDate } from '../utils/format'
import { isOverdue } from '../utils/task'
import { colorFromString, initialsOf } from '../utils/text'
import { InlineStatusSelect } from './InlineStatusSelect'
import { TaskPriorityTag, TaskStatusTag } from './tags'

const { Text } = Typography

export interface TaskTableProps {
  tasks: Task[]
  loading?: boolean
  compact?: boolean
  showActions?: boolean
  onEdit?: (task: Task) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: TaskStatus) => void
  rowSelection?: TableProps<Task>['rowSelection']
  pagination?: TablePaginationConfig | false
  sortField?: SortField | null
  sortOrder?: SortOrder | null
  onSortChange?: (sort: TaskSort) => void
}

const priorityRank = (priority: Task['priority']): number =>
  TASK_PRIORITIES.indexOf(priority)

interface SortColumnConfig {
  sorter: ((a: Task, b: Task) => number) | true
  sortOrder?: SortOrder | null
}

export function TaskTable({
  tasks,
  loading = false,
  compact = false,
  showActions = false,
  onEdit,
  onDelete,
  onStatusChange,
  rowSelection,
  pagination = false,
  sortField = null,
  sortOrder = null,
  onSortChange,
}: TaskTableProps) {
  const isSortControlled = onSortChange !== undefined

  const sortConfig = (
    field: SortField,
    local: (a: Task, b: Task) => number,
  ): SortColumnConfig =>
    isSortControlled
      ? {
          sorter: true,
          sortOrder: sortField === field ? sortOrder : null,
        }
      : { sorter: local }

  const columns = useMemo<TableColumnsType<Task>>(() => {
    const base: TableColumnsType<Task> = [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        ...sortConfig('title', (a, b) => a.title.localeCompare(b.title)),
        render: (_value, task) => (
          <div className="flex min-w-0 flex-col">
            <Text strong ellipsis={{ tooltip: task.title }}>
              {task.title}
            </Text>
            {task.description ? (
              <Text
                type="secondary"
                ellipsis={{ tooltip: task.description }}
                className="!text-xs"
              >
                {task.description}
              </Text>
            ) : null}
          </div>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 150,
        ...sortConfig('status', (a, b) => a.status.localeCompare(b.status)),
        render: (status: Task['status'], task) =>
          onStatusChange ? (
            <InlineStatusSelect
              status={status}
              taskTitle={task.title}
              onChange={(next) => onStatusChange(task.id, next)}
            />
          ) : (
            <TaskStatusTag status={status} />
          ),
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        width: 120,
        ...sortConfig('priority', (a, b) => priorityRank(a.priority) - priorityRank(b.priority)),
        render: (priority: Task['priority']) => (
          <TaskPriorityTag priority={priority} />
        ),
      },
    ]

    if (compact) {
      base.push({
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 140,
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
        render: (createdAt: string) => (
          <Text type="secondary">{formatDate(createdAt)}</Text>
        ),
      })

      return base
    }

    base.push(
      {
        title: 'Assignee',
        key: 'assignee',
        width: 180,
        ...sortConfig(
          'assignee',
          (a, b) => (a.assignee ?? '').localeCompare(b.assignee ?? ''),
        ),
        render: (_value, task) =>
          task.assignee ? (
            <Space size={8}>
              <Avatar
                size={28}
                style={{ backgroundColor: colorFromString(task.assignee) }}
              >
                {initialsOf(task.assignee)}
              </Avatar>
              <Text ellipsis={{ tooltip: task.assignee }}>
                {task.assignee}
              </Text>
            </Space>
          ) : (
            <Text type="secondary">Unassigned</Text>
          ),
      },
      {
        title: 'Due date',
        key: 'dueDate',
        width: 160,
        ...sortConfig('dueDate', (a, b) =>
          (a.dueDate ?? '').localeCompare(b.dueDate ?? ''),
        ),
        render: (_value, task) => {
          if (!task.dueDate) {
            return <Text type="secondary">—</Text>
          }
          const overdue = isOverdue(task)
          return (
            <Text className={overdue ? '!font-medium !text-red-500' : ''}>
              {formatDate(task.dueDate)}
              {overdue ? ' · overdue' : ''}
            </Text>
          )
        },
      },
    )

    if (showActions) {
      base.push({
        title: '',
        key: 'actions',
        width: 90,
        align: 'right',
        render: (_value, task) => (
          <Space size={2}>
            {onEdit ? (
              <Tooltip title="Edit task">
                <Button
                  type="text"
                  size="small"
                  aria-label={`Edit ${task.title}`}
                  icon={<EditOutlined />}
                  onClick={() => onEdit(task)}
                />
              </Tooltip>
            ) : null}
            {onDelete ? (
              <Popconfirm
                title="Delete this task?"
                description={`"${task.title}" will be removed permanently.`}
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
                onConfirm={() => onDelete(task.id)}
              >
                <Tooltip title="Delete task">
                  <Button
                    type="text"
                    size="small"
                    danger
                    aria-label={`Delete ${task.title}`}
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            ) : null}
          </Space>
        ),
      })
    }

    return base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    compact,
    showActions,
    onEdit,
    onDelete,
    onStatusChange,
    isSortControlled,
    sortField,
    sortOrder,
  ])

  const handleTableChange: TableProps<Task>['onChange'] = (
    _pagination,
    _tableFilters,
    sorter,
    extra,
  ) => {
    if (extra.action !== 'sort') {
      return
    }

    const single = Array.isArray(sorter) ? sorter[0] : sorter
    onSortChange?.({
      field: (single?.field as SortField | undefined) ?? null,
      order: single?.order ?? null,
    })
  }

  const selectionProps = rowSelection ? { rowSelection } : {}
  const changeProps = isSortControlled ? { onChange: handleTableChange } : {}

  return (
    <Table<Task>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={tasks}
      loading={loading}
      pagination={pagination}
      {...selectionProps}
      {...changeProps}
      scroll={{ x: 900 }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No tasks found"
          />
        ),
      }}
    />
  )
}
