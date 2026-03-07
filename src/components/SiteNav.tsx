import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'
import LinkButton from './LinkButton'
import { CloseIcon, MenuIcon } from './icons'

function SiteNav() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
  }, [pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMobileMenuOpen])

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
          </aside>
        </div>
      ) : null}
    </>
  )
}

export default SiteNav
