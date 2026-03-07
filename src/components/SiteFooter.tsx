import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { useTheme } from '../context/theme-context'
import { usePublicContact } from '../hooks/usePublicContact'
import { lockBodyScroll, unlockBodyScroll } from '../lib/body-scroll-lock'
import { CloseIcon } from './icons'

function SiteFooter() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, languages } = useLanguage()
  const { t } = useI18n()
  const { contact } = usePublicContact()
  const year = new Date().getFullYear()
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
  const themeOptions = useMemo(
    () => [
      { value: 'mira-dark' as const, label: t('footer.theme.dark') },
      { value: 'mira-light' as const, label: t('footer.theme.light') },
    ],
    [t],
  )
  const languageOptions = useMemo(
    () =>
      languages.map((item) => ({
        value: item.code,
        label: item.name,
      })),
    [languages],
  )
  const footerLinks = [
    { to: '/catalog', label: t('nav.catalog') },
    { to: '/specialists', label: t('nav.specialists') },
    { to: '/pricing', label: t('nav.pricing') },
    { to: '/contacts', label: t('nav.contacts') },
    { to: '/faq', label: t('nav.faq') },
    { to: '/catalog', label: t('footer.booking') },
  ]
  const legalLinks = [
    { to: '/impressum', label: t('footer.impressum') },
    { to: '/privacy', label: t('footer.privacy') },
    { to: '/terms', label: t('footer.terms') },
    { to: '/cookies', label: t('footer.cookies') },
  ]

  useEffect(() => {
    if (!isThemeModalOpen && !isLanguageModalOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsThemeModalOpen(false)
        setIsLanguageModalOpen(false)
      }
    }

    lockBodyScroll()
    window.addEventListener('keydown', onKeyDown)
    return () => {
      unlockBodyScroll()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isThemeModalOpen, isLanguageModalOpen])

  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <nav className="site-footer__links" aria-label="Footer navigation">
          {footerLinks.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="site-footer__meta">
        <div className="site-footer__meta-item">
          <span>{t('footer.address')}</span>
          <strong>{contact.address}</strong>
        </div>
        <div className="site-footer__meta-item">
          <span>{t('footer.phone')}</span>
          <strong>{contact.phone}</strong>
        </div>
        <div className="site-footer__meta-item site-footer__meta-item--theme">
          <div className="site-footer__preferences">
            <button
              className="site-footer__language-toggle"
              type="button"
              onClick={() => {
                setIsThemeModalOpen(false)
                setIsLanguageModalOpen(true)
              }}
              aria-label={t('footer.language.openModal')}
              aria-haspopup="dialog"
              aria-expanded={isLanguageModalOpen}
            >
              {t('footer.language')}
            </button>

            <button
              className="site-footer__theme-toggle"
              type="button"
              onClick={() => {
                setIsLanguageModalOpen(false)
                setIsThemeModalOpen(true)
              }}
              aria-label={t('footer.theme.openModal')}
              aria-haspopup="dialog"
              aria-expanded={isThemeModalOpen}
            >
              {t('footer.theme.openModal')}
            </button>
          </div>
        </div>
      </div>

      {isThemeModalOpen ? (
        <div
          className="site-footer__theme-modal-overlay"
          role="presentation"
          onClick={() => setIsThemeModalOpen(false)}
        >
          <div
            className="site-footer__theme-modal"
            role="dialog"
            aria-modal="true"
            aria-label={t('footer.theme.modalTitle')}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="site-footer__theme-modal-head">
              <strong>{t('footer.theme.modalTitle')}</strong>
              <button
                type="button"
                className="site-footer__theme-modal-close"
                onClick={() => setIsThemeModalOpen(false)}
                aria-label={t('footer.theme.closeModal')}
              >
                <CloseIcon size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="site-footer__theme-modal-list">
              {themeOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={
                    item.value === theme
                      ? 'site-footer__theme-option is-active'
                      : 'site-footer__theme-option'
                  }
                  onClick={() => {
                    setTheme(item.value)
                    setIsThemeModalOpen(false)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isLanguageModalOpen ? (
        <div
          className="site-footer__theme-modal-overlay"
          role="presentation"
          onClick={() => setIsLanguageModalOpen(false)}
        >
          <div
            className="site-footer__theme-modal"
            role="dialog"
            aria-modal="true"
            aria-label={t('footer.language.modalTitle')}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="site-footer__theme-modal-head">
              <strong>{t('footer.language.modalTitle')}</strong>
              <button
                type="button"
                className="site-footer__theme-modal-close"
                onClick={() => setIsLanguageModalOpen(false)}
                aria-label={t('footer.language.closeModal')}
              >
                <CloseIcon size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="site-footer__theme-modal-list">
              {languageOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={
                    item.value === language
                      ? 'site-footer__theme-option is-active'
                      : 'site-footer__theme-option'
                  }
                  onClick={() => {
                    setLanguage(item.value)
                    setIsLanguageModalOpen(false)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="site-footer__bottom">
        <span className="site-footer__copyright">
          {`© ${year} ${contact.salon_name}`}
        </span>
        <nav className="site-footer__legal" aria-label="Legal navigation">
          {legalLinks.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default SiteFooter
