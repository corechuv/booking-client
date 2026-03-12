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
import { SALON_NAME } from '../config/salon'
import { useLanguage } from '../context/language-context'
import { PRIMARY_SPECIALIST_NAME } from '../config/salon'
import { useI18n } from '../hooks/useI18n'
import { useSeo } from '../hooks/useSeo'
import { buildHoursByDay, formatDayHours } from '../lib/business-hours'
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

    const [specialistsResult, generalHoursResult, certificatesResult] = await Promise.allSettled(
      [
        fetchPublicSpecialists(language),
        fetchPublicGeneralHours(),
        fetchPublicCertificates(language),
      ],
    )

    let firstError: string | null = null

    if (specialistsResult.status === 'fulfilled') {
      const mappedSpecialists = specialistsResult.value.map((item) => ({
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
    } else {
      setSpecialists([primarySpecialistFallback])
      if (specialistsResult.reason instanceof ApiError) {
        firstError ??= getErrorText(specialistsResult.reason)
      } else {
        firstError ??= t('specialists.errorFallback')
      }
    }

    if (generalHoursResult.status === 'fulfilled') {
      const hoursByDay = buildHoursByDay(generalHoursResult.value.slots)
      const mappedWeekPlan = dayNames.map((dayName, dayIndex) => ({
        day: dayName,
        info: formatDayHours(
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
      setWeekPlan(mappedWeekPlan)
    } else {
      setWeekPlan([])
      if (generalHoursResult.reason instanceof ApiError) {
        firstError ??= getErrorText(generalHoursResult.reason)
      } else {
        firstError ??= t('specialists.errorFallback')
      }
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
      if (certificatesResult.reason instanceof ApiError) {
        firstError ??= getErrorText(certificatesResult.reason)
      } else {
        firstError ??= t('specialists.errorFallback')
      }
    }

    setLoadingError(firstError)
    setIsLoading(false)
  }, [dayNames, language, primarySpecialistFallback, t])

  useEffect(() => {
    void loadContent()
  }, [loadContent])

  useSeo({
    path: '/specialists',
    title: `${t('specialists.hero.title')} | ${SALON_NAME}`,
    description: t('specialists.hero.description'),
    keywords: [
      SALON_NAME,
      t('nav.specialists'),
      PRIMARY_SPECIALIST_NAME,
      ...specialists.map((item) => item.name),
      ...specialists.map((item) => item.role),
    ],
    jsonLd: specialists.length
      ? {
          '@type': 'ItemList',
          name: t('specialists.hero.title'),
          itemListElement: specialists.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Person',
              name: item.name,
              jobTitle: item.role,
              description: item.text,
            },
          })),
        }
      : undefined,
  })

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
