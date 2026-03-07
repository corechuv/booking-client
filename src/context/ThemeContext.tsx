import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type AppTheme } from './theme-context'

const THEME_STORAGE_KEY = 'mira-theme'

const getInitialTheme = (): AppTheme => {
  if (typeof window === 'undefined') {
    return 'mira-dark'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'mira-light') {
    return 'mira-light'
  }

  return 'mira-dark'
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () =>
        setTheme((current) =>
          current === 'mira-dark' ? 'mira-light' : 'mira-dark',
        ),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export { ThemeProvider }
