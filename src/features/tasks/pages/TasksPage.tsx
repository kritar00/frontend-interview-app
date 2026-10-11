import { useCallback, useEffect, useState } from 'react'
import type { Key } from 'react'
import { App, Button, Card, Space, Typography } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  deleteManyTasks,
  deleteTask,
  PAGE_SIZE_OPTIONS,
  resetFilters,
  setFilter,
  setPage,
  setPageSize,
  setSort,
  updateTaskStatus,
  type TaskSort,
} from '../store/tasksSlice'
import {
  selectFilteredTasks,
  selectFilters,
  selectHasActiveFilters,
  selectPaginatedTasks,
  selectPagination,
  selectSort,
  selectTotalCount,
  selectTotalPages,
} from '../store/selectors'
import { TaskFilters } from '../components/TaskFilters'
import { TaskFormModal } from '../components/TaskFormModal'
import { TaskTable } from '../components/TaskTable'
import { useTaskFormModal } from '../hooks/useTaskFormModal'
import { useFiltersQueryParams } from '../hooks/useFiltersQueryParams'
import type { TaskStatus } from '../types'

const { Text } = Typography

export function TasksPage() {
  const dispatch = useAppDispatch()
  const { message, modal } = App.useApp()
  const form = useTaskFormModal()

  useFiltersQueryParams()

  const filters = useAppSelector(selectFilters)
  const pagination = useAppSelector(selectPagination)
  const filteredTasks = useAppSelector(selectFilteredTasks)
  const pageTasks = useAppSelector(selectPaginatedTasks)
  const totalPages = useAppSelector(selectTotalPages)
  const totalCount = useAppSelector(selectTotalCount)
  const hasActiveFilters = useAppSelector(selectHasActiveFilters)
  const sort = useAppSelector(selectSort)

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  useEffect(() => {
    if (pagination.currentPage > totalPages) {
      dispatch(setPage(totalPages))
    }
  }, [pagination.currentPage, totalPages, dispatch])

  const handleDelete = useCallback(
    (id: string) => {
      dispatch(deleteTask(id))
      void message.success('Task deleted')
    },
    [dispatch, message],
  )

  const handleBulkDelete = useCallback(() => {
    const ids = selectedRowKeys.map(String)
    const count = ids.length
    modal.confirm({
      title: `Delete ${count} task${count === 1 ? '' : 's'}?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        dispatch(deleteManyTasks(ids))
        setSelectedRowKeys([])
        void message.success(`${count} task${count === 1 ? '' : 's'} deleted`)
      },
    })
  }, [dispatch, modal, message, selectedRowKeys])

  const handleStatusChange = useCallback(
    (id: string, status: TaskStatus) => {
      dispatch(updateTaskStatus({ id, status }))
      void message.success('Status updated')
    },
    [dispatch, message],
  )

  const handleSortChange = useCallback(
    (next: TaskSort) => {
      dispatch(setSort(next))
    },
    [dispatch],
  )

  const handlePageChange = useCallback(
    (page: number, nextPageSize: number) => {
      if (nextPageSize !== pagination.pageSize) {
        dispatch(setPageSize(nextPageSize))
      } else {
        dispatch(setPage(page))
      }
    },
    [dispatch, pagination.pageSize],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tasks"
        subtitle="Search, filter and manage every task in the workspace."
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={form.openCreate}
          >
            New task
          </Button>
        }
      />

      <Card variant="borderless" className="app-card">
        <TaskFilters
          filters={filters}
          resultCount={filteredTasks.length}
          totalCount={totalCount}
          hasActiveFilters={hasActiveFilters}
          onFilterChange={(patch) => dispatch(setFilter(patch))}
          onReset={() => dispatch(resetFilters())}
        />

        {selectedRowKeys.length > 0 ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-500/30 dark:bg-brand-500/10">
            <Text>
              <Text strong>{selectedRowKeys.length}</Text> task
              {selectedRowKeys.length === 1 ? '' : 's'} selected
            </Text>
            <Space>
              <Button onClick={() => setSelectedRowKeys([])}>Clear</Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
              >
                Delete selected
              </Button>
            </Space>
          </div>
        ) : null}

        <TaskTable
          tasks={pageTasks}
          showActions
          onEdit={form.openEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          sortField={sort.field}
          sortOrder={sort.order}
          onSortChange={handleSortChange}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            preserveSelectedRowKeys: true,
          }}
          pagination={{
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: filteredTasks.length,
            showSizeChanger: true,
            pageSizeOptions: [...PAGE_SIZE_OPTIONS],
            onChange: handlePageChange,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} of ${total} records`,
          }}
        />
      </Card>

      <TaskFormModal open={form.open} task={form.task} onCancel={form.close} />
    </div>
  )
}
