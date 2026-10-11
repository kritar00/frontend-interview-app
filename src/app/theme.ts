import type { ThemeConfig } from 'antd'

export type ThemeMode = 'light' | 'dark'

export const BRAND_COLOR = '#2563eb'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: BRAND_COLOR,
    colorInfo: BRAND_COLOR,
    borderRadius: 10,
    borderRadiusLG: 14,
    fontSize: 14,
    colorBgLayout: 'transparent',
  },
  components: {
    Layout: {
      headerHeight: 64,
      headerPadding: '0 20px',
      siderBg: '#0b1220',
      bodyBg: 'transparent',
    },
    Menu: {
      itemHeight: 42,
      itemMarginInline: 12,
      itemBorderRadius: 10,
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkPopupBg: '#111c33',
      iconMarginInlineEnd: 12,
    },
    Card: {
      paddingLG: 20,
      boxShadowTertiary:
        '0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)',
    },
    Table: {
      headerBg: 'transparent',
      headerSplitColor: 'transparent',
      rowHoverBg: 'rgba(37, 99, 235, 0.04)',
      cellPaddingBlock: 14,
    },
    Segmented: {
      itemSelectedBg: '#ffffff',
    },
  },
}
