import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaskFormModal } from '../components/TaskFormModal'
import { PriorityBreakdown } from '../components/PriorityBreakdown'
import { RecentTasksTable } from '../components/RecentTasksTable'
import { StatusBreakdown } from '../components/StatusBreakdown'
import { TaskStatsGrid } from '../components/TaskStatsGrid'
import { useTaskFormModal } from '../hooks/useTaskFormModal'
import { useAppSelector } from '@/app/hooks'
import { selectTotalCount } from '../store/selectors'

export function DashboardPage() {
  const form = useTaskFormModal()
  const total = useAppSelector(selectTotalCount)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        subtitle={`A snapshot of ${total} task${total === 1 ? '' : 's'} across the workspace.`}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={form.openCreate}>
            New task
          </Button>
        }
      />

      <TaskStatsGrid />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <StatusBreakdown />
        <PriorityBreakdown />
      </div>

      <RecentTasksTable />

      <TaskFormModal open={form.open} task={form.task} onCancel={form.close} />
    </div>
  )
}
