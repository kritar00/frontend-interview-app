import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { App as AntApp, ConfigProvider, theme as antdThemeApi } from 'antd'
import { antdTheme, type ThemeMode } from './theme'
import { ThemeContext, type ThemeContextValue } from './themeContext'

const STORAGE_KEY = 'taskflow.theme-mode'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode)
  const isDark = mode === 'dark'

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.style.colorScheme = mode
    window.localStorage.setItem(STORAGE_KEY, mode)
  }, [mode, isDark])

  const toggleMode = useCallback(() => {
    setMode((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark, toggleMode }),
    [mode, isDark, toggleMode],
  )

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          ...antdTheme,
          algorithm: isDark
            ? antdThemeApi.darkAlgorithm
            : antdThemeApi.defaultAlgorithm,
        }}
      >
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
