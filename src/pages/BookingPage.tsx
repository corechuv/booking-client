import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ApiError,
  createPublicBooking,
  fetchBookingAvailability,
  fetchClientServices,
  fetchPublicGeneralHours,
  type ClientService,
  type PublicHourSlot,
} from '../api/client-api'
import BookingScheduler from '../components/BookingScheduler'
import LinkButton from '../components/LinkButton'
import SalonMap from '../components/SalonMap'
import SectionPageHero from '../components/SectionPageHero'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'
import { useLanguage } from '../context/language-context'
import { PRIMARY_SPECIALIST_NAME } from '../config/salon'
import { useI18n } from '../hooks/useI18n'
import { usePublicContact } from '../hooks/usePublicContact'
import { formatEuroPrice } from '../lib/service-catalog-api'
import '../styles/booking-page.scss'

const getErrorText = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Request failed. Please try again.'
}

const toStartsAtIso = (dateValue: string, slotValue: string): string | null => {
  const [hoursRaw, minutesRaw] = slotValue.split(':')
  const hours = Number.parseInt(hoursRaw, 10)
  const minutes = Number.parseInt(minutesRaw, 10)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }

  const localDate = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(localDate.getTime())) {
    return null
  }

  localDate.setHours(hours, minutes, 0, 0)
  return localDate.toISOString()
}

type BookingSchedulerSelection = {
  date: string
  slot: string | null
}

type BookingSuccessState = {
  serviceTitle: string
  startsAt: string
  specialistName: string | null
}

