import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ApiError,
  fetchPublicCertificates,
  fetchPublicContact,
  fetchPublicFaqs,
  fetchPublicGeneralHours,
} from '../api/client-api'
import CertificatesGrid from '../components/CertificatesGrid'
import FaqAccordion from '../components/FaqAccordion'
import LinkButton from '../components/LinkButton'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import '../styles/section-page.scss'

const getErrorText = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  return fallback
}

function ContactsPage() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const dayNames = useMemo(
    () => [
      t('weekday.mon'),
      t('weekday.tue'),
      t('weekday.wed'),
      t('weekday.thu'),
      t('weekday.fri'),
      t('weekday.sat'),
      t('weekday.sun'),
    ],
    [t],
  )
  const [contacts, setContacts] = useState<Array<{ label: string; value: string }>>([])
  const [hours, setHours] = useState<Array<{ day: string; time: string }>>([])
  const [faq, setFaq] = useState<Array<{ id: string; question: string; answer: string }>>([])
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [certificateItems, setCertificateItems] = useState<
    Array<{ id: string; title: string; area: string; preview: string; pdf: string }>
  >([])

  const loadContent = useCallback(async () => {
    setIsLoading(true)
    setLoadingError(null)
    try {
      const [contact, generalHours, publicFaqs, publicCertificates] = await Promise.all([
        fetchPublicContact(language),
        fetchPublicGeneralHours(),
        fetchPublicFaqs(language),
        fetchPublicCertificates(language),
      ])

      setContacts([
        { label: t('contacts.field.address'), value: contact.address },
        { label: t('contacts.field.phone'), value: contact.phone },
        { label: t('contacts.field.email'), value: contact.email },
      ])

      const mappedHours = generalHours.slots
        .slice()
        .sort((a, b) => a.day_of_week - b.day_of_week)
        .map((slot) => ({
          day: dayNames[slot.day_of_week] ?? `День ${slot.day_of_week + 1}`,
          time: slot.is_closed
            ? t('contacts.hours.closed')
            : `${slot.open_time?.slice(0, 5) ?? '--:--'} - ${slot.close_time?.slice(0, 5) ?? '--:--'}`,
        }))
      setHours(mappedHours)

      setFaq(
        publicFaqs.map((item) => ({
          id: String(item.id),
          question: item.question,
          answer: item.answer,
        })),
      )

      const mappedCertificates = publicCertificates
        .filter((item) => item.image_url || item.document_url)
        .map((item) => ({
          id: String(item.id),
          title: item.title,
          area: item.issuer || 'Certificate',
          preview: item.image_url || item.document_url || '',
          pdf: item.document_url || item.image_url || '',
        }))
      setCertificateItems(mappedCertificates)
    } catch (requestError) {
      setLoadingError(getErrorText(requestError, t('contacts.errorFallback')))
      setContacts([])
      setHours([])
      setFaq([])
      setCertificateItems([])
    } finally {
      setIsLoading(false)
    }
  }, [dayNames, language, t])

  useEffect(() => {
    void loadContent()
  }, [loadContent])

  return (
    <main className="section-page contacts-page">
      <div className="section-page__glow section-page__glow--left" />
      <div className="section-page__glow section-page__glow--right" />

      <SiteNav />

      <SectionPageHero
        eyebrow={t('contacts.hero.eyebrow')}
        title={t('contacts.hero.title')}
        description={t('contacts.hero.description')}
        actions={
          <>
            <LinkButton to="/catalog" tone="primary">
              {t('contacts.hero.bookVisit')}
            </LinkButton>
            <LinkButton to="/pricing">{t('nav.pricing')}</LinkButton>
          </>
        }
      />

      <section className="section-page__grid section-page__grid--2">
        <article className="section-card">
          <p className="section-card__meta">{t('contacts.card.contactsMeta')}</p>
          <h2>{t('contacts.card.contactsTitle')}</h2>
          <ul className="section-list">
            {contacts.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="section-card">
          <p className="section-card__meta">{t('contacts.card.hoursMeta')}</p>
          <h2>{t('contacts.card.hoursTitle')}</h2>
          <ul className="section-list">
            {hours.map((item) => (
              <li key={item.day}>
                <span>{item.day}</span>
                <strong>{item.time}</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section-page__strip">
        <div className="section-page__strip-head">
          <h2>{t('contacts.faq.title')}</h2>
        </div>
        {loadingError ? (
          <p className="section-page__notice section-page__notice--error">{loadingError}</p>
        ) : null}
        {isLoading ? <p className="section-page__notice">{t('common.loading')}</p> : null}
        <FaqAccordion items={faq} defaultOpenCount={3} />
        <div className="section-page__strip-actions">
          <LinkButton to="/faq">{t('common.openAll')}</LinkButton>
        </div>
      </section>

      <CertificatesGrid
        id="certificates"
        limit={2}
        title={t('contacts.certificates.title')}
        description=""
        items={certificateItems}
      />

      <section className="section-page__cta">
        <div>
          <h2>{t('contacts.cta.title')}</h2>
          <p>{t('contacts.cta.text')}</p>
        </div>
        <div className="section-page__cta-actions">
          <LinkButton to="/catalog" tone="primary">
            {t('contacts.cta.openBooking')}
          </LinkButton>
          <LinkButton to="/">{t('common.toHome')}</LinkButton>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

export default ContactsPage
