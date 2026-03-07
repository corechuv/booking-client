import { useCallback, useEffect, useState } from 'react'
import { ApiError, fetchPublicFaqs } from '../api/client-api'
import FaqAccordion from '../components/FaqAccordion'
import LinkButton from '../components/LinkButton'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import '../styles/section-page.scss'

const getErrorText = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  return 'Failed to load FAQ.'
}

function FaqPage() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const [items, setItems] = useState<
    Array<{ id: string; question: string; answer: string }>
  >([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadFaq = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const apiFaqs = await fetchPublicFaqs(language)
      setItems(
        apiFaqs.map((item) => ({
          id: String(item.id),
          question: item.question,
          answer: item.answer,
        })),
      )
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(getErrorText(requestError))
      } else {
        setError(t('faq.errorFallback'))
      }
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [language, t])

  useEffect(() => {
    void loadFaq()
  }, [loadFaq])

  return (
    <main className="section-page faq-page">
      <div className="section-page__glow section-page__glow--left" />
      <div className="section-page__glow section-page__glow--right" />

      <SiteNav />

      <SectionPageHero
        eyebrow={t('faq.hero.eyebrow')}
        title={t('faq.hero.title')}
        description={t('faq.hero.description')}
        actions={
          <>
            <LinkButton to="/catalog" tone="primary">
              {t('faq.hero.toBooking')}
            </LinkButton>
            <LinkButton to="/contacts">{t('faq.hero.toContacts')}</LinkButton>
          </>
        }
      />

      <section className="section-page__strip">
        <div className="section-page__strip-head">
          <h2>{t('faq.title')}</h2>
        </div>
        {error ? <p className="section-page__notice section-page__notice--error">{error}</p> : null}
        {isLoading ? <p className="section-page__notice">{t('faq.loading')}</p> : null}
        <FaqAccordion items={items} defaultOpenCount={2} />
      </section>

      <section className="section-page__cta">
        <div>
          <h2>{t('faq.cta.title')}</h2>
          <p>{t('faq.cta.text')}</p>
        </div>
        <div className="section-page__cta-actions">
          <LinkButton to="/catalog" tone="primary">
            {t('faq.cta.toBooking')}
          </LinkButton>
          <LinkButton to="/contacts">{t('faq.cta.toContacts')}</LinkButton>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

export default FaqPage
