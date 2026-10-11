import { useState } from 'react'
import { Drawer, Grid, Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { AppSiderContent } from './AppSider'

const { Sider, Content } = Layout

const SIDER_WIDTH = 248
const SIDER_COLLAPSED_WIDTH = 80

export function AppLayout() {
  const screens = Grid.useBreakpoint()
  const isDesktop = Boolean(screens.lg)
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Layout className="min-h-screen !bg-slate-50 dark:!bg-slate-950">
      {isDesktop ? (
        <Sider
          theme="dark"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={SIDER_WIDTH}
          collapsedWidth={SIDER_COLLAPSED_WIDTH}
          className="!fixed inset-y-0 left-0 z-30 !bg-[#0b1220]"
        >
          <AppSiderContent collapsed={collapsed} />
        </Sider>
      ) : (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={SIDER_WIDTH + 12}
          closable={false}
          styles={{ body: { padding: 0, background: '#0b1220' } }}
        >
          <AppSiderContent onNavigate={() => setDrawerOpen(false)} />
        </Drawer>
      )}

      <Layout
        className="transition-[margin] duration-200"
        style={{
          marginInlineStart: isDesktop
            ? collapsed
              ? SIDER_COLLAPSED_WIDTH
              : SIDER_WIDTH
            : 0,
        }}
      >
        <AppHeader
          isDesktop={isDesktop}
          collapsed={collapsed}
          onToggleSider={() => setCollapsed((value) => !value)}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        <Content className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
