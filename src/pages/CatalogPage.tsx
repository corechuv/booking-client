import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ApiError, fetchClientServices } from '../api/client-api'
import { CloseIcon } from '../components/icons'
import LinkButton from '../components/LinkButton'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { useLanguage } from '../context/language-context'
import { serviceCatalog } from '../data/service-catalog'
import { useI18n } from '../hooks/useI18n'
import { mapApiServicesToCatalog } from '../lib/service-catalog-api'
import '../styles/section-page.scss'
import '../styles/catalog-page.scss'

function CatalogPage() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const [catalog, setCatalog] = useState(serviceCatalog)
  const [activeCategoryId, setActiveCategoryId] = useState('')
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCatalog = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const services = await fetchClientServices(language)
      setCatalog(mapApiServicesToCatalog(services, language))
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(t('catalog.errorLoad', { message: requestError.message }))
      } else {
        setError(t('catalog.errorFallback'))
      }
      setCatalog(serviceCatalog)
    } finally {
      setIsLoading(false)
    }
  }, [language, t])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  useEffect(() => {
    if (catalog.length === 0) {
      setActiveCategoryId('')
      return
    }

    setActiveCategoryId((current) =>
      catalog.some((category) => category.id === current)
        ? current
        : catalog[0].id,
    )
  }, [catalog])

  useEffect(() => {
    if (!isCategoryMenuOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCategoryMenuOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isCategoryMenuOpen])

  const activeCategory = useMemo(
    () =>
      catalog.find((category) => category.id === activeCategoryId) ?? catalog[0],
    [activeCategoryId, catalog],
  )

  const categoryMenuModal =
    isCategoryMenuOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="catalog-page__mobile-overlay"
            role="presentation"
            onClick={() => setIsCategoryMenuOpen(false)}
          >
            <aside
              className="catalog-page__mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={t('catalog.categoriesTitle')}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="catalog-page__mobile-drawer-head">
                <strong>{t('catalog.categoriesTitle')}</strong>
                <button
                  type="button"
                  className="catalog-page__mobile-drawer-close"
                  onClick={() => setIsCategoryMenuOpen(false)}
                  aria-label={t('catalog.closeCategories')}
                >
                  <CloseIcon size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="catalog-page__mobile-categories">
                {catalog.map((category) => (
                  <button
                    key={category.id}
                    className={
                      category.id === activeCategory?.id
                        ? 'catalog-page__category is-active'
                        : 'catalog-page__category'
                    }
                    type="button"
                    onClick={() => {
                      setActiveCategoryId(category.id)
                      setIsCategoryMenuOpen(false)
                    }}
                  >
                    <strong>{category.name}</strong>
                    <span>
                      {t('catalog.servicesCount', {
                        count: category.services.length,
                      })}
                    </span>
                  </button>
                ))}
              </div>
            </aside>
          </div>,
          document.body,
        )
      : null

  return (
    <main className="section-page catalog-page">
      <div className="section-page__glow section-page__glow--left" />
      <div className="section-page__glow section-page__glow--right" />

      <SiteNav />

      <SectionPageHero
        eyebrow={t('catalog.hero.eyebrow')}
        title={t('catalog.hero.title')}
        description={t('catalog.hero.description')}
        actions={
          <>
            <LinkButton to="/booking" tone="primary">
              {t('common.toBooking')}
            </LinkButton>
            <LinkButton to="/pricing">{t('catalog.hero.pricing')}</LinkButton>
          </>
        }
      />

      <section className="catalog-page__layout">
        <button
          type="button"
          className="catalog-page__categories-toggle"
          onClick={() => setIsCategoryMenuOpen(true)}
          aria-label={t('catalog.openCategories')}
        >
          {t('catalog.openCategories')}
        </button>

        {error ? (
          <div className="catalog-page__notice catalog-page__notice--error">
            <p>{error}</p>
            <button
              className="catalog-page__retry"
              type="button"
              onClick={() => void loadCatalog()}
            >
              Повторить загрузку
            </button>
          </div>
        ) : null}

        <aside className="catalog-page__categories">
          {catalog.map((category) => (
            <button
              key={category.id}
              className={
                category.id === activeCategory?.id
                  ? 'catalog-page__category is-active'
                  : 'catalog-page__category'
              }
              type="button"
              onClick={() => setActiveCategoryId(category.id)}
            >
              <strong>{category.name}</strong>
              <span>{t('catalog.servicesCount', { count: category.services.length })}</span>
            </button>
          ))}
        </aside>

        <section className="catalog-page__services" key={activeCategory?.id}>
          {isLoading ? (
            <p className="catalog-page__notice">{t('catalog.loading')}</p>
          ) : null}

          <h2>{activeCategory?.name}</h2>
          <p>{activeCategory?.summary}</p>

          <ul className="catalog-page__service-list">
            {activeCategory?.services.map((service, index) => (
              <li
                key={service.id}
                className="catalog-page__service-item"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div>
                  <div className="catalog-page__service-head">
                    <h3>{service.title}</h3>
                    {service.discountBadge ? (
                      <span className="catalog-page__sale-badge">
                        {t('catalog.sale', { value: service.discountBadge })}
                      </span>
                    ) : null}
                  </div>
                  <p>{service.description}</p>
                  <div className="catalog-page__service-meta">
                    <span>{service.duration}</span>
                    <div className="catalog-page__price">
                      {service.oldPrice ? (
                        <span className="catalog-page__price-old">
                          {service.oldPrice}
                        </span>
                      ) : null}
                      <strong>{service.price}</strong>
                    </div>
                  </div>
                </div>
                <LinkButton
                  className="catalog-page__service-link"
                  to={`/booking?service=${service.id}`}
                  tone="primary"
                  size="sm"
                >
                  {t('catalog.toBooking')}
                </LinkButton>
              </li>
            ))}
          </ul>

          {!activeCategory?.services.length && !isLoading ? (
            <p className="catalog-page__notice">{t('catalog.empty')}</p>
          ) : null}
        </section>

      </section>

      {categoryMenuModal}

      <SiteFooter />
    </main>
  )
}

export default CatalogPage
