import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { AppstoreOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { APP_NAME, NAV_ITEMS } from './navigation'

function BrandMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg text-white shadow-lg shadow-brand-600/30">
        <AppstoreOutlined />
      </span>
      {!collapsed ? (
        <span className="truncate text-base font-semibold tracking-tight text-white">
          {APP_NAME}
        </span>
      ) : null}
    </Link>
  )
}

export interface AppSiderContentProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function AppSiderContent({
  collapsed = false,
  onNavigate,
}: AppSiderContentProps) {
  const location = useLocation()

  const items: MenuProps['items'] = NAV_ITEMS.map((item) => ({
    key: item.key,
    icon: <item.icon />,
    label: (
      <Link to={item.key} onClick={onNavigate}>
        {item.label}
      </Link>
    ),
  }))

  return (
    <div className="flex h-full flex-col bg-[#0b1220]">
      <div className="flex h-16 shrink-0 items-center px-5">
        <BrandMark collapsed={collapsed} />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        className="!border-0 !bg-transparent"
        style={{ flex: 1, borderInlineEnd: 'none' }}
      />
      {!collapsed ? (
        <div className="px-6 py-4 text-xs text-slate-500">
          v1.0 · React 18 · RTK
        </div>
      ) : null}
    </div>
  )
}
