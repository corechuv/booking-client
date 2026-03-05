export type CookieCategoryKey =
  | 'necessary'
  | 'functional'
  | 'analytics'
  | 'marketing'

export type CookiePreferences = {
  necessary: true
  functional: boolean
  analytics: boolean
  marketing: boolean
  updated_at: string
}

const STORAGE_KEY = 'mira-cookie-preferences'

const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
  updated_at: '',
}

const toBool = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback

const normalize = (value: unknown): CookiePreferences => {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_COOKIE_PREFERENCES }
  }

  const input = value as Partial<CookiePreferences>
  return {
    necessary: true,
    functional: toBool(input.functional, DEFAULT_COOKIE_PREFERENCES.functional),
    analytics: toBool(input.analytics, DEFAULT_COOKIE_PREFERENCES.analytics),
    marketing: toBool(input.marketing, DEFAULT_COOKIE_PREFERENCES.marketing),
    updated_at:
      typeof input.updated_at === 'string' ? input.updated_at : '',
  }
}

export const getCookiePreferencesStorageKey = () => STORAGE_KEY

export const getCookiePreferences = (): CookiePreferences => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_COOKIE_PREFERENCES }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...DEFAULT_COOKIE_PREFERENCES }
    }
    return normalize(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_COOKIE_PREFERENCES }
  }
}

export const isCookieCategoryEnabled = (key: CookieCategoryKey): boolean => {
  if (key === 'necessary') {
    return true
  }
  return getCookiePreferences()[key]
}

export const clearFunctionalStorage = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem('mira-theme')
  window.localStorage.removeItem('mira-language')

  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index)
    if (key?.startsWith('mira-booking-confirmed:')) {
      window.sessionStorage.removeItem(key)
    }
  }
}

export const persistCookiePreferences = (
  next: Omit<CookiePreferences, 'updated_at'>,
): CookiePreferences => {
  const normalized: CookiePreferences = {
    necessary: true,
    functional: Boolean(next.functional),
    analytics: Boolean(next.analytics),
    marketing: Boolean(next.marketing),
    updated_at: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  }

  return normalized
}

export const applyCookiePreferences = (
  preferences: CookiePreferences,
): void => {
  if (!preferences.functional) {
    clearFunctionalStorage()
  }
}
