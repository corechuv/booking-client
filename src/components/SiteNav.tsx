import { Link, NavLink } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'
import LinkButton from './LinkButton'

function SiteNav() {
  const { t } = useI18n()
  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/catalog', label: t('nav.catalog') },
    { to: '/specialists', label: t('nav.specialists') },
    { to: '/pricing', label: t('nav.pricing') },
    { to: '/contacts', label: t('nav.contacts') },
    { to: '/faq', label: t('nav.faq') },
  ]

  return (
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
      </div>
    </header>
  )
}

export default SiteNav
