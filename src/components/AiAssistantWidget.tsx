import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ApiError,
  chatWithAssistant,
  fetchPublicContact,
  type AssistantHistoryItem,
} from '../api/client-api'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { lockBodyScroll, unlockBodyScroll } from '../lib/body-scroll-lock'
import { AI_ASSISTANT_OPEN_EVENT } from '../constants/assistant'
import { CloseIcon } from './icons'

type ChatMessage = AssistantHistoryItem & {
  id: string
}

const AI_CONSENT_STORAGE_KEY = 'mira-ai-consent-v1'
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const PHONE_RE = /(?:\+?\d[\d()\-\s]{6,}\d)/
const IBAN_RE = /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/i
const CARD_RE = /\b(?:\d[ -]*?){13,19}\b/
const MAP_INTENT_RE = /\bmap\b|\broute\b|\baddress\b|карта|маршрут|адрес|мапа|адреса|karte|route|adresse|anfahrt|maps\.google/i
const ASSISTANT_ROUTE_LABELS: Record<string, string> = {
  '/inspiration': 'nav.inspiration',
  '/catalog': 'nav.catalog',
  '/booking': 'footer.booking',
  '/contacts': 'nav.contacts',
  '/faq': 'nav.faq',
  '/pricing': 'nav.pricing',
  '/specialists': 'nav.specialists',
  '/privacy': 'footer.privacy',
  '/terms': 'footer.terms',
  '/cookies': 'footer.cookies',
  '/impressum': 'footer.impressum',
}

const createAssistantRouteRegex = () =>
  /\/(?:inspiration|catalog|booking|contacts|faq|pricing|specialists|privacy|terms|cookies|impressum)\b/gi

type AssistantActionLink = {
  path: string
  label: string
}

type AssistantExternalActionLink = {
  href: string
  label: string
}

const isAssistantFeatureEnabled = (): boolean => {
  const raw = import.meta.env.VITE_AI_ASSISTANT_ENABLED
  if (typeof raw !== 'string') {
    return true
  }
  return !['0', 'false', 'off', 'no'].includes(raw.trim().toLowerCase())
}

