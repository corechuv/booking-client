import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type AppTheme } from './theme-context'

const getInitialTheme = (): AppTheme => {
  return 'mira-dark'
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
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
