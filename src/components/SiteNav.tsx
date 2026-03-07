import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/language-context'
import { useTheme } from '../context/theme-context'
import { useI18n } from '../hooks/useI18n'
import LinkButton from './LinkButton'
import { CloseIcon, MenuIcon } from './icons'

function SiteNav() {
  const { t } = useI18n()
  const { language, setLanguage, languages } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { pathname } = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/catalog', label: t('nav.catalog') },
    { to: '/specialists', label: t('nav.specialists') },
    { to: '/pricing', label: t('nav.pricing') },
    { to: '/contacts', label: t('nav.contacts') },
    { to: '/faq', label: t('nav.faq') },
  ]

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsThemeModalOpen(false)
    setIsLanguageModalOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMobileMenuOpen && !isThemeModalOpen && !isLanguageModalOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsThemeModalOpen(false)
        setIsLanguageModalOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isLanguageModalOpen, isMobileMenuOpen, isThemeModalOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <header className="site-nav">
        <Link className="site-brand" to="/" aria-label={t('nav.homeAria')}>
          <img className="site-brand__logo" src="/logo_full.png" alt="Mira logo" />
        </Link>

        <nav className="site-nav__links" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'site-nav__link is-active' : 'site-nav__link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-nav__actions">
          <LinkButton className="site-nav__cta" to="/catalog" tone="primary" size="md">
            {t('nav.bookNow')}
          </LinkButton>
          <button
            type="button"
            className="site-nav__menu-toggle"
            aria-label={t('nav.openMenu')}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div
          className="site-nav__mobile-overlay"
          role="presentation"
          onClick={closeMobileMenu}
        >
          <aside
            className="site-nav__mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="site-nav__mobile-head">
              <button
                type="button"
                className="site-nav__mobile-close"
                aria-label={t('nav.closeMenu')}
                onClick={closeMobileMenu}
              >
                <CloseIcon size={20} aria-hidden="true" />
              </button>
            </div>

            <nav className="site-nav__mobile-links" aria-label="Main navigation">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    isActive
                      ? 'site-nav__mobile-link is-active'
                      : 'site-nav__mobile-link'
                  }
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="site-nav__mobile-preferences">
              <button
                className="site-footer__language-toggle"
                type="button"
                onClick={() => {
                  closeMobileMenu()
                  setIsThemeModalOpen(false)
                  setIsLanguageModalOpen(true)
                }}
                aria-label={t('footer.language.openModal')}
                aria-haspopup="dialog"
                aria-expanded={isLanguageModalOpen}
              >
                {t('footer.language.openModal')}
              </button>

              <button
                className="site-footer__theme-toggle"
                type="button"
                onClick={() => {
                  closeMobileMenu()
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
          </aside>
        </div>
      ) : null}

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
              <button
                type="button"
                className={
                  theme === 'mira-dark'
                    ? 'site-footer__theme-option is-active'
                    : 'site-footer__theme-option'
                }
                onClick={() => {
                  setTheme('mira-dark')
                  setIsThemeModalOpen(false)
                }}
              >
                {t('footer.theme.dark')}
              </button>
              <button
                type="button"
                className={
                  theme === 'mira-light'
                    ? 'site-footer__theme-option is-active'
                    : 'site-footer__theme-option'
                }
                onClick={() => {
                  setTheme('mira-light')
                  setIsThemeModalOpen(false)
                }}
              >
                {t('footer.theme.light')}
              </button>
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
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={
                    item.code === language
                      ? 'site-footer__theme-option is-active'
                      : 'site-footer__theme-option'
                  }
                  onClick={() => {
                    setLanguage(item.code)
                    setIsLanguageModalOpen(false)
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default SiteNav
