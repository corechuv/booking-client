import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  type ClientCategory,
  ApiError,
  fetchClientCategories,
  fetchClientServices,
} from '../api/client-api'
import LinkButton from '../components/LinkButton'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { mapApiServicesToCatalog } from '../lib/service-catalog-api'
import '../styles/section-page.scss'
import '../styles/catalog-page.scss'

function CatalogPage() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const getIsMobileCatalog = () =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 900px)').matches
      : false

  const [catalog, setCatalog] = useState<ReturnType<typeof mapApiServicesToCatalog>>([])
  const [activeCategoryId, setActiveCategoryId] = useState('')
  const [isMobileCatalog, setIsMobileCatalog] = useState(getIsMobileCatalog)
  const [mobileView, setMobileView] = useState<'categories' | 'services'>(
    getIsMobileCatalog() ? 'categories' : 'services',
  )
  const [pendingFocusServiceId, setPendingFocusServiceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const serviceIdFromQuery = useMemo(() => {
    const value = searchParams.get('service')?.trim()
    return value ? value : null
  }, [searchParams])

  const loadCatalog = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const services = await fetchClientServices(language)
      let categories: ClientCategory[] = []
      try {
        categories = await fetchClientCategories(language)
      } catch {
        categories = []
      }
      setCatalog(mapApiServicesToCatalog(services, language, categories))
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(t('catalog.errorLoad', { message: requestError.message }))
      } else {
        setError(t('catalog.errorFallback'))
      }
      setCatalog([])
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
    if (typeof window === 'undefined') {
      return
    }

    const query = window.matchMedia('(max-width: 900px)')
    const updateLayoutMode = (matches: boolean) => {
      setIsMobileCatalog(matches)
      setMobileView(matches ? 'categories' : 'services')
    }

    updateLayoutMode(query.matches)
    const onChange = (event: MediaQueryListEvent) => {
      updateLayoutMode(event.matches)
    }

    query.addEventListener('change', onChange)
    return () => {
      query.removeEventListener('change', onChange)
    }
  }, [])

  const activeCategory = useMemo(
    () =>
      catalog.find((category) => category.id === activeCategoryId) ?? catalog[0],
    [activeCategoryId, catalog],
  )

  useEffect(() => {
    if (!catalog.length || serviceIdFromQuery === null) {
      return
    }

    const categoryWithService = catalog.find((category) =>
      category.services.some((service) => service.id === serviceIdFromQuery),
    )
    if (!categoryWithService) {
      return
    }

    setActiveCategoryId(categoryWithService.id)
    if (isMobileCatalog) {
      setMobileView('services')
    }
    setPendingFocusServiceId(serviceIdFromQuery)
  }, [catalog, isMobileCatalog, serviceIdFromQuery])

  useEffect(() => {
    if (pendingFocusServiceId === null) {
      return
    }

    if (isMobileCatalog && mobileView !== 'services') {
      return
    }

    const element = document.getElementById(
      `catalog-service-${pendingFocusServiceId}`,
    )
    if (!element) {
      return
    }

    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    setPendingFocusServiceId(null)
  }, [isMobileCatalog, mobileView, pendingFocusServiceId])

  const showCategories = !isMobileCatalog || mobileView === 'categories'
  const showServices = !isMobileCatalog || mobileView === 'services'

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
            <LinkButton to="/pricing" tone="primary">
              {t('catalog.hero.pricing')}
            </LinkButton>
            <LinkButton to="/contacts">{t('nav.contacts')}</LinkButton>
          </>
        }
      />

      <section className="catalog-page__layout">
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

        <aside
          className={
            showCategories
              ? 'catalog-page__categories is-visible'
              : 'catalog-page__categories'
          }
        >
          {isLoading && isMobileCatalog ? (
            <p className="catalog-page__notice">{t('catalog.loading')}</p>
          ) : null}

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
                if (isMobileCatalog) {
                  setMobileView('services')
                }
              }}
            >
              <strong>{category.name}</strong>
              <span>{t('catalog.servicesCount', { count: category.services.length })}</span>
            </button>
          ))}
        </aside>

        <section
          className={
            showServices ? 'catalog-page__services is-visible' : 'catalog-page__services'
          }
          key={activeCategory?.id}
        >
          {isMobileCatalog ? (
            <button
              type="button"
              className="catalog-page__back-to-categories link-button link-button--secondary link-button--md"
              onClick={() => setMobileView('categories')}
            >
              {t('catalog.backToCategories')}
            </button>
          ) : null}

          {isLoading ? (
            <p className="catalog-page__notice">{t('catalog.loading')}</p>
          ) : null}

          <h2>{activeCategory?.name}</h2>
          <p>{activeCategory?.summary}</p>

          <ul className="catalog-page__service-list">
            {activeCategory?.services.map((service, index) => (
              <li
                key={service.id}
                id={`catalog-service-${service.id}`}
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
                  size="lg"
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

      <SiteFooter />
    </main>
  )
}

export default CatalogPage