const createMessageId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function AiAssistantWidget() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const { pathname } = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [showConsentDetails, setShowConsentDetails] = useState(false)
  const [chatAddress, setChatAddress] = useState('')
  const [chatRouteUrl, setChatRouteUrl] = useState('')
  const [isFooterVisible, setIsFooterVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const isFeatureEnabled = isAssistantFeatureEnabled()
  const isHidden = pathname.startsWith('/admin')

  const starterMessage = useMemo<ChatMessage>(
    () => ({
      id: 'assistant-starter',
      role: 'assistant',
      content: t('assistant.greeting'),
    }),
    [t],
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }
    lockBodyScroll()
    return () => {
      unlockBodyScroll()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [isOpen, messages, isSending])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const savedConsent = window.sessionStorage.getItem(AI_CONSENT_STORAGE_KEY)
    setConsentAccepted(savedConsent === '1')
  }, [])

  useEffect(() => {
    if (!isHidden || !isOpen) {
      return
    }
    setIsOpen(false)
  }, [isHidden, isOpen])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const footer = document.querySelector('.site-footer')
    if (!footer) {
      setIsFooterVisible(false)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        setIsFooterVisible(Boolean(entry?.isIntersecting))
      },
      {
        root: null,
        // Hide the floating trigger before footer controls start.
        rootMargin: '0px 0px 120px 0px',
        threshold: 0.01,
      },
    )

    observer.observe(footer)
    return () => {
      observer.disconnect()
    }
  }, [pathname])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    let isCancelled = false

    void (async () => {
      try {
        const contact = await fetchPublicContact(language)
        if (isCancelled) {
          return
        }
        setChatAddress((contact.address ?? '').trim())
        setChatRouteUrl((contact.route_url ?? '').trim())
      } catch {
        if (isCancelled) {
          return
        }
        setChatAddress('')
        setChatRouteUrl('')
      }
    })()

    return () => {
      isCancelled = true
    }
  }, [isOpen, language])

  const openAssistant = useCallback(() => {
    setIsOpen(true)
    setErrorText(null)
    setMessages((prev) => (prev.length ? prev : [starterMessage]))
  }, [starterMessage])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleExternalOpen = () => {
      openAssistant()
    }

    window.addEventListener(AI_ASSISTANT_OPEN_EVENT, handleExternalOpen)
    return () => {
      window.removeEventListener(AI_ASSISTANT_OPEN_EVENT, handleExternalOpen)
    }
  }, [openAssistant])

  const closeAssistant = () => {
    setIsOpen(false)
    setErrorText(null)
  }

  const mapAssistantApiError = (apiError: ApiError): string => {
    const message = apiError.message.toLowerCase()
    if (message.includes('consent')) {
      return t('assistant.errorConsentRequired')
    }
    if (message.includes('personal or payment')) {
      return t('assistant.errorSensitiveData')
    }
    if (apiError.status === 429) {
      return t('assistant.errorRateLimit')
    }
    if (apiError.status >= 500) {
      return t('assistant.errorTemporary')
    }
    return apiError.message || t('assistant.errorGeneric')
  }

  const getAssistantActionLinks = (text: string): AssistantActionLink[] => {
    const uniquePaths = new Set<string>()

    for (const match of text.matchAll(createAssistantRouteRegex())) {
      const path = match[0].toLowerCase()
      if (ASSISTANT_ROUTE_LABELS[path]) {
        uniquePaths.add(path)
      }
    }

    return Array.from(uniquePaths).map((path) => ({
      path,
      label: t(ASSISTANT_ROUTE_LABELS[path]),
    }))
  }

  const getAssistantMapActionLinks = (
    text: string,
  ): AssistantExternalActionLink[] => {
    const normalized = text.trim().toLowerCase()
    if (
      !normalized
      || (!MAP_INTENT_RE.test(normalized) && !normalized.includes('/contacts'))
    ) {
      return []
    }

    const routeUrl = chatRouteUrl.trim()
    const address = chatAddress.trim()
    const encodedAddress = encodeURIComponent(address)
    const mapUrl = address
      ? `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      : routeUrl
    const routeLink = routeUrl
      || (address
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
        : '')

    const actions: AssistantExternalActionLink[] = []
    if (mapUrl) {
      actions.push({ href: mapUrl, label: t('map.openMap') })
    }
    if (routeLink) {
      actions.push({ href: routeLink, label: t('map.openRoute') })
    }
    return actions
  }

  const renderAssistantContent = (text: string): ReactNode => {
    const chunks: ReactNode[] = []
    const matcher = createAssistantRouteRegex()
    let currentIndex = 0
    let match = matcher.exec(text)

    while (match) {
      const rawPath = match[0]
      const matchIndex = match.index
      const path = rawPath.toLowerCase()
      const labelKey = ASSISTANT_ROUTE_LABELS[path]

      if (matchIndex > currentIndex) {
        chunks.push(text.slice(currentIndex, matchIndex))
      }

      if (labelKey) {
        chunks.push(
          <Link
            key={`inline-link-${path}-${matchIndex}`}
            to={path}
            className="ai-assistant__inline-link"
            onClick={closeAssistant}
          >
            {t(labelKey)}
          </Link>,
        )
      } else {
        chunks.push(rawPath)
      }

      currentIndex = matchIndex + rawPath.length
      match = matcher.exec(text)
    }

    if (currentIndex < text.length) {
      chunks.push(text.slice(currentIndex))
    }

    return <>{chunks}</>
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isSending) {
      return
    }
    if (!consentAccepted) {
      setErrorText(t('assistant.errorConsentRequired'))
      return
    }
    if (
      EMAIL_RE.test(text)
      || PHONE_RE.test(text)
      || IBAN_RE.test(text)
      || CARD_RE.test(text)
    ) {
      setErrorText(t('assistant.errorSensitiveData'))
      return
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: text,
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setErrorText(null)
    setIsSending(true)

    try {
      const history = nextMessages
        .filter((item) => item.id !== 'assistant-starter')
        .map(({ role, content }) => ({ role, content }))
        .slice(-12)

      const result = await chatWithAssistant({
        message: text,
        lang: language,
        history,
        consent_accepted: consentAccepted,
      })

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: 'assistant',
        content: result.message.trim() || t('assistant.errorEmptyResponse'),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setErrorText(mapAssistantApiError(requestError))
      } else {
        setErrorText(t('assistant.errorGeneric'))
      }
    } finally {
      setIsSending(false)
    }
  }

  if (!isFeatureEnabled || isHidden) {
    return null
  }

  return (
    <div className="ai-assistant">
      {!isOpen ? (
        <button
          type="button"
          className={
            isFooterVisible
              ? 'ai-assistant__toggle is-hidden'
              : 'ai-assistant__toggle'
          }
          aria-label={t('assistant.open')}
          aria-hidden={isFooterVisible}
          tabIndex={isFooterVisible ? -1 : 0}
          onClick={openAssistant}
        >
          <span className="ai-assistant__toggle-text">{t('assistant.always')}</span>
          <span className="ai-assistant__toggle-circle" aria-hidden="true">
            AI
          </span>
        </button>
      ) : null}

      {isOpen ? (
        <section
          className="ai-assistant__panel"
          role="dialog"
          aria-modal="true"
          aria-label={t('assistant.title')}
        >
          <header className="ai-assistant__head">
            <div>
              <strong>{t('assistant.title')}</strong>
              <p>{t('assistant.subtitle')}</p>
            </div>
            <button
              type="button"
              className="ai-assistant__close"
              aria-label={t('assistant.close')}
              onClick={closeAssistant}
            >
              <CloseIcon size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="ai-assistant__messages" aria-live="polite">
            {messages.map((item) => (
              <article key={item.id}>
                <div
                  className={
                    item.role === 'user'
                      ? 'ai-assistant__bubble is-user'
                      : 'ai-assistant__bubble is-assistant'
                  }
                >
                  {item.role === 'assistant'
                    ? renderAssistantContent(item.content)
                    : item.content}
                </div>
                {item.role === 'assistant'
                  ? (
                    <div className="ai-assistant__actions">
                      {getAssistantActionLinks(item.content).map((action) => (
                        <Link
                          key={`${item.id}-${action.path}`}
                          to={action.path}
                          className="ai-assistant__action-link"
                          onClick={closeAssistant}
                        >
                          {t('assistant.action.openPage', { page: action.label })}
                        </Link>
                      ))}
                      {getAssistantMapActionLinks(item.content).map((action) => (
                        <a
                          key={`${item.id}-${action.href}`}
                          href={action.href}
                          className="ai-assistant__action-link is-external"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {action.label}
                        </a>
                      ))}
                    </div>
                    )
                  : null}
              </article>
            ))}
            {isSending ? (
              <article className="ai-assistant__bubble is-assistant">
                {t('assistant.sending')}
              </article>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {errorText ? <p className="ai-assistant__error">{errorText}</p> : null}

          <p className="ai-assistant__legal-note">{t('assistant.legal.note')}</p>
          {consentAccepted && !showConsentDetails
            ? (
              <div className="ai-assistant__consent-summary">
                <span>{t('assistant.consentAccepted')}</span>
                <button
                  type="button"
                  className="ai-assistant__consent-manage"
                  onClick={() => setShowConsentDetails(true)}
                >
                  {t('assistant.consentManage')}
                </button>
              </div>
              )
            : (
              <label className="ai-assistant__consent">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked
                    setConsentAccepted(checked)
                    if (!checked) {
                      setShowConsentDetails(true)
                    }
                    if (typeof window !== 'undefined') {
                      window.sessionStorage.setItem(
                        AI_CONSENT_STORAGE_KEY,
                        checked ? '1' : '0',
                      )
                    }
                    if (checked) {
                      setShowConsentDetails(false)
                    }
                  }}
                />
                <span>
                  {t('assistant.legal.consentPrefix')}{' '}
                  <Link to="/privacy">{t('footer.privacy')}</Link>,{' '}
                  <Link to="/terms">{t('footer.terms')}</Link>,{' '}
                  <Link to="/cookies">{t('footer.cookies')}</Link>.
                </span>
              </label>
              )}

          <form
            className="ai-assistant__form"
            onSubmit={(event) => {
              event.preventDefault()
              void sendMessage()
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              placeholder={t('assistant.inputPlaceholder')}
              rows={1}
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={
                isSending
                || input.trim().length === 0
                || !consentAccepted
              }
            >
              {t('assistant.send')}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  )
}

export default AiAssistantWidget
