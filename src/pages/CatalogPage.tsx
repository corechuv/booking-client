import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
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
import { SALON_CITY, SALON_NAME } from '../config/salon'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { useSeo } from '../hooks/useSeo'
import { extractCategoryNumericId } from '../lib/category-slug'
import { localizePath } from '../lib/i18n-routing'
import { mapApiServicesToCatalog } from '../lib/service-catalog-api'
import '../styles/section-page.scss'
import '../styles/catalog-page.scss'

const parseEuroAmount = (value: string): number | null => {
  const normalized = value.replace(/[^\d,.]/g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function CatalogPage() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
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
  const [pendingScrollToServicesTop, setPendingScrollToServicesTop] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const servicesSectionRef = useRef<HTMLElement | null>(null)

  const scrollServicesStartBelowHeader = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    const section = servicesSectionRef.current
    if (!section) {
      return
    }

    const nav = document.querySelector<HTMLElement>('.site-nav')
    const headerOffset = (nav?.getBoundingClientRect().height ?? 0) + 10
    const sectionTop = section.getBoundingClientRect().top + window.scrollY
    const targetTop = Math.max(sectionTop - headerOffset, 0)

    window.scrollTo({
      top: targetTop,
      behavior: 'auto',
    })
  }, [])

  const serviceIdFromQuery = useMemo(() => {
    const value = searchParams.get('service')?.trim()
    return value ? value : null
  }, [searchParams])
  const categoryIdFromQuery = useMemo(() => {
    const value = searchParams.get('category')?.trim()
    return value ? value : null
  }, [searchParams])
  const categoryIdFromPath = useMemo(() => {
    const value = categorySlug?.trim()
    return value ? value : null
  }, [categorySlug])

  const resolveCategoryId = useCallback(
    (value: string | null): string | null => {
      if (!value || !catalog.length) {
        return null
      }

      const exact = catalog.find((category) => category.id === value)
      if (exact) {
        return exact.id
      }

      const numericId = extractCategoryNumericId(value)
      if (numericId === null) {
        return null
      }

      const byNumericId = catalog.find(
        (category) => extractCategoryNumericId(category.id) === numericId,
      )
      return byNumericId?.id ?? null
    },
    [catalog],
  )

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
  const resolvedCategoryIdFromPath = useMemo(
    () => resolveCategoryId(categoryIdFromPath),
    [categoryIdFromPath, resolveCategoryId],
  )

  useEffect(() => {
    if (!catalog.length || categoryIdFromPath === null) {
      return
    }

    if (!resolvedCategoryIdFromPath) {
      return
    }

    setActiveCategoryId(resolvedCategoryIdFromPath)
    if (isMobileCatalog) {
      setMobileView('services')
      setPendingScrollToServicesTop(true)
    }
  }, [catalog, categoryIdFromPath, isMobileCatalog, resolvedCategoryIdFromPath])

  useEffect(() => {
    if (!catalog.length || categoryIdFromQuery === null) {
      return
    }

    const resolvedCategoryId = resolveCategoryId(categoryIdFromQuery)
    if (!resolvedCategoryId) {
      return
    }

    setActiveCategoryId(resolvedCategoryId)
    if (isMobileCatalog) {
      setMobileView('services')
      setPendingScrollToServicesTop(true)
    }
  }, [catalog, categoryIdFromQuery, isMobileCatalog, resolveCategoryId])

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

  useEffect(() => {
    if (!pendingScrollToServicesTop) {
      return
    }

    if (isMobileCatalog && mobileView !== 'services') {
      return
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollServicesStartBelowHeader()
      })
    })
    setPendingScrollToServicesTop(false)
  }, [isMobileCatalog, mobileView, pendingScrollToServicesTop, scrollServicesStartBelowHeader])

  const showCategories = !isMobileCatalog || mobileView === 'categories'
  const showServices = !isMobileCatalog || mobileView === 'services'
  const flatServices = useMemo(
    () =>
      catalog.flatMap((category) =>
        category.services.map((service) => ({
          categoryId: category.id,
          categoryName: category.name,
          ...service,
        })),
      ),
    [catalog],
  )
  const activeCategoryServices = activeCategory?.services ?? []
  const isCategorySeoPage = Boolean(
    resolvedCategoryIdFromPath &&
      activeCategory &&
      activeCategory.id === resolvedCategoryIdFromPath,
  )
  const seoPath =
    isCategorySeoPage && activeCategory ? `/catalog/${activeCategory.id}` : '/catalog'

  const seoDescription = useMemo(() => {
    if (isCategorySeoPage && activeCategory) {
      if (!activeCategoryServices.length) {
        return `${activeCategory.summary} ${SALON_NAME} ${SALON_CITY}.`
      }
      const featured = activeCategoryServices
        .slice(0, 5)
        .map((item) => item.title)
        .join(', ')
      return `${activeCategory.summary} ${t('catalog.servicesCount', {
        count: activeCategoryServices.length,
      })}. ${featured}. ${SALON_NAME} ${SALON_CITY}.`
    }
    if (!flatServices.length) {
      return t('catalog.hero.description')
    }
    const featured = flatServices.slice(0, 6).map((item) => item.title).join(', ')
    return `${t('catalog.hero.description')} ${featured}.`
  }, [activeCategory, activeCategoryServices, flatServices, isCategorySeoPage, t])

  const seoTitle = isCategorySeoPage && activeCategory
    ? `${activeCategory.name} | ${t('catalog.hero.title')} | ${SALON_NAME}`
    : `${t('catalog.hero.title')} | ${SALON_NAME}`

  const categorySeoKeywords = useMemo(
    () =>
      catalog.flatMap((item) => [
        item.name,
        `${item.name} ${SALON_CITY}`,
        `${item.name} ${SALON_NAME}`,
      ]),
    [catalog],
  )

  const catalogJsonLd = useMemo(() => {
    const sourceServices = isCategorySeoPage
      ? activeCategoryServices.map((service) => ({
          ...service,
          categoryName: activeCategory?.name ?? '',
        }))
      : flatServices

    if (!sourceServices.length) {
      if (!catalog.length) {
        return undefined
      }

      return {
        '@type': 'ItemList',
        name: t('catalog.hero.title'),
        numberOfItems: catalog.length,
        itemListElement: catalog.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Thing',
            name: item.name,
            description: item.summary,
          },
        })),
      }
    }

    return {
      '@type': 'ItemList',
      name: isCategorySeoPage && activeCategory ? activeCategory.name : t('catalog.hero.title'),
      numberOfItems: sourceServices.length,
      itemListElement: sourceServices.slice(0, 40).map((item, index) => {
        const priceValue = parseEuroAmount(item.price)
        const serviceObject: Record<string, unknown> = {
          '@type': 'Service',
          name: item.title,
          category: item.categoryName,
          description: item.description,
        }

        if (priceValue !== null) {
          serviceObject.offers = {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: priceValue.toFixed(2),
            availability: 'https://schema.org/InStock',
          }
        }

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: serviceObject,
        }
      }),
    }
  }, [activeCategory, activeCategoryServices, catalog, flatServices, isCategorySeoPage, t])

  useSeo({
    path: seoPath,
    title: seoTitle,
    description: seoDescription,
    keywords: [
      SALON_NAME,
      SALON_CITY,
      t('nav.catalog'),
      t('catalog.hero.title'),
      ...categorySeoKeywords,
      ...(isCategorySeoPage ? activeCategoryServices : flatServices)
        .slice(0, 20)
        .map((item) => item.title),
    ],
    jsonLd: catalogJsonLd,
  })

  const openCategory = useCallback(
    (nextCategoryId: string) => {
      setActiveCategoryId(nextCategoryId)

      const nextPath = localizePath(`/catalog/${nextCategoryId}`, language)
      if (`${location.pathname}${location.search}` !== nextPath) {
        navigate(nextPath, { replace: true })
      }

      if (isMobileCatalog) {
        setMobileView('services')
        setPendingScrollToServicesTop(true)
      }
    },
    [isMobileCatalog, language, location.pathname, location.search, navigate],
  )

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
              onClick={() => openCategory(category.id)}
            >
              <strong>{category.name}</strong>
              <span>{t('catalog.servicesCount', { count: category.services.length })}</span>
            </button>
          ))}
        </aside>

        <section
          ref={servicesSectionRef}
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
