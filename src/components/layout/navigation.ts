import type { ComponentType } from 'react'
import { DashboardOutlined, UnorderedListOutlined } from '@ant-design/icons'

export const APP_NAME = 'TaskFlow'

export interface NavItem {
  key: string
  label: string
  icon: ComponentType
}

export const NAV_ITEMS: NavItem[] = [
  { key: '/dashboard', label: 'Dashboard', icon: DashboardOutlined },
  { key: '/tasks', label: 'Tasks', icon: UnorderedListOutlined },
]
