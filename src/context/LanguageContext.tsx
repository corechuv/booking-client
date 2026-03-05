import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchPublicLanguages, type PublicLanguage } from '../api/client-api'
import { LanguageContext, type AppLanguage } from './language-context'
import type { AppLanguageCode } from '../i18n/types'
import { isCookieCategoryEnabled } from '../utils/cookie-preferences'

const STORAGE_KEY = 'mira-language'

const fallbackLanguages: AppLanguage[] = [
  {
    id: 1,
    code: 'ru',
    name: 'Русский',
    sort_order: 10,
    is_active: true,
    is_default: true,
  },
  {
    id: 2,
    code: 'uk',
    name: 'Українська',
    sort_order: 20,
    is_active: true,
    is_default: false,
  },
  {
    id: 3,
    code: 'de',
    name: 'Deutsch',
    sort_order: 30,
    is_active: true,
    is_default: false,
  },
]

const normalizeLanguageCode = (value: string | null | undefined): AppLanguageCode => {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'uk') {
    return 'uk'
  }
  if (normalized === 'de') {
    return 'de'
  }
  return 'ru'
}

const toLanguage = (payload: PublicLanguage): AppLanguage => ({
  id: payload.id,
  code: normalizeLanguageCode(payload.code),
  name: payload.name,
  sort_order: payload.sort_order,
  is_active: payload.is_active,
  is_default: payload.is_default,
})

const getInitialLanguage = (): AppLanguageCode => {
  if (typeof window === 'undefined') {
    return 'ru'
  }

  if (!isCookieCategoryEnabled('functional')) {
    return 'ru'
  }

  return normalizeLanguageCode(window.localStorage.getItem(STORAGE_KEY))
}

const resolveDefaultLanguage = (languages: AppLanguage[]): AppLanguageCode => {
  const sorted = [...languages].sort((a, b) => a.sort_order - b.sort_order)
  const explicitDefault = sorted.find((item) => item.is_default)
  if (explicitDefault) {
    return explicitDefault.code
  }
  return sorted[0]?.code ?? 'ru'
}

const applyDocumentLanguage = (code: AppLanguageCode) => {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.setAttribute('lang', code)
  document.documentElement.setAttribute('xml:lang', code)
  document.documentElement.setAttribute('translate', 'yes')

  const contentLanguageMeta = document.querySelector(
    'meta[name="content-language"]',
  )
  if (contentLanguageMeta) {
    contentLanguageMeta.setAttribute('content', code)
  }
}

function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguageCode>(getInitialLanguage)
  const [languages, setLanguages] = useState<AppLanguage[]>(fallbackLanguages)

  useEffect(() => {
    if (isCookieCategoryEnabled('functional')) {
      window.localStorage.setItem(STORAGE_KEY, language)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    applyDocumentLanguage(language)
  }, [language])

  useEffect(() => {
    let isMounted = true

    const loadLanguages = async () => {
      try {
        const payload = await fetchPublicLanguages()
        if (!isMounted || !payload.length) {
          return
        }

        const mapped = payload.map(toLanguage).filter((item) => item.is_active)
        const nextLanguages = mapped.length ? mapped : fallbackLanguages
        setLanguages(nextLanguages)
        setLanguageState((current) => {
          if (nextLanguages.some((item) => item.code === current)) {
            return current
          }
          return resolveDefaultLanguage(nextLanguages)
        })
      } catch {
        if (!isMounted) {
          return
        }

        setLanguages(fallbackLanguages)
      }
    }

    void loadLanguages()

    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => ({
      language,
      setLanguage: (code: AppLanguageCode) => {
        if (code === language) {
          return
        }

        if (isCookieCategoryEnabled('functional')) {
          window.localStorage.setItem(STORAGE_KEY, code)
        } else {
          window.localStorage.removeItem(STORAGE_KEY)
        }
        applyDocumentLanguage(code)
        setLanguageState(code)
        window.location.reload()
      },
      languages,
    }),
    [language, languages],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export { LanguageProvider }
