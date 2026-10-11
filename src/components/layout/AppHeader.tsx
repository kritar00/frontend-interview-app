import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Input,
  Layout,
  Space,
  Tooltip,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  BellOutlined,
  BulbOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { useThemeMode } from '@/app/themeContext'
import { NAV_ITEMS } from './navigation'

const { Header } = Layout

export interface AppHeaderProps {
  isDesktop: boolean
  collapsed: boolean
  onToggleSider: () => void
  onOpenDrawer: () => void
}

function usePageLabel(): string {
  const location = useLocation()
  return (
    NAV_ITEMS.find((item) => item.key === location.pathname)?.label ?? 'Overview'
  )
}

export function AppHeader({
  isDesktop,
  collapsed,
  onToggleSider,
  onOpenDrawer,
}: AppHeaderProps) {
  const { isDark, toggleMode } = useThemeMode()
  const pageLabel = usePageLabel()

  const userMenu: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign out',
      danger: true,
    },
  ]

  return (
    <Header className="sticky top-0 z-20 !flex !items-center !justify-between !bg-white/80 !px-4 !backdrop-blur dark:!bg-slate-900/80 sm:!px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="text"
          aria-label="Toggle navigation"
          icon={
            isDesktop && collapsed ? (
              <MenuUnfoldOutlined />
            ) : (
              <MenuFoldOutlined />
            )
          }
          onClick={isDesktop ? onToggleSider : onOpenDrawer}
        />
        <h1 className="truncate text-base font-semibold text-slate-900 dark:text-white">
          {pageLabel}
        </h1>
      </div>

      <Space size={8}>
        <Input
          allowClear
          placeholder="Search tasks…"
          prefix={<SearchOutlined className="text-slate-400" />}
          className="!hidden !w-56 md:!inline-flex"
        />

        <Tooltip title={isDark ? 'Switch to light' : 'Switch to dark'}>
          <Button
            type="text"
            aria-label="Toggle colour theme"
            icon={isDark ? <MoonOutlined /> : <BulbOutlined />}
            onClick={toggleMode}
          />
        </Tooltip>

        <Tooltip title="Notifications">
          <Badge dot offset={[-6, 6]}>
            <Button type="text" aria-label="Notifications" icon={<BellOutlined />} />
          </Badge>
        </Tooltip>

        <Dropdown menu={{ items: userMenu }} placement="bottomRight" trigger={['click']}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-slate-800 border-none"
          >
            <Avatar size={30} className="!bg-brand-600">
              GD
            </Avatar>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline dark:text-slate-200">
              Godskin
            </span>
          </button>
        </Dropdown>
      </Space>
    </Header>
  )
}