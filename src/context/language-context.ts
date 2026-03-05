import { createContext, useContext } from 'react'
import type { AppLanguageCode } from '../i18n/types'

export type AppLanguage = {
  id: number
  code: AppLanguageCode
  name: string
  sort_order: number
  is_active: boolean
  is_default: boolean
}

type LanguageContextValue = {
  language: AppLanguageCode
  setLanguage: (code: AppLanguageCode) => void
  languages: AppLanguage[]
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
