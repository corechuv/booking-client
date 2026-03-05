import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type AppTheme } from './theme-context'
import { isCookieCategoryEnabled } from '../utils/cookie-preferences'

const STORAGE_KEY = 'mira-theme'

const getInitialTheme = (): AppTheme => {
  if (typeof window === 'undefined') {
    return 'mira-dark'
  }

  if (!isCookieCategoryEnabled('functional')) {
    return 'mira-dark'
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY)
  return savedTheme === 'mira-light' ? 'mira-light' : 'mira-dark'
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)

    if (isCookieCategoryEnabled('functional')) {
      window.localStorage.setItem(STORAGE_KEY, theme)
      return
    }

    window.localStorage.removeItem(STORAGE_KEY)
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
