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
import { certificates } from '../data/certificates'
import { useI18n } from '../hooks/useI18n'
import '../styles/section-page.scss'

const fallbackWeekPlan = [
  { day: 'Mon - Tue', info: '10:00 - 19:00 / full team available' },
  { day: 'Wed - Thu', info: '09:00 - 20:00 / evening slots active' },
  { day: 'Fri', info: '10:00 - 21:00 / makeup sessions priority' },
  { day: 'Sat - Sun', info: '09:00 - 18:00 / weekend express menu' },
]

const getErrorText = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  return 'Не удалось загрузить данные специалистов.'
}

function SpecialistsPage() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const fallbackSpecialists = useMemo(
    () => [
      {
        name: 'Mira',
        role: t('specialists.card.mira.role'),
        text: t('specialists.card.mira.text'),
        skills: [
          t('specialists.card.mira.skill1'),
          t('specialists.card.mira.skill2'),
          t('specialists.card.mira.skill3'),
        ],
      },
      {
        name: 'Alina',
        role: t('specialists.card.alina.role'),
        text: t('specialists.card.alina.text'),
        skills: [
          t('specialists.card.alina.skill1'),
          t('specialists.card.alina.skill2'),
          t('specialists.card.alina.skill3'),
        ],
      },
      {
        name: 'Sonia',
        role: t('specialists.card.sonia.role'),
        text: t('specialists.card.sonia.text'),
        skills: [
          t('specialists.card.sonia.skill1'),
          t('specialists.card.sonia.skill2'),
          t('specialists.card.sonia.skill3'),
        ],
      },
    ],
    [t],
  )
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
  const [specialists, setSpecialists] = useState(fallbackSpecialists)
  const [weekPlan, setWeekPlan] = useState(fallbackWeekPlan)
  const [certificateItems, setCertificateItems] = useState(certificates)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      setSpecialists(mappedSpecialists.length ? mappedSpecialists : fallbackSpecialists)

      const mappedWeekPlan = generalHours.slots
        .slice()
        .sort((a, b) => a.day_of_week - b.day_of_week)
        .map((slot) => ({
          day: dayNames[slot.day_of_week] ?? `Day ${slot.day_of_week + 1}`,
          info: slot.is_closed
            ? t('contacts.hours.closed')
            : `${slot.open_time?.slice(0, 5) ?? '--:--'} - ${slot.close_time?.slice(0, 5) ?? '--:--'}`,
        }))
      setWeekPlan(mappedWeekPlan.length ? mappedWeekPlan : fallbackWeekPlan)

      const mappedCertificates = publicCertificates
        .filter((item) => item.image_url)
        .map((item) => ({
          id: String(item.id),
          title: item.title,
          area: item.issuer || 'Certificate',
          preview: item.image_url as string,
          pdf: item.image_url as string,
        }))
      setCertificateItems(mappedCertificates.length ? mappedCertificates : certificates)
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setLoadingError(getErrorText(requestError))
      } else {
        setLoadingError(t('specialists.errorFallback'))
      }
      setSpecialists(fallbackSpecialists)
      setWeekPlan(fallbackWeekPlan)
      setCertificateItems(certificates)
    } finally {
      setIsLoading(false)
    }
  }, [dayNames, fallbackSpecialists, language, t])

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
            <LinkButton to="/booking" tone="primary">
              {t('specialists.hero.pick')}
            </LinkButton>
            <LinkButton to="/catalog">{t('specialists.hero.catalog')}</LinkButton>
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
          <LinkButton to="/booking" tone="primary">
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
