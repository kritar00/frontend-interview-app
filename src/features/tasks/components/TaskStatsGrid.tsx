import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProfileOutlined,
  SyncOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useAppSelector } from '@/app/hooks'
import { BRAND_COLOR } from '@/app/theme'
import { selectAllTasks, selectTaskStats } from '../store/selectors'
import { isOverdue } from '../utils/task'
import { STATUS_META } from '../utils/taskMeta'
import { StatCard } from './StatCard'

function percentOf(value: number, total: number): number {
  return total === 0 ? 0 : Math.round((value / total) * 100)
}

export function TaskStatsGrid() {
  const { total, todo, inProgress, done } = useAppSelector(selectTaskStats)
  const tasks = useAppSelector(selectAllTasks)
  const overdue = tasks.filter(isOverdue).length

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total tasks"
        value={total}
        icon={<ProfileOutlined />}
        color={BRAND_COLOR}
        hint={overdue > 0 ? `${overdue} overdue` : 'Everything on schedule'}
      />
      <StatCard
        title={STATUS_META.todo.label}
        value={todo}
        icon={<ClockCircleOutlined />}
        color={STATUS_META.todo.color}
        hint={`${percentOf(todo, total)}% of all tasks`}
      />
      <StatCard
        title={STATUS_META.in_progress.label}
        value={inProgress}
        icon={<SyncOutlined />}
        color={STATUS_META.in_progress.color}
        hint={`${percentOf(inProgress, total)}% of all tasks`}
      />
      <StatCard
        title={STATUS_META.done.label}
        value={done}
        icon={overdue > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
        color={STATUS_META.done.color}
        hint={`${percentOf(done, total)}% of all tasks`}
      />
    </div>
  )
}
