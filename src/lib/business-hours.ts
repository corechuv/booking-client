const DEFAULT_DAY_START_MINUTES = 9 * 60
const DEFAULT_DAY_END_MINUTES = 20 * 60

export type PublicHourSlotLike = {
  day_of_week: number
  interval_index?: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export type DayInterval = {
  openMinutes: number
  closeMinutes: number
  openTime: string
  closeTime: string
}

export type DayHours = {
  isClosed: boolean
  intervals: DayInterval[]
}

const normalizeTime = (value: string | null): string => {
  if (!value) {
    return ''
  }
  return value.slice(0, 5)
}

export const parseTimeToMinutes = (value: string | null): number | null => {
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

const defaultIntervals = (): DayInterval[] => [
  {
    openMinutes: DEFAULT_DAY_START_MINUTES,
    closeMinutes: DEFAULT_DAY_END_MINUTES,
    openTime: '09:00',
    closeTime: '20:00',
  },
]

export const buildHoursByDay = (slots: PublicHourSlotLike[]): Map<number, DayHours> => {
  const grouped = new Map<number, PublicHourSlotLike[]>()

  slots
    .slice()
    .sort(
      (a, b) =>
        a.day_of_week - b.day_of_week ||
        (a.interval_index ?? 0) - (b.interval_index ?? 0),
    )
    .forEach((slot) => {
      const current = grouped.get(slot.day_of_week) ?? []
      current.push(slot)
      grouped.set(slot.day_of_week, current)
    })

  const result = new Map<number, DayHours>()

  for (let day = 0; day < 7; day += 1) {
    const daySlots = grouped.get(day) ?? []
    if (!daySlots.length) {
      result.set(day, {
        isClosed: false,
        intervals: defaultIntervals(),
      })
      continue
    }

    if (daySlots.some((slot) => slot.is_closed)) {
      result.set(day, { isClosed: true, intervals: [] })
      continue
    }

    const intervals = daySlots
      .map((slot) => {
        const openTime = normalizeTime(slot.open_time)
        const closeTime = normalizeTime(slot.close_time)
        const openMinutes = parseTimeToMinutes(openTime)
        const closeMinutes = parseTimeToMinutes(closeTime)
        if (openMinutes === null || closeMinutes === null || openMinutes >= closeMinutes) {
          return null
        }

        return {
          openMinutes,
          closeMinutes,
          openTime,
          closeTime,
        }
      })
      .filter((item): item is DayInterval => item !== null)
      .sort((a, b) => a.openMinutes - b.openMinutes || a.closeMinutes - b.closeMinutes)

    result.set(day, {
      isClosed: false,
      intervals: intervals.length ? intervals : defaultIntervals(),
    })
  }

  return result
}

export const formatDayHours = (dayHours: DayHours, closedLabel: string): string => {
  if (dayHours.isClosed) {
    return closedLabel
  }

  return dayHours.intervals
    .map((interval) => `${interval.openTime} - ${interval.closeTime}`)
    .join(', ')
}