const toIsoDate = (value: Date): string => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toTimeText = (value: Date): string => {
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const toBusySlotKey = (startsAtIso: string): string => {
  const value = new Date(startsAtIso)
  return `${toIsoDate(value)}|${toTimeText(value)}`
}

function BookingPage() {
  const { language } = useLanguage()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { contact } = usePublicContact()
  const [services, setServices] = useState<ClientService[]>([])
  const [isServicesLoading, setIsServicesLoading] = useState(true)
  const [servicesError, setServicesError] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fullNameValue, setFullNameValue] = useState('')
  const [phoneValue, setPhoneValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [consentProcedureChecked, setConsentProcedureChecked] = useState(false)
  const [consentDataChecked, setConsentDataChecked] = useState(false)
  const [schedulerSelection, setSchedulerSelection] = useState<BookingSchedulerSelection>({
    date: '',
    slot: null,
  })
  const [busySlotKeys, setBusySlotKeys] = useState<string[]>([])
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [generalHoursSlots, setGeneralHoursSlots] = useState<PublicHourSlot[]>([])
  const [hoursError, setHoursError] = useState<string | null>(null)

  const serviceIdFromQuery = useMemo(() => {
    const value = searchParams.get('service')
    if (!value) {
      return null
    }

    const parsedId = Number.parseInt(value, 10)
    return Number.isNaN(parsedId) ? null : parsedId
  }, [searchParams])

  const loadServices = useCallback(async () => {
    setIsServicesLoading(true)
    setServicesError(null)

    try {
      const nextServices = await fetchClientServices(language)
      setServices(nextServices)
    } catch (error) {
      setServices([])
      setServicesError(getErrorText(error))
    } finally {
      setIsServicesLoading(false)
    }
  }, [language])

  useEffect(() => {
    void loadServices()
  }, [loadServices])

  useEffect(() => {
    const loadGeneralHours = async () => {
      setHoursError(null)
      try {
        const hours = await fetchPublicGeneralHours()
        setGeneralHoursSlots(hours.slots)
      } catch (error) {
        setGeneralHoursSlots([])
        setHoursError(getErrorText(error))
      }
    }

    void loadGeneralHours()
  }, [])

  const selectedService = useMemo(
    () =>
      serviceIdFromQuery === null
        ? undefined
        : services.find((service) => service.id === serviceIdFromQuery),
    [serviceIdFromQuery, services],
  )

  useEffect(() => {
    if (!selectedService) {
      setBusySlotKeys([])
      setAvailabilityError(null)
      return
    }

    const loadAvailability = async () => {
      setIsAvailabilityLoading(true)
      setAvailabilityError(null)

      try {
        const dateFrom = toIsoDate(new Date())
        const availability = await fetchBookingAvailability(
          selectedService.id,
          dateFrom,
          56,
        )
        setBusySlotKeys(availability.busy_slots.map(toBusySlotKey))
      } catch (error) {
        setBusySlotKeys([])
        setAvailabilityError(getErrorText(error))
      } finally {
        setIsAvailabilityLoading(false)
      }
    }

    void loadAvailability()
  }, [selectedService])

  const isQueryProvided = searchParams.has('service')

  const heroEyebrow = selectedService
    ? t('booking.hero.selected')
    : isServicesLoading
      ? t('booking.hero.loading')
      : isQueryProvided
        ? t('booking.hero.missing')
        : t('booking.hero.firstSelect')

  const heroTitle = selectedService
    ? selectedService.title
    : t('booking.hero.openCatalog')

  const heroDescription = selectedService
    ? `${selectedService.category} · ${selectedService.duration_minutes} ${
        language === 'de' ? 'Min' : language === 'uk' ? 'хв' : 'мин'
      } · ${formatEuroPrice(selectedService.price)}`
    : t('booking.hero.onlyCatalog')

  const isFormReady =
    Boolean(selectedService) &&
    fullNameValue.trim().length > 1 &&
    phoneValue.trim().length > 0 &&
    emailValue.trim().length > 0 &&
    consentProcedureChecked &&
    consentDataChecked &&
    Boolean(schedulerSelection.slot)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    if (!selectedService) {
      setSubmitError(t('booking.error.pickService'))
      return
    }

    const formData = new FormData(event.currentTarget)

    const fullName = String(formData.get('full_name') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const specialist =
      String(formData.get('specialist') ?? '').trim() || PRIMARY_SPECIALIST_NAME
    const comment = String(formData.get('comment') ?? '').trim()
    const bookingDate = String(formData.get('booking_date') ?? '').trim()
    const bookingSlot = String(formData.get('booking_slot') ?? '').trim()
    const procedureConsent = formData.get('consent_procedure') === 'on'

    if (!bookingDate || !bookingSlot) {
      setSubmitError(t('booking.error.pickSlot'))
      return
    }

    const startsAt = toStartsAtIso(bookingDate, bookingSlot)
    if (!startsAt) {
      setSubmitError(t('booking.error.invalidSlot'))
      return
    }

    if (!procedureConsent) {
      setSubmitError(t('booking.error.consentProcedure'))
      return
    }

    setIsSubmitting(true)

    try {
      const booking = await createPublicBooking(
        {
          full_name: fullName,
          email,
          phone: phone || null,
          service_id: selectedService.id,
          specialist_name: specialist || null,
          starts_at: startsAt,
          consent_accepted: true,
          comment: comment || null,
        },
      )
      const successState: BookingSuccessState = {
        serviceTitle: booking.service.title,
        startsAt: booking.starts_at,
        specialistName: PRIMARY_SPECIALIST_NAME,
      }
      const successParams = new URLSearchParams({
        service: booking.service.title,
        starts_at: booking.starts_at,
        specialist: PRIMARY_SPECIALIST_NAME,
      })

      navigate(`/booking/success?${successParams.toString()}`, { state: successState })
    } catch (error) {
      setSubmitError(getErrorText(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="booking-page">
      <SiteNav />

      <div className="booking-shell">
        <SectionPageHero
          eyebrow={heroEyebrow}
          title={heroTitle}
          description={heroDescription}
          actions={
            <LinkButton to="/catalog" size="md">
              {t('booking.backToProcedures')}
            </LinkButton>
          }
        />

        <section className="booking-content">
          {servicesError ? (
            <p className="booking-form__notice booking-form__notice--error">
              {t('booking.error.servicesLoad', { message: servicesError })}
            </p>
          ) : null}
          {availabilityError ? (
            <p className="booking-form__notice booking-form__notice--error">
              {t('booking.error.availabilityLoad', { message: availabilityError })}
            </p>
          ) : null}
          {hoursError ? (
            <p className="booking-form__notice booking-form__notice--error">
              {t('booking.error.hoursLoad', { message: hoursError })}
            </p>
          ) : null}
          {isAvailabilityLoading ? (
            <p className="booking-form__notice">{t('booking.loadingSlots')}</p>
          ) : null}

          <section className="booking-form-card">
            <form className="booking-form" onSubmit={(event) => void handleSubmit(event)}>
              <div className="field field--full field--scheduler">
                <span>{t('booking.field.dateSlot')}</span>
                <BookingScheduler
                  busySlotKeys={busySlotKeys}
                  generalHoursSlots={generalHoursSlots}
                  serviceDurationMinutes={selectedService?.duration_minutes}
                  onSelectionChange={setSchedulerSelection}
                />
              </div>

              <label className="field">
                <span>{t('booking.field.fullName')}</span>
                <input
                  name="full_name"
                  type="text"
                  placeholder={t('booking.field.fullNamePlaceholder')}
                  value={fullNameValue}
                  onChange={(event) => setFullNameValue(event.currentTarget.value)}
                  required
                />
              </label>

              <label className="field">
                <span>{t('booking.field.phone')}</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder={t('booking.field.phonePlaceholder')}
                  value={phoneValue}
                  onChange={(event) => setPhoneValue(event.currentTarget.value)}
                  required
                />
              </label>

              <label className="field">
                <span>{t('booking.field.email')}</span>
                <input
                  name="email"
                  type="email"
                  placeholder={t('booking.field.emailPlaceholder')}
                  value={emailValue}
                  onChange={(event) => setEmailValue(event.currentTarget.value)}
                  required
                />
              </label>

              <label className="field">
                <span>{t('booking.field.specialist')}</span>
                <select name="specialist" defaultValue={PRIMARY_SPECIALIST_NAME}>
                  <option value={PRIMARY_SPECIALIST_NAME}>{PRIMARY_SPECIALIST_NAME}</option>
                </select>
              </label>

              <label className="field field--full">
                <span>{t('booking.field.comment')}</span>
                <textarea
                  name="comment"
                  rows={4}
                  placeholder={t('booking.field.commentPlaceholder')}
                />
              </label>

              <label className="check-field field--full">
                {/* TODO: На backend сохранить версию текста согласия на процедуру и timestamp подтверждения. */}
                <input
                  name="consent_procedure"
                  type="checkbox"
                  checked={consentProcedureChecked}
                  onChange={(event) =>
                    setConsentProcedureChecked(event.currentTarget.checked)
                  }
                  required
                />
                <span>
                  {t('booking.consent.procedure')}
                </span>
              </label>

              <label className="check-field field--full">
                <input
                  name="consent_data"
                  type="checkbox"
                  checked={consentDataChecked}
                  onChange={(event) => setConsentDataChecked(event.currentTarget.checked)}
                  required
                />
                <span>{t('booking.consent.data')}</span>
              </label>

              {submitError ? (
                <p className="booking-form__notice booking-form__notice--error">
                  {submitError}
                </p>
              ) : null}

              <button
                className="button-primary field--full"
                type="submit"
                disabled={
                  isSubmitting ||
                  isServicesLoading ||
                  isAvailabilityLoading ||
                  !isFormReady
                }
              >
                {isSubmitting ? t('booking.submit.sending') : t('booking.submit.default')}
              </button>
            </form>
          </section>
        </section>

        <aside className="booking-sidebar">
          <section className="aside-card specialist-card">
            <h3>{t('booking.sidebar.master')}</h3>
            <div className="specialist-card__media">
              <img
                src="/iryna%20marinina.jpeg"
                alt={`${PRIMARY_SPECIALIST_NAME} master portrait`}
              />
            </div>
            <div className="specialist-card__body">
              <strong>{PRIMARY_SPECIALIST_NAME}</strong>
              <p>{t('booking.sidebar.masterRole')}</p>
            </div>
          </section>

          <section className="aside-card map-card">
            <h3>{t('booking.sidebar.mapTitle')}</h3>
            <SalonMap
              salonName={contact.salon_name}
              address={contact.address}
              routeUrl={contact.route_url}
            />
          </section>

          <section className="aside-card contact-card">
            <h3>{t('booking.sidebar.contacts', { salon: contact.salon_name })}</h3>
            <p>{contact.address}</p>
            <p>{contact.phone}</p>
            <p>{contact.email}</p>
            <p>{t('booking.sidebar.availability24')}</p>
          </section>
        </aside>
      </div>

      <SiteFooter />
    </main>
  )
}

export default BookingPage
