import { Card, Empty, Progress, Typography } from 'antd'
import type { BreakdownRow } from '../types'

const { Text } = Typography

export interface BreakdownCardProps {
  title: string
  rows: BreakdownRow[]
  total: number
  emptyDescription?: string
}

export function BreakdownCard({
  title,
  rows,
  total,
  emptyDescription = 'Nothing to show yet',
}: BreakdownCardProps) {
  return (
    <Card variant="borderless" title={title} className="app-card h-full">
      {total === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={emptyDescription}
        />
      ) : (
        <>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            {rows.map((row) => (
              <div
                key={row.key}
                style={{ width: `${row.percent}%`, backgroundColor: row.color }}
                title={`${row.label}: ${row.percent}%`}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {rows.map((row) => (
              <div key={row.key}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    <Text>{row.label}</Text>
                  </span>
                  <span className="flex items-baseline gap-2">
                    <Text strong>{row.count}</Text>
                    <Text type="secondary" className="w-11 text-right text-xs">
                      {row.percent}%
                    </Text>
                  </span>
                </div>
                <Progress
                  percent={row.percent}
                  strokeColor={row.color}
                  showInfo={false}
                  size="small"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
