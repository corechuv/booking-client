import { useCallback, useEffect, useState } from 'react'
import { fetchClientServices } from '../api/client-api'
import LinkButton from '../components/LinkButton'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { serviceCatalog } from '../data/service-catalog'
import { mapApiServicesToCatalog } from '../lib/service-catalog-api'
import '../styles/section-page.scss'

const fallbackPriceList = serviceCatalog.flatMap((category) =>
  category.services.map((service) => ({
    service: `${category.name} · ${service.title}`,
    price: service.price,
    duration: service.duration,
  })),
)

function PricingPage() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const [priceList, setPriceList] = useState(fallbackPriceList)
  const packages = [
    {
      type: t('pricing.pack.starterType'),
      title: t('pricing.pack.starterTitle'),
      text: t('pricing.pack.starterText'),
      price: '€78',
    },
    {
      type: t('pricing.pack.signatureType'),
      title: t('pricing.pack.signatureTitle'),
      text: t('pricing.pack.signatureText'),
      price: '€155',
    },
    {
      type: t('pricing.pack.premiumType'),
      title: t('pricing.pack.premiumTitle'),
      text: t('pricing.pack.premiumText'),
      price: '€210',
    },
  ]

  const loadPriceList = useCallback(async () => {
    try {
      const services = await fetchClientServices(language)
      const catalog = mapApiServicesToCatalog(services, language)
      const apiPriceList = catalog.flatMap((category) =>
        category.services.map((service) => ({
          service: `${category.name} · ${service.title}`,
          price: service.price,
          duration: service.duration,
        })),
      )
      setPriceList(apiPriceList.length ? apiPriceList : fallbackPriceList)
    } catch {
      setPriceList(fallbackPriceList)
    }
  }, [language])

  useEffect(() => {
    void loadPriceList()
  }, [loadPriceList])

  return (
    <main className="section-page">
      <div className="section-page__glow section-page__glow--left" />
      <div className="section-page__glow section-page__glow--right" />

      <SiteNav />

      <SectionPageHero
        eyebrow={t('pricing.hero.eyebrow')}
        title={t('pricing.hero.title')}
        description={t('pricing.hero.description')}
        actions={
          <>
            <LinkButton to="/booking" tone="primary">
              {t('pricing.hero.book')}
            </LinkButton>
            <LinkButton to="/catalog">{t('pricing.hero.catalog')}</LinkButton>
          </>
        }
      />

      <section className="section-page__grid section-page__grid--3">
        {packages.map((item) => (
          <article className="section-card" key={item.title}>
            <p className="section-card__meta">{item.type}</p>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            <div className="section-card__row">
              <span>{t('pricing.bundle')}</span>
              <strong>{item.price}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="section-page__strip">
        <div className="section-page__strip-head">
          <h2>{t('pricing.baseTitle')}</h2>
          <p>{t('pricing.baseDescription')}</p>
        </div>
        <ul className="section-list">
          {priceList.map((item) => (
            <li key={item.service}>
              <span>
                {item.service} · {item.duration}
              </span>
              <strong>{item.price}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-page__cta">
        <div>
          <h2>{t('pricing.cta.title')}</h2>
          <p>{t('pricing.cta.text')}</p>
        </div>
        <div className="section-page__cta-actions">
          <LinkButton to="/booking" tone="primary">
            {t('pricing.cta.booking')}
          </LinkButton>
          <LinkButton to="/contacts">{t('pricing.cta.contacts')}</LinkButton>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

export default PricingPage
