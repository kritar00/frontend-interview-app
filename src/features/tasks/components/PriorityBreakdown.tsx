import { useAppSelector } from '@/app/hooks'
import { selectPriorityBreakdown, selectTotalCount } from '../store/selectors'
import { BreakdownCard } from './BreakdownCard'

export function PriorityBreakdown() {
  const rows = useAppSelector(selectPriorityBreakdown)
  const total = useAppSelector(selectTotalCount)

  return (
    <BreakdownCard
      title="Priority breakdown"
      rows={rows}
      total={total}
      emptyDescription="No tasks yet"
    />
  )
}
