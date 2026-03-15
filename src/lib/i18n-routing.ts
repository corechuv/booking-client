import type { AppLanguageCode } from '../i18n/types'

export const SUPPORTED_LANGUAGES: AppLanguageCode[] = ['ru', 'uk', 'de']
export const DEFAULT_LANGUAGE: AppLanguageCode = 'ru'

const NON_LOCALIZED_PREFIXES = ['/admin']

const normalizeToPathname = (value: string): string =>
  value.startsWith('/') ? value : `/${value}`

const extractPathParts = (value: string): {
  pathname: string
  search: string
  hash: string
} => {
  const match = value.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/)
  return {
    pathname: normalizeToPathname(match?.[1] ?? '/'),
    search: match?.[2] ?? '',
    hash: match?.[3] ?? '',
  }
}

export const normalizeLanguageCode = (
  value: string | null | undefined,
): AppLanguageCode | null => {
  const normalized = value?.trim().toLowerCase().replace('_', '-')
  const base = normalized?.split('-')[0]
  if (base === 'ua') {
    return 'uk'
  }
  if (base === 'ru' || base === 'uk' || base === 'de') {
    return base
  }
  return null
}

export const splitLocalizedPathname = (pathnameRaw: string): {
  language: AppLanguageCode | null
  pathname: string
} => {
  const pathname = normalizeToPathname(pathnameRaw || '/')
  const segments = pathname.split('/').filter(Boolean)
  const maybeLanguage = normalizeLanguageCode(segments[0])
  if (!maybeLanguage) {
    return { language: null, pathname }
  }

  const rest = `/${segments.slice(1).join('/')}`.replace(/\/+$/, '') || '/'
  return { language: maybeLanguage, pathname: rest === '' ? '/' : rest }
}

export const localizePath = (
  value: string,
  language: AppLanguageCode,
): string => {
  if (!value) {
    return `/${language}`
  }

  if (/^[a-z]+:\/\//i.test(value) || value.startsWith('mailto:') || value.startsWith('tel:')) {
    return value
  }

  if (value.startsWith('#')) {
    return value
  }

  const { pathname, search, hash } = extractPathParts(value)

  if (NON_LOCALIZED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return `${pathname}${search}${hash}`
  }

  const split = splitLocalizedPathname(pathname)
  const normalizedPath = split.pathname === '/' ? '' : split.pathname
  const localizedPathname = `/${language}${normalizedPath}`

  return `${localizedPathname}${search}${hash}`
}

