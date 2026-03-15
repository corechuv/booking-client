import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchPublicLanguages, type PublicLanguage } from '../api/client-api'
import { LanguageContext, type AppLanguage } from './language-context'
import type { AppLanguageCode } from '../i18n/types'
import {
  localizePath,
  normalizeLanguageCode,
  splitLocalizedPathname,
} from '../lib/i18n-routing'

const LANGUAGE_STORAGE_KEY = 'mira-language'
const localeByLanguage: Record<AppLanguageCode, string> = {
  ru: 'ru-RU',
  uk: 'uk-UA',
  de: 'de-DE',
}

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

const toAppLanguageCode = (value: string | null | undefined): AppLanguageCode =>
  normalizeLanguageCode(value) ?? 'ru'

const parseLanguageCode = (
  value: string | null | undefined,
): AppLanguageCode | null => {
  const normalized = value?.trim().toLowerCase().replace('_', '-')
  const baseCode = normalized?.split('-')[0]
  if (baseCode === 'ua') {
    return 'uk'
  }
  if (baseCode === 'ru' || baseCode === 'uk' || baseCode === 'de') {
    return baseCode
  }
  return null
}

const toLanguage = (payload: PublicLanguage): AppLanguage => ({
  id: payload.id,
  code: toAppLanguageCode(payload.code),
  name: payload.name,
  sort_order: payload.sort_order,
  is_active: payload.is_active,
  is_default: payload.is_default,
})

const getInitialLanguage = (): AppLanguageCode => {
  if (typeof window === 'undefined') {
    return 'ru'
  }

  const pathLanguage = splitLocalizedPathname(window.location.pathname).language
  if (pathLanguage) {
    return pathLanguage
  }

  const queryLanguage = parseLanguageCode(
    new URLSearchParams(window.location.search).get('lang'),
  )
  if (queryLanguage) {
    return queryLanguage
  }

  const storedCode = parseLanguageCode(window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
  if (storedCode) {
    return storedCode
  }

  const documentCode = parseLanguageCode(document.documentElement.getAttribute('lang'))
  if (documentCode) {
    return documentCode
  }

  const browserLanguageCode = parseLanguageCode(
    window.navigator.language.split('-')[0],
  )
  if (browserLanguageCode) {
    return browserLanguageCode
  }

  return 'ru'
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

  const locale = localeByLanguage[code] ?? localeByLanguage.ru
  document.documentElement.setAttribute('lang', locale)
  document.documentElement.setAttribute('xml:lang', locale)
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
    applyDocumentLanguage(language)
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
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

        if (typeof window !== 'undefined') {
          const nextHref = localizePath(
            `${window.location.pathname}${window.location.search}${window.location.hash}`,
            code,
          )

          applyDocumentLanguage(code)
          window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
          setLanguageState(code)

          const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`
          if (nextHref !== currentHref) {
            window.location.assign(nextHref)
          }
          return
        }

        applyDocumentLanguage(code)
        setLanguageState(code)
      },
      languages,
    }),
    [language, languages],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export { LanguageProvider }
