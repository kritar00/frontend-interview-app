import { useEffect, useState } from 'react'
import { Button, DatePicker, Input, Select, Typography } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { ReloadOutlined } from '@ant-design/icons'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import type { TaskPriority, TaskStatus } from '../types'
import type { TaskFilters as TaskFiltersState } from '../store/tasksSlice'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/taskMeta'

const { Text } = Typography

const { RangePicker } = DatePicker

const SEARCH_DEBOUNCE_MS = 300

export interface TaskFiltersProps {
  filters: TaskFiltersState
  resultCount: number
  totalCount: number
  hasActiveFilters: boolean
  onFilterChange: (patch: Partial<TaskFiltersState>) => void
  onReset: () => void
}

export function TaskFilters({
  filters,
  resultCount,
  totalCount,
  hasActiveFilters,
  onFilterChange,
  onReset,
}: TaskFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchText)

  useEffect(() => {
    setSearchInput(filters.searchText)
  }, [filters.searchText])

  const pushSearch = useDebouncedCallback(
    (searchText: string) => onFilterChange({ searchText }),
    SEARCH_DEBOUNCE_MS,
  )

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    pushSearch(value)
  }

  const rangeValue: [Dayjs, Dayjs] | null = filters.dateRange
    ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
    : null

  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    const from = dates?.[0]?.format('YYYY-MM-DD')
    const to = dates?.[1]?.format('YYYY-MM-DD')
    onFilterChange({ dateRange: from && to ? [from, to] : null })
  }

  const handleReset = () => {
    setSearchInput('')
    onReset()
  }

  return (
    <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start">
      <Input.Search
        allowClear
        value={searchInput}
        onChange={(event) => handleSearchChange(event.target.value)}
        onSearch={handleSearchChange}
        placeholder="Search tasks by title…"
        className="xl:max-w-sm xl:flex-1"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select<TaskStatus[]>
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          value={filters.status}
          onChange={(status: TaskStatus[]) => onFilterChange({ status })}
          placeholder="All statuses"
          className="min-w-[190px]"
          options={STATUS_OPTIONS}
        />

        <Select<TaskPriority[]>
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          value={filters.priority}
          onChange={(priority: TaskPriority[]) => onFilterChange({ priority })}
          placeholder="All priorities"
          className="min-w-[190px]"
          options={PRIORITY_OPTIONS}
        />

        <RangePicker
          value={rangeValue}
          onChange={handleRangeChange}
          format="DD MMM YYYY"
          placeholder={['Due from', 'Due to']}
          className="!w-[280px]"
        />

        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          disabled={!hasActiveFilters}
        >
          Reset
        </Button>

        <Text type="secondary" className="whitespace-nowrap">
          {resultCount} of {totalCount} tasks
        </Text>
      </div>
    </div>
  )
}
