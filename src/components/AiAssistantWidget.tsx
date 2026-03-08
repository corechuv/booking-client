import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ApiError,
  chatWithAssistant,
  type AssistantHistoryItem,
} from '../api/client-api'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { lockBodyScroll, unlockBodyScroll } from '../lib/body-scroll-lock'
import { CloseIcon } from './icons'

type ChatMessage = AssistantHistoryItem & {
  id: string
}

const AI_CONSENT_STORAGE_KEY = 'mira-ai-consent-v1'
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const PHONE_RE = /(?:\+?\d[\d()\-\s]{6,}\d)/
const IBAN_RE = /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/i
const CARD_RE = /\b(?:\d[ -]*?){13,19}\b/

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

  const openAssistant = () => {
    setIsOpen(true)
    setErrorText(null)
    setMessages((prev) => (prev.length ? prev : [starterMessage]))
  }

  const closeAssistant = () => {
    setIsOpen(false)
    setErrorText(null)
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
        setErrorText(requestError.message)
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
          className="ai-assistant__toggle"
          aria-label={t('assistant.open')}
          onClick={openAssistant}
        >
          AI
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
              <article
                key={item.id}
                className={
                  item.role === 'user'
                    ? 'ai-assistant__bubble is-user'
                    : 'ai-assistant__bubble is-assistant'
                }
              >
                {item.content}
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
          <label className="ai-assistant__consent">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(event) => {
                const checked = event.currentTarget.checked
                setConsentAccepted(checked)
                if (typeof window !== 'undefined') {
                  window.sessionStorage.setItem(
                    AI_CONSENT_STORAGE_KEY,
                    checked ? '1' : '0',
                  )
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
