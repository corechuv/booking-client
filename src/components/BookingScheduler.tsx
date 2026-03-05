import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../hooks/useI18n'
import { ArrowLeftIcon, ArrowRightIcon } from './icons'

const SLOT_INTERVAL_MINUTES = 15
const DAY_START_MINUTES = 9 * 60
const DAY_END_MINUTES = 20 * 60

const formatTime = (minutes: number) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mins = String(minutes % 60).padStart(2, '0')
  return `${hours}:${mins}`
}

const toStartOfDay = (date: Date) => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const addDays = (date: Date, days: number) => {
  const value = new Date(date)
  value.setDate(value.getDate() + days)
  return value
}

const getWeekStart = (date: Date) => {
  const value = toStartOfDay(date)
  const day = value.getDay()
  const shift = day === 0 ? -6 : 1 - day
  value.setDate(value.getDate() + shift)
  return value
}

const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const isBeforeDate = (a: Date, b: Date) => a.getTime() < b.getTime()

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseTimeToMinutes = (value: string | null): number | null => {
  if (!value) {
    return null
  }
  const [hoursRaw, minutesRaw] = value.split(':')
  const hours = Number.parseInt(hoursRaw, 10)
  const minutes = Number.parseInt(minutesRaw, 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }
  return hours * 60 + minutes
}

