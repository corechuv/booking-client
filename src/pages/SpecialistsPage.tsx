import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ApiError,
  fetchPublicCertificates,
  fetchPublicGeneralHours,
  fetchPublicSpecialists,
} from '../api/client-api'
import CertificatesGrid from '../components/CertificatesGrid'
import LinkButton from '../components/LinkButton'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { useLanguage } from '../context/language-context'
import { PRIMARY_SPECIALIST_NAME } from '../config/salon'
import { useI18n } from '../hooks/useI18n'
import '../styles/section-page.scss'

const getErrorText = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  return 'Не удалось загрузить данные специалистов.'
}

function SpecialistsPage() {
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
  const [specialists, setSpecialists] = useState<
    Array<{ name: string; role: string; text: string; skills: string[] }>
  >([])
  const [weekPlan, setWeekPlan] = useState<Array<{ day: string; info: string }>>([])
  const [certificateItems, setCertificateItems] = useState<
    Array<{ id: string; title: string; preview: string; pdf: string }>
  >([])
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const primarySpecialistFallback = useMemo(
    () => ({
      name: PRIMARY_SPECIALIST_NAME,
      role: t('booking.sidebar.masterRole'),
      text: t('specialists.defaultBio'),
      skills: [] as string[],
    }),
    [t],
  )

  const loadContent = useCallback(async () => {
    setIsLoading(true)
    setLoadingError(null)
    try {
      const [publicSpecialists, generalHours, publicCertificates] = await Promise.all([
        fetchPublicSpecialists(language),
        fetchPublicGeneralHours(),
        fetchPublicCertificates(language),
      ])

      const mappedSpecialists = publicSpecialists.map((item) => ({
        name: item.full_name,
        role: item.title,
        text: item.bio ?? t('specialists.defaultBio'),
        skills: [] as string[],
      }))
      const normalizedPrimaryName = PRIMARY_SPECIALIST_NAME.trim().toLowerCase()
      const primarySpecialist = mappedSpecialists.find(
        (item) => item.name.trim().toLowerCase() === normalizedPrimaryName,
      )
      setSpecialists([primarySpecialist ?? primarySpecialistFallback])

      const mappedWeekPlan = generalHours.slots
        .slice()
        .sort((a, b) => a.day_of_week - b.day_of_week)
        .map((slot) => ({
          day: dayNames[slot.day_of_week] ?? `Day ${slot.day_of_week + 1}`,
          info: slot.is_closed
            ? t('contacts.hours.closed')
            : `${slot.open_time?.slice(0, 5) ?? '--:--'} - ${slot.close_time?.slice(0, 5) ?? '--:--'}`,
        }))
      setWeekPlan(mappedWeekPlan)

      const mappedCertificates = publicCertificates
        .filter((item) => item.image_url || item.document_url)
        .map((item) => ({
          id: String(item.id),
          title: item.title,
          preview: item.image_url || item.document_url || '',
          pdf: item.document_url || item.image_url || '',
        }))
      setCertificateItems(mappedCertificates)
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setLoadingError(getErrorText(requestError))
      } else {
        setLoadingError(t('specialists.errorFallback'))
      }
      setSpecialists([primarySpecialistFallback])
      setWeekPlan([])
      setCertificateItems([])
    } finally {
      setIsLoading(false)
    }
  }, [dayNames, language, primarySpecialistFallback, t])

  useEffect(() => {
    void loadContent()
  }, [loadContent])

  return (
    <main className="section-page">
      <div className="section-page__glow section-page__glow--left" />
      <div className="section-page__glow section-page__glow--right" />

      <SiteNav />

      <SectionPageHero
        eyebrow={t('specialists.hero.eyebrow')}
        title={t('specialists.hero.title')}
        description={t('specialists.hero.description')}
        actions={
          <>
            <LinkButton to="/catalog" tone="primary">
              {t('specialists.hero.pick')}
            </LinkButton>
            <LinkButton to="/contacts">{t('nav.contacts')}</LinkButton>
          </>
        }
      />

      <section className="section-page__grid section-page__grid--3">
        {specialists.map((item) => (
          <article className="section-card" key={item.name}>
            <p className="section-card__meta">{item.role}</p>
            <h2>{item.name}</h2>
            <p>{item.text}</p>
            {item.skills.length ? (
              <ul className="section-pill-list">
                {item.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <section className="section-page__strip">
        <div className="section-page__strip-head">
          <h2>{t('specialists.schedule.title')}</h2>
          <p>{t('specialists.schedule.text')}</p>
        </div>
        {loadingError ? (
          <p className="section-page__notice section-page__notice--error">{loadingError}</p>
        ) : null}
        {isLoading ? <p className="section-page__notice">{t('common.loading')}</p> : null}
        <ul className="section-list">
          {weekPlan.map((item) => (
            <li key={item.day}>
              <span>{item.day}</span>
              <strong>{item.info}</strong>
            </li>
          ))}
        </ul>
      </section>

      <CertificatesGrid items={certificateItems} />

      <section className="section-page__cta">
        <div>
          <h2>{t('specialists.cta.title')}</h2>
          <p>{t('specialists.cta.text')}</p>
        </div>
        <div className="section-page__cta-actions">
          <LinkButton to="/catalog" tone="primary">
            {t('specialists.cta.booking')}
          </LinkButton>
          <LinkButton to="/contacts">{t('specialists.cta.contact')}</LinkButton>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

export default SpecialistsPage
