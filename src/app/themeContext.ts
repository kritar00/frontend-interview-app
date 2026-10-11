import { createContext, useContext } from 'react'
import type { ThemeMode } from './theme'

export interface ThemeContextValue {
  mode: ThemeMode
  isDark: boolean
  toggleMode: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used inside <ThemeProvider>')
  }
  return context
}
