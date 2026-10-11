import type { CSSProperties, ReactNode } from 'react'
import { Card, Statistic } from 'antd'

export interface StatCardProps {
  title: string
  value: number | string
  icon?: ReactNode
  color?: string
  hint?: string
  loading?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  icon,
  color,
  hint,
  loading = false,
  className,
}: StatCardProps) {
  const valueStyle: CSSProperties = color ? { color } : {}
  const cardClass = className
    ? `${className} app-card`
    : 'app-card h-full'

  return (
    <Card variant="borderless" loading={loading} className={cardClass}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Statistic title={title} value={value} valueStyle={valueStyle} />
          {hint ? (
            <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {hint}
            </div>
          ) : null}
        </div>
        {icon ? (
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
            style={
              color
                ? { backgroundColor: `${color}1a`, color }
                : { backgroundColor: '#f1f5f9', color: '#64748b' }
            }
          >
            {icon}
          </span>
        ) : null}
      </div>
    </Card>
  )
}
