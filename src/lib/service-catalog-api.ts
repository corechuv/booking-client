import type { ClientService } from '../api/client-api'
import type { ServiceCategory, ServiceItem } from '../data/service-catalog'
import type { AppLanguageCode } from '../i18n/types'

const categorySummaries: Record<AppLanguageCode, Record<string, string>> = {
  ru: {
    'Skin Care': 'Уходовые программы для чистоты, сияния и восстановления кожи.',
    Hair: 'Стрижка, укладка и уход для естественного и event-образа.',
    Nails: 'Чистый маникюр, стойкое покрытие и деликатный nail design.',
    'Makeup & Brows': 'Макияж, брови и lashes для дневных и event-задач.',
  },
  uk: {
    'Skin Care': 'Доглядові програми для чистоти, сяйва та відновлення шкіри.',
    Hair: 'Стрижка, укладка та догляд для природного і event-образу.',
    Nails: 'Чистий манікюр, стійке покриття та делікатний nail design.',
    'Makeup & Brows': 'Макіяж, брови й lashes для денних та event-задач.',
  },
  de: {
    'Skin Care': 'Pflegeprogramme für Reinheit, Glow und Hautregeneration.',
    Hair: 'Schnitt, Styling und Pflege für natürliche und Event-Looks.',
    Nails: 'Clean Manicure, haltbare Beschichtung und dezentes Nail Design.',
    'Makeup & Brows': 'Make-up, Brows und Lashes für Tages- und Event-Looks.',
  },
}

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'category'

const toPriceNumber = (value: number | string): number => {
  if (typeof value === 'number') {
    return value
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

type DiscountSource = {
  price: number | string
  old_price?: number | string | null
  discount_percent?: number | null
  oldPrice?: string
  discountBadge?: string
}

export const formatEuroPrice = (value: number | string): string => {
  const amount = toPriceNumber(value)
  const formatted = Number.isInteger(amount)
    ? amount.toFixed(0)
    : amount.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')

  return `€${formatted}`
}

export const resolveServiceDiscount = (
  service: DiscountSource,
): { badge: string; oldPrice: string } | null => {
  if (service.oldPrice && service.discountBadge) {
    return {
      badge: service.discountBadge,
      oldPrice: service.oldPrice,
    }
  }

  const currentPrice = toPriceNumber(service.price)
  const oldPriceRaw = service.old_price
  if (oldPriceRaw === null || oldPriceRaw === undefined) {
    return null
  }

  const oldPrice = toPriceNumber(oldPriceRaw)
  if (!Number.isFinite(oldPrice) || oldPrice <= currentPrice) {
    return null
  }

  const percentFromApi =
    typeof service.discount_percent === 'number' && service.discount_percent > 0
      ? service.discount_percent
      : null
  const computedPercent = Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
  const discountPercent = percentFromApi ?? computedPercent
  if (!Number.isFinite(discountPercent) || discountPercent <= 0) {
    return null
  }

  return {
    badge: `-${discountPercent}%`,
    oldPrice: formatEuroPrice(oldPrice),
  }
}

const fallbackDescriptionByLang: Record<AppLanguageCode, string> = {
  ru: 'Описание скоро будет добавлено.',
  uk: 'Опис скоро буде додано.',
  de: 'Beschreibung wird bald ergänzt.',
}

const durationUnitByLang: Record<AppLanguageCode, string> = {
  ru: 'мин',
  uk: 'хв',
  de: 'Min',
}

const fallbackSummary = (language: AppLanguageCode, categoryName: string): string => {
  if (language === 'uk') {
    return `Актуальні процедури категорії ${categoryName}.`
  }
  if (language === 'de') {
    return `Aktuelle Behandlungen der Kategorie ${categoryName}.`
  }
  return `Актуальные процедуры категории ${categoryName}.`
}

const mapService = (service: ClientService, language: AppLanguageCode): ServiceItem => {
  const discount = resolveServiceDiscount(service)

  return {
    id: String(service.id),
    title: service.title,
    description: service.description ?? fallbackDescriptionByLang[language],
    duration: `${service.duration_minutes} ${durationUnitByLang[language]}`,
    price: formatEuroPrice(service.price),
    oldPrice: discount?.oldPrice,
    discountBadge: discount?.badge,
    popular: Boolean(discount),
  }
}

export const mapApiServicesToCatalog = (
  services: ClientService[],
  language: AppLanguageCode = 'ru',
): ServiceCategory[] => {
  const grouped = new Map<
    number,
    {
      name: string
      items: ServiceItem[]
    }
  >()
  const seenServiceIds = new Set<number>()

  services.forEach((service) => {
    if (seenServiceIds.has(service.id)) {
      return
    }
    seenServiceIds.add(service.id)

    const group = grouped.get(service.category_id) ?? {
      name: service.category,
      items: [],
    }
    if (!group.name && service.category) {
      group.name = service.category
    }
    group.items.push(mapService(service, language))
    grouped.set(service.category_id, group)
  })

  return Array.from(grouped.entries()).map(([categoryId, data]) => ({
    id: `${toSlug(data.name)}-${categoryId}`,
    name: data.name,
    summary:
      categorySummaries[language][data.name] ?? fallbackSummary(language, data.name),
    services: data.items,
  }))
}
