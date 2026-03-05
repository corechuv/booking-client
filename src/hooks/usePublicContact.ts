import { useCallback, useEffect, useState } from 'react'
import {
  ApiError,
  fetchPublicContact,
  type PublicContactSettings,
} from '../api/client-api'
import {
  SALON_ADDRESS,
  SALON_NAME,
  SALON_PHONE,
  SALON_ROUTE_URL,
} from '../config/salon'
import { useLanguage } from '../context/language-context'
import { useI18n } from './useI18n'

export const fallbackPublicContact: PublicContactSettings = {
  id: 0,
  salon_name: SALON_NAME,
  phone: SALON_PHONE,
  email: '',
  address: SALON_ADDRESS,
  route_url: SALON_ROUTE_URL,
  created_at: '',
  updated_at: '',
}

const withContactOverrides = (
  input: PublicContactSettings,
): PublicContactSettings => ({
  ...input,
  salon_name: SALON_NAME,
  phone: SALON_PHONE,
  address: SALON_ADDRESS,
  route_url: SALON_ROUTE_URL,
})

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
      setContact(withContactOverrides(nextContact))
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
