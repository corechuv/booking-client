import { useCallback, useEffect, useState } from 'react'
import {
  ApiError,
  fetchPublicContact,
  type PublicContactSettings,
} from '../api/client-api'
import { useLanguage } from '../context/language-context'
import { useI18n } from './useI18n'

export const fallbackPublicContact: PublicContactSettings = {
  id: 0,
  salon_name: '',
  phone: '',
  email: '',
  address: '',
  route_url: '',
  created_at: '',
  updated_at: '',
}

const getErrorText = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  return 'Failed to load salon contacts.'
}

type UsePublicContactResult = {
  contact: PublicContactSettings
  isLoading: boolean
  error: string | null
}

export const usePublicContact = (): UsePublicContactResult => {
  const { language } = useLanguage()
  const { t } = useI18n()
  const [contact, setContact] = useState<PublicContactSettings>(fallbackPublicContact)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContact = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const nextContact = await fetchPublicContact(language)
      setContact(nextContact)
    } catch (requestError) {
      setContact(fallbackPublicContact)
      if (requestError instanceof ApiError) {
        setError(getErrorText(requestError))
      } else {
        setError(t('contacts.errorFallback'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [language, t])

  useEffect(() => {
    void loadContact()
  }, [loadContact])

  return {
    contact,
    isLoading,
    error,
  }
}
