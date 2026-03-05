import type { AppLanguageCode } from './types'

const localeByLanguage: Record<AppLanguageCode, string> = {
  ru: 'ru-RU',
  uk: 'uk-UA',
  de: 'de-DE',
}

export const getLocaleByLanguage = (language: AppLanguageCode): string =>
  localeByLanguage[language] ?? localeByLanguage.ru