const toBusinessDayOfWeek = (date: Date): number => {
  const jsDay = date.getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

type GeneralHourSlot = {
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

type BookingSchedulerProps = {
  busySlotKeys?: string[]
  generalHoursSlots?: GeneralHourSlot[]
  serviceDurationMinutes?: number
  onSelectionChange?: (selection: { date: string; slot: string | null }) => void
}

function BookingScheduler({
  busySlotKeys = [],
  generalHoursSlots = [],
  serviceDurationMinutes = SLOT_INTERVAL_MINUTES,
  onSelectionChange,
}: BookingSchedulerProps) {
  const { locale, t } = useI18n()
  const now = new Date()
  const today = toStartOfDay(now)
  const currentWeekStart = getWeekStart(today)
  const [weekStart, setWeekStart] = useState(currentWeekStart)
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const busySlotSet = useMemo(() => new Set(busySlotKeys), [busySlotKeys])
  const generalHoursByDay = useMemo(
    () => new Map(generalHoursSlots.map((slot) => [slot.day_of_week, slot])),
    [generalHoursSlots],
  )
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    [locale],
  )
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short' }),
    [locale],
  )
  const weekRangeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
      }),
    [locale],
  )
  const selectedDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    [locale],
  )

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  )

  const currentWeekLabel = `${weekRangeFormatter.format(weekDays[0])} - ${weekRangeFormatter.format(weekDays[6])}`

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const isSelectedDatePast = isBeforeDate(selectedDate, today)
  const isTodaySelected = isSameDate(selectedDate, today)
  const selectedDayHours = generalHoursByDay.get(toBusinessDayOfWeek(selectedDate))
  const selectedDayStartMinutes =
    parseTimeToMinutes(selectedDayHours?.open_time ?? null) ?? DAY_START_MINUTES
  const selectedDayEndMinutes =
    parseTimeToMinutes(selectedDayHours?.close_time ?? null) ?? DAY_END_MINUTES
  const selectedDayClosed =
    Boolean(selectedDayHours?.is_closed) || selectedDayStartMinutes >= selectedDayEndMinutes
  const hasSelectedDayDurationWindow =
    selectedDayEndMinutes - selectedDayStartMinutes >= serviceDurationMinutes

  const latestStartMinutes = Math.max(
    selectedDayStartMinutes,
    selectedDayEndMinutes - serviceDurationMinutes,
  )
  const slots = isSelectedDatePast
    ? []
    : selectedDayClosed
    ? []
    : !hasSelectedDayDurationWindow
    ? []
    : Array.from(
        {
          length:
            Math.floor(
              (latestStartMinutes - selectedDayStartMinutes) / SLOT_INTERVAL_MINUTES,
            ) + 1,
        },
        (_, index) => selectedDayStartMinutes + index * SLOT_INTERVAL_MINUTES,
      )
        .filter((minutes) => !isTodaySelected || minutes > currentMinutes)
        .map((minutes) => {
          const slotKey = `${formatIsoDate(selectedDate)}|${formatTime(minutes)}`
          return {
            time: formatTime(minutes),
            busy: busySlotSet.has(slotKey),
          }
        })

  const canGoPrevWeek = weekStart.getTime() > currentWeekStart.getTime()

  const handleWeekMove = (direction: -1 | 1) => {
    if (direction === -1 && !canGoPrevWeek) {
      return
    }
    setWeekStart((current) => addDays(current, direction * 7))
    setSelectedDate((current) => addDays(current, direction * 7))
    setSelectedSlot(null)
  }

  const selectedDateText = selectedDateFormatter.format(selectedDate)
  const selectedDateIso = formatIsoDate(selectedDate)

  useEffect(() => {
    if (!onSelectionChange) {
      return
    }

    onSelectionChange({
      date: selectedDateIso,
      slot: selectedSlot,
    })
  }, [onSelectionChange, selectedDateIso, selectedSlot])

  useEffect(() => {
    if (!selectedSlot) {
      return
    }

    const slotKey = `${selectedDateIso}|${selectedSlot}`
    if (busySlotSet.has(slotKey)) {
      setSelectedSlot(null)
    }
  }, [busySlotSet, selectedDateIso, selectedSlot])

  useEffect(() => {
    if (!selectedSlot) {
      return
    }

    const hasSelectedSlotInDay = slots.some((slot) => slot.time === selectedSlot && !slot.busy)
    if (!hasSelectedSlotInDay) {
      setSelectedSlot(null)
    }
  }, [selectedSlot, slots])

  return (
    <section className="booking-scheduler" aria-label={t('scheduler.aria')}>
      <input type="hidden" name="booking_date" value={selectedDateIso} />
      <input type="hidden" name="booking_slot" value={selectedSlot ?? ''} />

      <div className="scheduler-head">
        <div className="scheduler-head__copy">
          <p>{t('scheduler.weekSelect')}</p>
          <strong>{currentWeekLabel}</strong>
        </div>
        <div className="scheduler-week-nav">
          <button
            className="scheduler-week-btn"
            type="button"
            onClick={() => handleWeekMove(-1)}
            aria-label={t('scheduler.prevWeek')}
            disabled={!canGoPrevWeek}
          >
            <ArrowLeftIcon aria-hidden="true" />
          </button>
          <button
            className="scheduler-week-btn"
            type="button"
            onClick={() => handleWeekMove(1)}
            aria-label={t('scheduler.nextWeek')}
          >
            <ArrowRightIcon aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="scheduler-days" role="list" aria-label={t('scheduler.daysAria')}>
        {weekDays.map((day) => {
          const selected = isSameDate(day, selectedDate)
          const isPastDay = isBeforeDate(day, today)
          const dayHours = generalHoursByDay.get(toBusinessDayOfWeek(day))
          const dayStartMinutes =
            parseTimeToMinutes(dayHours?.open_time ?? null) ?? DAY_START_MINUTES
          const dayEndMinutes =
            parseTimeToMinutes(dayHours?.close_time ?? null) ?? DAY_END_MINUTES
          const isClosedDay =
            Boolean(dayHours?.is_closed) ||
            dayStartMinutes >= dayEndMinutes ||
            dayEndMinutes - dayStartMinutes < serviceDurationMinutes
          const isDisabled = isPastDay || isClosedDay

          return (
            <button
              key={day.toISOString()}
              className={
                selected
                  ? isDisabled
                    ? 'scheduler-day is-selected is-disabled'
                    : 'scheduler-day is-selected'
                  : isDisabled
                    ? 'scheduler-day is-disabled'
                    : 'scheduler-day'
              }
              type="button"
              disabled={isDisabled}
              onClick={() => {
                setSelectedDate(day)
                setSelectedSlot(null)
              }}
            >
              <span className="scheduler-day__weekday">
                {weekdayFormatter.format(day)}
              </span>
              <strong className="scheduler-day__date">{day.getDate()}</strong>
              <span className="scheduler-day__month">{monthFormatter.format(day)}</span>
            </button>
          )
        })}
      </div>

      <div className="scheduler-slots" role="list" aria-label={t('scheduler.slotsAria')}>
        {slots.map((slot) => {
          const selected = selectedSlot === slot.time
          const stateClass = slot.busy
            ? 'scheduler-slot is-busy'
            : selected
              ? 'scheduler-slot is-selected'
              : 'scheduler-slot'

          return (
            <button
              key={`${selectedDate.toISOString()}-${slot.time}`}
              className={stateClass}
              type="button"
              onClick={() => setSelectedSlot(slot.time)}
              disabled={slot.busy}
            >
              {slot.busy ? t('scheduler.busy', { time: slot.time }) : slot.time}
            </button>
          )
        })}
      </div>

      {slots.length === 0 ? (
        <p className="scheduler-empty">
          {selectedDayClosed
            ? t('scheduler.closed')
            : t('scheduler.noSlots')}
        </p>
      ) : null}

      <p className="scheduler-summary">
        {selectedSlot
          ? t('scheduler.selected', { date: selectedDateText, slot: selectedSlot })
          : t('scheduler.pick', { date: selectedDateText })}
      </p>
    </section>
  )
}

export default BookingScheduler
