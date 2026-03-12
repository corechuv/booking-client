import { type CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ApiError,
  fetchClientCategories,
  fetchClientServices,
} from '../api/client-api'
import LinkButton from '../components/LinkButton'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { AI_ASSISTANT_OPEN_EVENT } from '../constants/assistant'
import { SALON_NAME } from '../config/salon'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { useSeo } from '../hooks/useSeo'
import { mapApiServicesToCatalog } from '../lib/service-catalog-api'
import '../styles/section-page.scss'
import '../styles/inspiration-page.scss'

type InspirationCard = {
  id: string
  image: string
  kicker: string
  title: string
  text: string
  cta: string
  to: string
}

const BANNER_IMAGES = ['/banners/IMG_1.png', '/banners/IMG_2.png', '/banners/IMG_3.png']

function InspirationPage() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const [cards, setCards] = useState<InspirationCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fallbackCards = useMemo<InspirationCard[]>(
    () => [
      {
        id: 'banner-fallback-1',
        image: BANNER_IMAGES[0],
        kicker: t('inspiration.card.1.kicker'),
        title: t('inspiration.card.1.title'),
        text: t('inspiration.card.1.text'),
        cta: t('inspiration.card.1.cta'),
        to: '/catalog',
      },
      {
        id: 'banner-fallback-2',
        image: BANNER_IMAGES[1],
        kicker: t('inspiration.card.2.kicker'),
        title: t('inspiration.card.2.title'),
        text: t('inspiration.card.2.text'),
        cta: t('inspiration.card.2.cta'),
        to: '/catalog',
      },
      {
        id: 'banner-fallback-3',
        image: BANNER_IMAGES[2],
        kicker: t('inspiration.card.3.kicker'),
        title: t('inspiration.card.3.title'),
        text: t('inspiration.card.3.text'),
        cta: t('inspiration.card.3.cta'),
        to: '/booking',
      },
    ],
    [t],
  )

  const getErrorText = useCallback(
    (requestError: unknown): string => {
      if (requestError instanceof ApiError) {
        return requestError.message
      }
      return t('inspiration.errorFallback')
    },
    [t],
  )

  const loadCatalogHighlights = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [services, categories] = await Promise.all([
        fetchClientServices(language),
        fetchClientCategories(language),
      ])
      const catalog = mapApiServicesToCatalog(services, language, categories)
      const sourceCategories = catalog

      if (!sourceCategories.length) {
        setCards(fallbackCards)
        return
      }

      const selectedCategories = BANNER_IMAGES.map(
        (_, index) => sourceCategories[index] ?? sourceCategories[index % sourceCategories.length],
      )

      const dynamicCards = selectedCategories.map((category, index) => {
        const featuredService =
          category.services.find((service) => Boolean(service.discountBadge) || service.popular) ??
          category.services[0]
        const serviceMeta = featuredService
          ? `${featuredService.duration} · ${featuredService.price}`
          : ''
        const text = serviceMeta
          ? `${category.summary} ${serviceMeta}`
          : category.summary

        return {
          id: `banner-${category.id}-${index}`,
          image: BANNER_IMAGES[index] ?? BANNER_IMAGES[0],
          kicker: category.name,
          title: featuredService?.title ?? category.name,
          text,
          cta: t('inspiration.card.openFromCatalog'),
          to: featuredService
            ? `/catalog?service=${featuredService.id}`
            : `/catalog?category=${encodeURIComponent(category.id)}`,
        }
      })

      setCards(dynamicCards)
    } catch (requestError) {
      setCards(fallbackCards)
      setError(getErrorText(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [fallbackCards, getErrorText, language, t])

  useEffect(() => {
    void loadCatalogHighlights()
  }, [loadCatalogHighlights])

  const aiFeatureItems = [
    t('inspiration.ai.item.1'),
    t('inspiration.ai.item.2'),
    t('inspiration.ai.item.3'),
  ]

  useSeo({
    path: '/inspiration',
    title: `${t('inspiration.hero.title')} | ${SALON_NAME}`,
    description: t('inspiration.hero.description'),
    keywords: [
      SALON_NAME,
      t('nav.inspiration'),
      t('inspiration.hero.title'),
      ...cards.map((item) => item.title),
    ],
  })

  return (
    <main className="section-page inspiration-page">
      <div className="section-page__glow section-page__glow--left" />
      <div className="section-page__glow section-page__glow--right" />

      <SiteNav />

      <SectionPageHero
        eyebrow={t('inspiration.hero.eyebrow')}
        title={t('inspiration.hero.title')}
        description={t('inspiration.hero.description')}
        actions={
          <>
            <LinkButton to="/catalog" tone="primary" size="lg">
              {t('inspiration.hero.catalog')}
            </LinkButton>
            <LinkButton to="/booking" size="lg">
              {t('inspiration.hero.booking')}
            </LinkButton>
          </>
        }
      />

      <section className="inspiration-page__grid">
        {error ? (
          <p className="section-page__notice section-page__notice--error">
            {t('inspiration.errorLoad', { message: error })}
          </p>
        ) : null}
        {isLoading ? <p className="section-page__notice">{t('inspiration.loading')}</p> : null}
        {cards.map((card) => (
          <article
            key={card.id}
            className="inspiration-banner-card"
            style={{ '--banner-image': `url(${card.image})` } as CSSProperties}
          >
            <div className="inspiration-banner-card__content">
              <p className="inspiration-banner-card__kicker">{card.kicker}</p>
              <h2>{card.title}</h2>
              <p>{card.text}</p>
              <LinkButton to={card.to} tone="primary" size="lg">
                {card.cta}
              </LinkButton>
            </div>
          </article>
        ))}
      </section>

      <section className="inspiration-page__ai">
        <div className="inspiration-page__ai-head">
          <p className="inspiration-page__ai-kicker">{t('inspiration.ai.kicker')}</p>
          <h2>{t('inspiration.ai.title')}</h2>
          <p>{t('inspiration.ai.text')}</p>
        </div>

        <ul className="inspiration-page__ai-list">
          {aiFeatureItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="inspiration-page__ai-actions">
          <button
            type="button"
            className="link-button link-button--primary link-button--lg"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event(AI_ASSISTANT_OPEN_EVENT))
              }
            }}
          >
            {t('inspiration.ai.open')}
          </button>
          <LinkButton to="/faq" size="lg">
            {t('inspiration.ai.faq')}
          </LinkButton>
        </div>
      </section>

      <section className="section-page__cta inspiration-page__cta">
        <div>
          <h2>{t('inspiration.cta.title')}</h2>
          <p>{t('inspiration.cta.text')}</p>
        </div>
        <div className="section-page__cta-actions">
          <LinkButton to="/catalog" tone="primary" size="lg">
            {t('inspiration.cta.button')}
          </LinkButton>
          <LinkButton to="/contacts" size="lg">
            {t('nav.contacts')}
          </LinkButton>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

export default InspirationPage
