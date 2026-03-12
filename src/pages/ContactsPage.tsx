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
import SalonMap from '../components/SalonMap'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { SALON_NAME } from '../config/salon'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { useSeo } from '../hooks/useSeo'
import { buildHoursByDay, formatDayHours } from '../lib/business-hours'
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
  const [mapData, setMapData] = useState<{ salonName: string; address: string; routeUrl: string }>({
    salonName: '',
    address: '',
    routeUrl: '',
  })
  const [hours, setHours] = useState<Array<{ day: string; time: string }>>([])
  const [faq, setFaq] = useState<Array<{ id: string; question: string; answer: string }>>([])
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [certificateItems, setCertificateItems] = useState<
    Array<{ id: string; title: string; preview: string; pdf: string }>
  >([])

  const loadContent = useCallback(async () => {
    setIsLoading(true)
    setLoadingError(null)

    const [contactResult, generalHoursResult, faqResult, certificatesResult] =
      await Promise.allSettled([
        fetchPublicContact(language),
        fetchPublicGeneralHours(),
        fetchPublicFaqs(language),
        fetchPublicCertificates(language),
      ])

    let firstError: string | null = null

    if (contactResult.status === 'fulfilled') {
      const contact = contactResult.value
      setContacts([
        { label: t('contacts.field.address'), value: contact.address },
        { label: t('contacts.field.phone'), value: contact.phone },
        { label: t('contacts.field.email'), value: contact.email },
      ])
      setMapData({
        salonName: contact.salon_name,
        address: contact.address,
        routeUrl: contact.route_url,
      })
    } else {
      setContacts([])
      setMapData({
        salonName: '',
        address: '',
        routeUrl: '',
      })
      firstError ??= getErrorText(contactResult.reason, t('contacts.errorFallback'))
    }

    if (generalHoursResult.status === 'fulfilled') {
      const generalHours = generalHoursResult.value
      const hoursByDay = buildHoursByDay(generalHours.slots)
      const mappedHours = dayNames.map((dayName, dayIndex) => ({
        day: dayName,
        time: formatDayHours(
          hoursByDay.get(dayIndex) ?? {
            isClosed: false,
            intervals: [
              {
                openMinutes: 9 * 60,
                closeMinutes: 20 * 60,
                openTime: '09:00',
                closeTime: '20:00',
              },
            ],
          },
          t('contacts.hours.closed'),
        ),
      }))
      setHours(mappedHours)
    } else {
      setHours([])
      firstError ??= getErrorText(generalHoursResult.reason, t('contacts.errorFallback'))
    }

    if (faqResult.status === 'fulfilled') {
      setFaq(
        faqResult.value.map((item) => ({
          id: String(item.id),
          question: item.question,
          answer: item.answer,
        })),
      )
    } else {
      setFaq([])
      firstError ??= getErrorText(faqResult.reason, t('contacts.errorFallback'))
    }

    if (certificatesResult.status === 'fulfilled') {
      const mappedCertificates = certificatesResult.value
        .filter((item) => item.image_url || item.document_url)
        .map((item) => ({
          id: String(item.id),
          title: item.title,
          preview: item.image_url || item.document_url || '',
          pdf: item.document_url || item.image_url || '',
        }))
      setCertificateItems(mappedCertificates)
    } else {
      setCertificateItems([])
      firstError ??= getErrorText(certificatesResult.reason, t('contacts.errorFallback'))
    }

    setLoadingError(firstError)
    setIsLoading(false)
  }, [dayNames, language, t])

  useEffect(() => {
    void loadContent()
  }, [loadContent])

  useSeo({
    path: '/contacts',
    title: `${t('contacts.hero.title')} | ${SALON_NAME}`,
    description: t('contacts.hero.description'),
    keywords: [
      SALON_NAME,
      t('nav.contacts'),
      ...contacts.map((item) => item.value),
      ...hours.map((item) => `${item.day} ${item.time}`),
    ],
    jsonLd: {
      '@type': 'ContactPage',
      name: t('contacts.hero.title'),
      description: t('contacts.hero.description'),
    },
  })

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

          {mapData.address ? (
            <div className="contacts-page__map-inline">
              <p className="contacts-page__map-label">{t('contacts.map.title')}</p>
              <SalonMap
                salonName={mapData.salonName}
                address={mapData.address}
                routeUrl={mapData.routeUrl}
              />
            </div>
          ) : null}
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
