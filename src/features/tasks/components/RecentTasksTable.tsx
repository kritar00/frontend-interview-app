import { Card } from 'antd'
import { useAppSelector } from '@/app/hooks'
import { RECENT_TASKS_LIMIT, selectRecentTasks } from '../store/selectors'
import { TaskTable } from './TaskTable'

export function RecentTasksTable() {
  const tasks = useAppSelector(selectRecentTasks)

  return (
    <Card
      variant="borderless"
      className="app-card"
      title={`Recently created`}
      extra={<span className="text-xs text-slate-400">latest {RECENT_TASKS_LIMIT}</span>}
    >
      <TaskTable tasks={tasks} compact />
    </Card>
  )
}
