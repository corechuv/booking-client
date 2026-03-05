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

export const getCookiePreferencesStorageKey = () => 'mira-cookie-preferences'

export const getCookiePreferences = (): CookiePreferences => {
  return { ...DEFAULT_COOKIE_PREFERENCES }
}

export const isCookieCategoryEnabled = (key: CookieCategoryKey): boolean => {
  if (key === 'necessary') {
    return true
  }
  return getCookiePreferences()[key]
}

export const clearFunctionalStorage = (): void => {
  return
}

export const persistCookiePreferences = (
  next: Omit<CookiePreferences, 'updated_at'>,
): CookiePreferences => {
  return normalize({
    necessary: true,
    functional: Boolean(next.functional),
    analytics: Boolean(next.analytics),
    marketing: Boolean(next.marketing),
    updated_at: new Date().toISOString(),
  })
}

export const applyCookiePreferences = (
  preferences: CookiePreferences,
): void => {
  if (!preferences.functional) {
    clearFunctionalStorage()
  }
}
