import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ApiError,
  confirmPublicBooking,
  type BookingConfirmedResult,
} from '../api/client-api'
import LinkButton from '../components/LinkButton'
import { PRIMARY_SPECIALIST_NAME } from '../config/salon'
import { useI18n } from '../hooks/useI18n'
import '../styles/booking-confirmed-page.scss'

type ConfirmState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'success'; booking: BookingConfirmedResult }

const confirmationInFlight = new Map<string, Promise<BookingConfirmedResult>>()

const getErrorMessage = (error: unknown, t: (key: string) => string): string => {
  if (error instanceof ApiError) {
    if (error.status === 410) {
      return t('confirmed.errorExpired')
    }
    if (error.status === 404) {
      return t('confirmed.errorInvalid')
    }

    return error.message
  }

  return t('confirmed.errorGeneric')
}

function BookingConfirmedPage() {
  const { locale, t } = useI18n()
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<ConfirmState>({ phase: 'loading' })
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])

  useEffect(() => {
    if (!token) {
      setState({
        phase: 'error',
        message: t('confirmed.errorNoToken'),
      })
      return
    }

    let isMounted = true
    setState({ phase: 'loading' })

    let request = confirmationInFlight.get(token)
    if (!request) {
      request = confirmPublicBooking(token)
      confirmationInFlight.set(token, request)
    }

    request
      .then((booking) => {
        if (!isMounted) {
          return
        }
        setState({ phase: 'success', booking })
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return
        }
        setState({
          phase: 'error',
          message: getErrorMessage(error, t),
        })
      })
      .finally(() => {
        if (confirmationInFlight.get(token) === request) {
          confirmationInFlight.delete(token)
        }
      })

    return () => {
      isMounted = false
    }
  }, [t, token])

  if (state.phase === 'loading') {
    return (
      <main className="booking-confirmed-page">
        <section className="booking-confirmed booking-confirmed--loading">
          <p>{t('confirmed.loading')}</p>
        </section>
      </main>
    )
  }

  if (state.phase === 'error') {
    return (
      <main className="booking-confirmed-page">
        <section className="booking-confirmed booking-confirmed--error">
          <p className="booking-confirmed__eyebrow">{t('confirmed.errorEyebrow')}</p>
          <h1>{t('confirmed.errorTitle')}</h1>
          <p className="booking-confirmed__message">{state.message}</p>
          <div className="booking-confirmed__actions">
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

  const { booking } = state

  return (
    <main className="booking-confirmed-page">
      <section className="booking-confirmed">
        <p className="booking-confirmed__eyebrow">{t('confirmed.successEyebrow')}</p>
        <h1>
          {t('confirmed.successTitle').split('\n')[0]}
          <br />
          {t('confirmed.successTitle').split('\n')[1]}
        </h1>

        <div className="booking-confirmed__details">
          <p>
            <span>{t('confirmed.procedure')}</span>
            <strong>{booking.service_title}</strong>
          </p>
          <p>
            <span>{t('confirmed.datetime')}</span>
            <strong>{dateTimeFormatter.format(new Date(booking.starts_at))}</strong>
          </p>
          <p>
            <span>{t('confirmed.master')}</span>
            <strong>{booking.specialist_name || PRIMARY_SPECIALIST_NAME}</strong>
          </p>
          <p>
            <span>{t('confirmed.address')}</span>
            <strong>{booking.salon_address}</strong>
          </p>
          <p>
            <span>{t('confirmed.phone')}</span>
            <strong>{booking.salon_phone}</strong>
          </p>
          <p>
            <span>{t('confirmed.route')}</span>
            <strong>
              <a href={booking.salon_route_url} target="_blank" rel="noreferrer">
                {t('confirmed.openRoute')}
              </a>
            </strong>
          </p>
        </div>

        <div className="booking-confirmed__actions">
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

export default BookingConfirmedPage
