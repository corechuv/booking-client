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

const serviceDiscounts: Record<
  string,
  {
    badge: string
    oldPrice: string
  }
> = {
  'Glow Facial': { badge: '-11%', oldPrice: '€55' },
  'Hair Ritual + Styling': { badge: '-16%', oldPrice: '€83' },
  'Nail Signature': { badge: '-16%', oldPrice: '€45' },
}

export const resolveServiceDiscount = (service: {
  title: string
  title_i18n?: Record<string, string> | null
}) => {
  const fallbackDiscountKey =
    service.title_i18n?.ru ?? service.title_i18n?.en ?? service.title

  return (
    serviceDiscounts[service.title] ?? serviceDiscounts[fallbackDiscountKey] ?? null
  )
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

export const formatEuroPrice = (value: number | string): string => {
  const amount = toPriceNumber(value)
  const formatted = Number.isInteger(amount)
    ? amount.toFixed(0)
    : amount.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')

  return `€${formatted}`
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
