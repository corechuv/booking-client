import { useMemo } from 'react'
import { useLanguage } from '../context/language-context'
import { getLocaleByLanguage } from '../i18n/locale'
import { translate } from '../i18n/messages'
import type { TranslationParams } from '../i18n/types'

export const useI18n = () => {
  const { language } = useLanguage()

  return useMemo(
    () => ({
      language,
      locale: getLocaleByLanguage(language),
      t: (key: string, params?: TranslationParams) =>
        translate(language, key, params),
    }),
    [language],
  )
}
