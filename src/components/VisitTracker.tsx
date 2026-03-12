import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPublicVisit } from '../api/client-api'

const VISIT_SESSION_STORAGE_KEY = 'mira_visit_session_id'

const generateSessionId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `visit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const getVisitSessionId = (): string => {
  if (typeof window === 'undefined') {
    return generateSessionId()
  }

  const existing = window.sessionStorage.getItem(VISIT_SESSION_STORAGE_KEY)
  if (existing) {
    return existing
  }

  const sessionId = generateSessionId()
  window.sessionStorage.setItem(VISIT_SESSION_STORAGE_KEY, sessionId)
  return sessionId
}

function VisitTracker() {
  const location = useLocation()
  const sessionId = useMemo(getVisitSessionId, [])

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}` || '/'
    const referrer = typeof document !== 'undefined' ? document.referrer || null : null
    const language =
      typeof navigator !== 'undefined'
        ? navigator.language || null
        : null

    void trackPublicVisit({
      path,
      referrer,
      language,
      session_id: sessionId,
    }).catch(() => undefined)
  }, [location.hash, location.pathname, location.search, sessionId])

  return null
}

export default VisitTracker

