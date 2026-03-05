import { createContext, useContext } from 'react'

export type AppTheme = 'mira-dark' | 'mira-light'

type ThemeContextValue = {
  theme: AppTheme
  toggleTheme: () => void
  setTheme: (theme: AppTheme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
