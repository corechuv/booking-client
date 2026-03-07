import { useCallback, useEffect, useState } from 'react'
import { fetchClientServices } from '../api/client-api'
import LinkButton from '../components/LinkButton'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { mapApiServicesToCatalog } from '../lib/service-catalog-api'
import '../styles/landing-page.scss'

function HomePage() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const [deals, setDeals] = useState<
    Array<{
      id: string
      title: string
      categoryName: string
      oldPrice?: string
      discountBadge?: string
      price: string
    }>
  >([])
  const experiences = [
    {
      title: t('home.exp.skin.title'),
      text: t('home.exp.skin.text'),
      note: t('home.exp.skin.note'),
    },
    {
      title: t('home.exp.hair.title'),
      text: t('home.exp.hair.text'),
      note: t('home.exp.hair.note'),
    },
    {
      title: t('home.exp.nail.title'),
      text: t('home.exp.nail.text'),
      note: t('home.exp.nail.note'),
    },
  ]
  const process = [
    { step: '01', title: t('home.step.1.title'), text: t('home.step.1.text') },
    { step: '02', title: t('home.step.2.title'), text: t('home.step.2.text') },
    { step: '03', title: t('home.step.3.title'), text: t('home.step.3.text') },
  ]
  const reviews = [
    {
      name: t('home.review.1.name'),
      focus: t('home.review.1.focus'),
      rating: t('home.review.1.rating'),
      text: t('home.review.1.text'),
    },
    {
      name: t('home.review.2.name'),
      focus: t('home.review.2.focus'),
      rating: t('home.review.2.rating'),
      text: t('home.review.2.text'),
    },
    {
      name: t('home.review.3.name'),
      focus: t('home.review.3.focus'),
      rating: t('home.review.3.rating'),
      text: t('home.review.3.text'),
    },
  ]

  const loadDeals = useCallback(async () => {
    try {
      const services = await fetchClientServices(language)
      const catalog = mapApiServicesToCatalog(services, language)
      const apiDeals = catalog
        .flatMap((category) =>
          category.services
            .filter((service) => service.discountBadge && service.oldPrice)
            .map((service) => ({
              ...service,
              categoryName: category.name,
            })),
        )
        .slice(0, 4)

      setDeals(apiDeals)
    } catch {
      setDeals([])
    }
  }, [language])

  useEffect(() => {
    void loadDeals()
  }, [loadDeals])

  return (
    <main className="landing-page">
      <div className="landing-page__content">
        <div className="landing-glow landing-glow--left" />
        <div className="landing-glow landing-glow--right" />

        <SiteNav />

        <section className="landing-hero">
          <div className="landing-hero__copy">
            <p className="landing-kicker">{t('home.kicker')}</p>
            <h1 className="landing-hero__title">
              {t('home.title').split('\n')[0]}
              <br />
              {t('home.title').split('\n')[1]}
            </h1>
            <p className="landing-hero__description">
              {t('home.description')}
            </p>
            <div className="landing-hero__cta">
              <LinkButton to="/booking" tone="primary" size="lg">
                {t('home.cta.booking')}
              </LinkButton>
              <LinkButton to="/catalog" size="lg">
                {t('home.cta.catalog')}
              </LinkButton>
            </div>
          </div>

          <ul className="landing-metrics" aria-label="Ключевые показатели">
            <li>
              <strong>4.9/5</strong>
              <span>{t('home.metric.rating')}</span>
            </li>
            <li>
              <strong>2 500+</strong>
              <span>{t('home.metric.bookings')}</span>
            </li>
            <li>
              <strong>24/7</strong>
              <span>{t('home.metric.availability')}</span>
            </li>
          </ul>
        </section>

        <section className="experience-grid" id="experiences">
          {experiences.map((item) => (
            <article key={item.title} className="experience-card">
              <p>{item.note}</p>
              <h2>{item.title}</h2>
              <span>{item.text}</span>
              <LinkButton to="/booking" size="lg">
                {t('home.experience.slot')}
              </LinkButton>
            </article>
          ))}
        </section>

        <section className="landing-discounts" id="offers">
          <div className="landing-discounts__head">
            <p>{t('home.offers.eyebrow')}</p>
            <h2>{t('home.offers.title')}</h2>
          </div>
          <div className="landing-discounts__grid">
            {deals.map((service) => (
              <article key={service.id} className="landing-discount-card">
                <span className="landing-discount-card__badge">
                  SALE {service.discountBadge}
                </span>
                <h3>{service.title}</h3>
                <p>{service.categoryName}</p>
                <div className="landing-discount-card__price">
                  <span>{service.oldPrice}</span>
                  <strong>{service.price}</strong>
                </div>
                <LinkButton to={`/booking?service=${service.id}`} size="lg">
                  {t('home.offers.book')}
                </LinkButton>
              </article>
            ))}
          </div>
        </section>

        <section className="process-section" id="process">
          <div className="process-section__head">
            <p>{t('home.process.eyebrow')}</p>
            <h2>{t('home.process.title')}</h2>
          </div>
          <div className="process-track">
            {process.map((item) => (
              <article key={item.step} className="process-item">
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="reviews-section" id="reviews">
          <div className="reviews-section__head">
            <p>{t('home.reviews.eyebrow')}</p>
            <h2>{t('home.reviews.title')}</h2>
          </div>
          <div className="reviews-grid">
            {reviews.map((review) => (
              <article key={review.name} className="review-card">
                <p className="review-card__rating">{review.rating}</p>
                <p className="review-card__text">{review.text}</p>
                <div className="review-card__meta">
                  <strong>{review.name}</strong>
                  <span>{review.focus}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <p>{t('home.final.eyebrow')}</p>
          <h2>{t('home.final.title')}</h2>
          <LinkButton to="/booking" tone="primary" size="lg">
            {t('home.final.button')}
          </LinkButton>
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}

export default HomePage
