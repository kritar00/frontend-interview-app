import { useAppSelector } from '@/app/hooks'
import { selectStatusBreakdown, selectTotalCount } from '../store/selectors'
import { BreakdownCard } from './BreakdownCard'

export function StatusBreakdown() {
  const rows = useAppSelector(selectStatusBreakdown)
  const total = useAppSelector(selectTotalCount)

  return (
    <BreakdownCard
      title="Status breakdown"
      rows={rows}
      total={total}
      emptyDescription="No tasks yet"
    />
  )
}
