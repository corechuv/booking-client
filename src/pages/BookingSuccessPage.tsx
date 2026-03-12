import { useLocation, useSearchParams } from 'react-router-dom'
import LinkButton from '../components/LinkButton'
import { PRIMARY_SPECIALIST_NAME } from '../config/salon'
import { SALON_NAME } from '../config/salon'
import { useI18n } from '../hooks/useI18n'
import { useSeo } from '../hooks/useSeo'
import '../styles/booking-success-page.scss'

type BookingSuccessState = {
  serviceTitle: string
  startsAt: string
  specialistName: string
}

const parseStateFromSearch = (searchParams: URLSearchParams): BookingSuccessState => {
  const serviceTitle = searchParams.get('service') ?? 'Service'
  const startsAt = searchParams.get('starts_at') ?? ''
  const specialistName = searchParams.get('specialist')

  return {
    serviceTitle,
    startsAt,
    specialistName: specialistName?.trim() || PRIMARY_SPECIALIST_NAME,
  }
}

function BookingSuccessPage() {
  const { locale, t } = useI18n()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const locationState = (location.state as BookingSuccessState | null) ??
    parseStateFromSearch(searchParams)

  const bookingDateText = locationState.startsAt
    ? dateTimeFormatter.format(new Date(locationState.startsAt))
    : t('success.defaultDate')

  useSeo({
    path: '/booking/success',
    title: `${t('success.eyebrow')} | ${SALON_NAME}`,
    description: `${t('success.procedure')}: ${locationState.serviceTitle}. ${t('success.datetime')}: ${bookingDateText}.`,
    keywords: [SALON_NAME, t('success.eyebrow'), t('success.nextStep'), locationState.serviceTitle],
    noindex: true,
  })

  return (
    <main className="booking-success-page">
      <section className="booking-success" aria-label="Успешная запись">
        <p className="booking-success__eyebrow">{t('success.eyebrow')}</p>
        <h1>
          {t('success.title').split('\n')[0]}
          <br />
          {t('success.title').split('\n')[1]}
        </h1>

        <div className="booking-success__details">
          <p>
            <span>{t('success.procedure')}</span>
            <strong>{locationState.serviceTitle}</strong>
          </p>
          <p>
            <span>{t('success.datetime')}</span>
            <strong>{bookingDateText}</strong>
          </p>
          <p>
            <span>{t('success.master')}</span>
            <strong>{PRIMARY_SPECIALIST_NAME}</strong>
          </p>
          <p>
            <span>{t('success.nextStep')}</span>
            <strong>
              {t('success.nextStepText')}
            </strong>
          </p>
        </div>

        <div className="booking-success__actions">
          <LinkButton to="/catalog" size="lg">
            {t('common.toCatalog')}
          </LinkButton>
          <LinkButton to="/" tone="primary" size="lg">
            {t('common.toHome')}
          </LinkButton>
        </div>
      </section>
    </main>
  )
}

export default BookingSuccessPage
