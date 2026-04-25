import fs from 'node:fs/promises'
import path from 'node:path'
import { load } from 'cheerio'

const DIST_DIR = path.resolve(process.cwd(), 'dist')
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html')
const SITE_URL = (
  process.env.VITE_SITE_URL
  || process.env.SITE_URL
  || 'https://center-mira.com'
).trim().replace(/\/+$/, '')

const LANGUAGES = [
  { code: 'ru', locale: 'ru-RU', ogLocale: 'ru_RU' },
  { code: 'uk', locale: 'uk-UA', ogLocale: 'uk_UA' },
  { code: 'de', locale: 'de-DE', ogLocale: 'de_DE' },
]

const SALON_BRAND = 'Mira Beauty Salon'
const SALON_CITY = 'Hamburg'
const SALON_STREET = 'Neue Große Bergstraße 7'
const SALON_POSTAL_CODE = '22767'
const SALON_COUNTRY_CODE = 'DE'

const GEO_KEYWORDS = {
  ru: ['Гамбург', 'Hamburg', SALON_POSTAL_CODE, SALON_STREET, 'онлайн-запись'],
  uk: ['Гамбург', 'Hamburg', SALON_POSTAL_CODE, SALON_STREET, 'онлайн-запис'],
  de: ['Hamburg', SALON_POSTAL_CODE, SALON_STREET, 'Online-Terminbuchung'],
}

const DEFAULT_API_BASE_URL = 'https://mira-booking-api-prod.onrender.com/api/v1'
const API_BASE_URL = (
  process.env.VITE_API_URL
  || process.env.API_BASE_URL
  || DEFAULT_API_BASE_URL
).trim().replace(/\/+$/, '')

const SLUG_CHAR_MAP = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  ґ: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  є: 'ye',
  ж: 'zh',
  з: 'z',
  и: 'i',
  і: 'i',
  ї: 'yi',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
}

const toLocalizedField = (languageCode, value) => ({
  ru: value,
  uk: value,
  de: value,
  [languageCode]: value,
})

const slugifyLabel = (value) => {
  const transliterated = value
    .split('')
    .map((char) => {
      const lower = char.toLowerCase()
      return SLUG_CHAR_MAP[lower] ?? char
    })
    .join('')

  const normalized = transliterated
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`"]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return normalized || 'category'
}

const buildCategorySlug = (name, id) => `${slugifyLabel(name)}-${id}`

const categoryFallbackSummary = (languageCode, categoryName) => {
  if (languageCode === 'uk') {
    return `Актуальні процедури категорії ${categoryName}.`
  }
  if (languageCode === 'de') {
    return `Aktuelle Behandlungen der Kategorie ${categoryName}.`
  }
  return `Актуальные процедуры категории ${categoryName}.`
}

const fetchJsonSafe = async (url) => {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch {
    return null
  }
}

const loadCatalogSeoData = async () => {
  const result = {}

  await Promise.all(
    LANGUAGES.map(async (language) => {
      const [categoriesRaw, servicesRaw] = await Promise.all([
        fetchJsonSafe(`${API_BASE_URL}/client/categories?lang=${language.code}`),
        fetchJsonSafe(`${API_BASE_URL}/client/services?lang=${language.code}`),
      ])

      const categories = Array.isArray(categoriesRaw)
        ? categoriesRaw.filter(
            (item) =>
              item
              && typeof item === 'object'
              && typeof item.id === 'number'
              && typeof item.name === 'string'
              && item.name.trim().length > 0,
          )
        : []

      const services = Array.isArray(servicesRaw)
        ? servicesRaw.filter(
            (item) =>
              item
              && typeof item === 'object'
              && typeof item.title === 'string'
              && item.title.trim().length > 0
              && typeof item.category_id === 'number',
          )
        : []

      const servicesByCategory = new Map()
      services.forEach((service) => {
        const list = servicesByCategory.get(service.category_id) ?? []
        list.push(service)
        servicesByCategory.set(service.category_id, list)
      })

      const categoryRoutes = categories.map((category) => {
        const slug = buildCategorySlug(category.name, category.id)
        const categoryServices = servicesByCategory.get(category.id) ?? []
        const categorySummary =
          typeof category.description === 'string' && category.description.trim()
            ? category.description.trim()
            : categoryFallbackSummary(language.code, category.name)
        const serviceTitles = categoryServices
          .map((service) => service.title.trim())
          .filter(Boolean)
        const description = serviceTitles.length
          ? `${categorySummary} ${serviceTitles.slice(0, 8).join(', ')}.`
          : categorySummary
        const keywordParts = Array.from(
          new Set(
            [
              category.name,
              `${category.name} ${SALON_CITY}`,
              `${category.name} ${SALON_BRAND}`,
              ...serviceTitles.slice(0, 20),
            ]
              .map((item) => item.trim())
              .filter(Boolean),
          ),
        )

        return {
          path: `/catalog/${slug}`,
          title: toLocalizedField(
            language.code,
            `${category.name} | ${SALON_BRAND}`,
          ),
          description: toLocalizedField(language.code, description),
          keywords: toLocalizedField(language.code, keywordParts.join(', ')),
          extraGraph: {
            '@type': 'ItemList',
            name: category.name,
            numberOfItems: serviceTitles.length || 1,
            itemListElement: (serviceTitles.length
              ? serviceTitles
              : [category.name]
            ).slice(0, 40).map((name, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': serviceTitles.length ? 'Service' : 'Thing',
                name,
                category: category.name,
              },
            })),
          },
        }
      })

      result[language.code] = {
        categories,
        services,
        categoryRoutes,
      }
    }),
  )

  return result
}

const INDEXABLE_ROUTES = [
  {
    path: '/',
    title: {
      ru: 'Mira Beauty Salon — онлайн-запись в Hamburg',
      uk: 'Mira Beauty Salon — онлайн-запис у Hamburg',
      de: 'Mira Beauty Salon — Online-Terminbuchung in Hamburg',
    },
    description: {
      ru: 'Mira Beauty Salon в Hamburg: каталог процедур, онлайн-запись, специалисты, цены и контакты.',
      uk: 'Mira Beauty Salon у Hamburg: каталог процедур, онлайн-запис, спеціалісти, ціни та контакти.',
      de: 'Mira Beauty Salon in Hamburg: Leistungskatalog, Online-Termine, Spezialisten, Preise und Kontakte.',
    },
    keywords: {
      ru: 'Mira Beauty Salon, Hamburg, beauty salon, каталог процедур, онлайн запись',
      uk: 'Mira Beauty Salon, Hamburg, beauty salon, каталог процедур, онлайн запис',
      de: 'Mira Beauty Salon, Hamburg, Beauty Salon, Leistungen, Online Termin',
    },
  },
  {
    path: '/catalog',
    title: {
      ru: 'Каталог процедур | Mira Beauty Salon',
      uk: 'Каталог процедур | Mira Beauty Salon',
      de: 'Leistungskatalog | Mira Beauty Salon',
    },
    description: {
      ru: 'Выберите категорию и услугу в каталоге Mira и перейдите к онлайн-записи.',
      uk: 'Оберіть категорію та послугу в каталозі Mira і переходьте до онлайн-запису.',
      de: 'Wahlen Sie Kategorie und Leistung im Mira-Katalog und buchen Sie online.',
    },
    keywords: {
      ru: 'каталог процедур, услуги салона, Mira Hamburg',
      uk: 'каталог процедур, послуги салону, Mira Hamburg',
      de: 'Leistungskatalog, Salon Leistungen, Mira Hamburg',
    },
  },
  {
    path: '/specialists',
    title: {
      ru: 'Специалисты | Mira Beauty Salon',
      uk: 'Спеціалісти | Mira Beauty Salon',
      de: 'Spezialisten | Mira Beauty Salon',
    },
    description: {
      ru: 'Команда специалистов Mira и направления работы в Hamburg.',
      uk: 'Команда спеціалістів Mira та напрями роботи в Hamburg.',
      de: 'Das Team der Mira-Spezialisten und ihre Fachbereiche in Hamburg.',
    },
    keywords: {
      ru: 'специалисты, косметолог, hair stylist, Hamburg',
      uk: 'спеціалісти, косметолог, hair stylist, Hamburg',
      de: 'Spezialisten, Kosmetologin, Hair Stylist, Hamburg',
    },
  },
  {
    path: '/pricing',
    title: {
      ru: 'Цены | Mira Beauty Salon',
      uk: 'Ціни | Mira Beauty Salon',
      de: 'Preise | Mira Beauty Salon',
    },
    description: {
      ru: 'Актуальные цены на процедуры Mira Beauty Salon в Hamburg.',
      uk: 'Актуальні ціни на процедури Mira Beauty Salon у Hamburg.',
      de: 'Aktuelle Preise fur Behandlungen im Mira Beauty Salon in Hamburg.',
    },
    keywords: {
      ru: 'цены, прайс, процедуры, Mira Hamburg',
      uk: 'ціни, прайс, процедури, Mira Hamburg',
      de: 'Preise, Beauty Behandlungen, Mira Hamburg',
    },
  },
  {
    path: '/inspiration',
    title: {
      ru: 'Вдохновение | Mira Beauty Salon',
      uk: 'Натхнення | Mira Beauty Salon',
      de: 'Inspiration | Mira Beauty Salon',
    },
    description: {
      ru: 'Идеи образов и подбор направлений процедур Mira.',
      uk: 'Ідеї образів та підбір напрямів процедур Mira.',
      de: 'Inspiration fur Looks und Auswahl von Mira-Behandlungsrichtungen.',
    },
    keywords: {
      ru: 'inspiration, beauty look, Mira salon',
      uk: 'inspiration, beauty look, Mira salon',
      de: 'Inspiration, Beauty Look, Mira Salon',
    },
  },
  {
    path: '/contacts',
    title: {
      ru: 'Контакты | Mira Beauty Salon',
      uk: 'Контакти | Mira Beauty Salon',
      de: 'Kontakte | Mira Beauty Salon',
    },
    description: {
      ru: 'Адрес, телефон, карта и график работы Mira Beauty Salon.',
      uk: 'Адреса, телефон, мапа та графік роботи Mira Beauty Salon.',
      de: 'Adresse, Telefon, Karte und Offnungszeiten des Mira Beauty Salon.',
    },
    keywords: {
      ru: 'контакты, адрес, телефон, Hamburg salon',
      uk: 'контакти, адреса, телефон, Hamburg salon',
      de: 'Kontakte, Adresse, Telefon, Hamburg Salon',
    },
  },
  {
    path: '/faq',
    title: {
      ru: 'FAQ | Mira Beauty Salon',
      uk: 'FAQ | Mira Beauty Salon',
      de: 'FAQ | Mira Beauty Salon',
    },
    description: {
      ru: 'Частые вопросы по услугам и записи в Mira Beauty Salon.',
      uk: 'Часті питання щодо послуг і запису в Mira Beauty Salon.',
      de: 'Haufige Fragen zu Leistungen und Buchung im Mira Beauty Salon.',
    },
    keywords: {
      ru: 'faq, вопросы, запись, Mira salon',
      uk: 'faq, питання, запис, Mira salon',
      de: 'faq, Fragen, Termin, Mira salon',
    },
  },
  {
    path: '/booking',
    title: {
      ru: 'Онлайн-запись | Mira Beauty Salon',
      uk: 'Онлайн-запис | Mira Beauty Salon',
      de: 'Online-Termin | Mira Beauty Salon',
    },
    description: {
      ru: 'Подтвердите дату и слот онлайн-записи в Mira Beauty Salon.',
      uk: 'Підтвердьте дату та слот онлайн-запису в Mira Beauty Salon.',
      de: 'Bestatigen Sie Datum und Zeitslot Ihrer Online-Buchung im Mira Beauty Salon.',
    },
    keywords: {
      ru: 'запись онлайн, booking, Mira Hamburg',
      uk: 'онлайн запис, booking, Mira Hamburg',
      de: 'Online Termin, Booking, Mira Hamburg',
    },
  },
  {
    path: '/privacy',
    title: {
      ru: 'Политика конфиденциальности | Mira Beauty Salon',
      uk: 'Політика конфіденційності | Mira Beauty Salon',
      de: 'Datenschutz | Mira Beauty Salon',
    },
    description: {
      ru: 'Политика обработки персональных данных Mira Beauty Salon.',
      uk: 'Політика обробки персональних даних Mira Beauty Salon.',
      de: 'Datenschutzerklarung des Mira Beauty Salon.',
    },
    keywords: {
      ru: 'privacy policy, персональные данные, Mira',
      uk: 'privacy policy, персональні дані, Mira',
      de: 'Datenschutz, personenbezogene Daten, Mira',
    },
  },
  {
    path: '/terms',
    title: {
      ru: 'Условия записи | Mira Beauty Salon',
      uk: 'Умови запису | Mira Beauty Salon',
      de: 'Buchungsbedingungen | Mira Beauty Salon',
    },
    description: {
      ru: 'Условия бронирования и обслуживания Mira Beauty Salon.',
      uk: 'Умови бронювання та обслуговування Mira Beauty Salon.',
      de: 'Buchungs- und Servicebedingungen des Mira Beauty Salon.',
    },
    keywords: {
      ru: 'условия записи, booking terms, Mira',
      uk: 'умови запису, booking terms, Mira',
      de: 'Buchungsbedingungen, Mira',
    },
  },
  {
    path: '/cookies',
    title: {
      ru: 'Cookie policy | Mira Beauty Salon',
      uk: 'Cookie policy | Mira Beauty Salon',
      de: 'Cookie-Richtlinie | Mira Beauty Salon',
    },
    description: {
      ru: 'Информация об использовании cookies и локального хранения.',
      uk: 'Інформація про використання cookies та локального сховища.',
      de: 'Informationen zur Nutzung von Cookies und lokalem Speicher.',
    },
    keywords: {
      ru: 'cookies, storage policy, Mira',
      uk: 'cookies, storage policy, Mira',
      de: 'Cookies, Speicher-Richtlinie, Mira',
    },
  },
  {
    path: '/impressum',
    title: {
      ru: 'Impressum | Mira Beauty Salon',
      uk: 'Impressum | Mira Beauty Salon',
      de: 'Impressum | Mira Beauty Salon',
    },
    description: {
      ru: 'Юридическая информация компании Mira Beauty Salon.',
      uk: 'Юридична інформація компанії Mira Beauty Salon.',
      de: 'Rechtliche Anbieterkennzeichnung des Mira Beauty Salon.',
    },
    keywords: {
      ru: 'impressum, legal, Mira',
      uk: 'impressum, legal, Mira',
      de: 'Impressum, Legal, Mira',
    },
  },
]

const NOINDEX_ROUTES = [
  '/booking/success',
  '/booking/confirmed',
]

const toLocalizedPath = (languageCode, routePath) =>
  routePath === '/' ? `/${languageCode}` : `/${languageCode}${routePath}`

const toAbsoluteUrl = (pathValue) => `${SITE_URL}${pathValue}`

const upsertMeta = ($, attribute, key, value) => {
  const selector = `meta[${attribute}="${key}"]`
  if ($(selector).length) {
    $(selector).attr('content', value)
  } else {
    $('head').append(`<meta ${attribute}="${key}" content="${value}" />`)
  }
}

const upsertCanonical = ($, href) => {
  const selector = 'link[rel="canonical"]'
  if ($(selector).length) {
    $(selector).attr('href', href)
  } else {
    $('head').append(`<link rel="canonical" href="${href}" />`)
  }
}

const setAlternates = ($, routePath) => {
  $('link[rel="alternate"]').remove()
  LANGUAGES.forEach((language) => {
    const href = toAbsoluteUrl(toLocalizedPath(language.code, routePath))
    $('head').append(
      `<link rel="alternate" hreflang="${language.locale}" href="${href}" />`,
    )
  })
  $('head').append(
    `<link rel="alternate" hreflang="x-default" href="${toAbsoluteUrl(
      toLocalizedPath('ru', routePath),
    )}" />`,
  )
}

const removeInlineLanguageScript = ($) => {
  $('head script').each((_, node) => {
    const source = $(node).html() ?? ''
    if (source.includes("document.documentElement.setAttribute('lang', 'ru-RU')")) {
      $(node).remove()
    }
  })
}

const setStructuredData = (
  $,
  title,
  description,
  pageUrl,
  locale,
  extraGraph = [],
) => {
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: SALON_BRAND,
        inLanguage: locale,
      },
      {
        '@type': 'BeautySalon',
        '@id': `${SITE_URL}#salon`,
        name: SALON_BRAND,
        url: SITE_URL,
        telephone: '+49 176 717 668 51',
        image: `${SITE_URL}/logo_full.png`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: SALON_STREET,
          postalCode: SALON_POSTAL_CODE,
          addressLocality: SALON_CITY,
          addressCountry: SALON_COUNTRY_CODE,
        },
        hasMap: 'https://maps.google.com/?q=Hamburg+Neue+Große+Bergstraße+7',
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: locale,
      },
      ...extraGraph,
    ],
  }

  const selector = '#seo-structured-data'
  if ($(selector).length) {
    $(selector).text(JSON.stringify(payload))
  } else {
    $('head').append(
      `<script id="seo-structured-data" type="application/ld+json">${JSON.stringify(payload)}</script>`,
    )
  }
}

const createPageHtml = ({
  template,
  language,
  route,
  noindex,
  titleOverride,
  descriptionOverride,
  extraKeywords = [],
  extraGraph = [],
}) => {
  const $ = load(template, { decodeEntities: false })
  const title = titleOverride ?? route.title[language.code] ?? route.title.ru
  const description =
    descriptionOverride ?? route.description[language.code] ?? route.description.ru
  const routeKeywords = route.keywords[language.code] ?? route.keywords.ru
  const keywords = Array.from(
    new Set(
      `${routeKeywords}, ${extraKeywords.join(', ')}, ${SALON_BRAND}, ${GEO_KEYWORDS[language.code].join(', ')}`
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).join(', ')
  const localizedPath = toLocalizedPath(language.code, route.path)
  const pageUrl = toAbsoluteUrl(localizedPath)

  removeInlineLanguageScript($)
  $('html')
    .attr('lang', language.locale)
    .attr('xml:lang', language.locale)
    .attr('translate', 'yes')

  $('title').text(title)
  upsertMeta($, 'name', 'content-language', language.code)
  upsertMeta($, 'name', 'language', language.code)
  upsertMeta($, 'name', 'description', description)
  upsertMeta($, 'name', 'keywords', keywords)
  upsertMeta(
    $,
    'name',
    'robots',
    noindex
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  )
  upsertMeta($, 'property', 'og:title', title)
  upsertMeta($, 'property', 'og:description', description)
  upsertMeta($, 'property', 'og:type', 'website')
  upsertMeta($, 'property', 'og:site_name', SALON_BRAND)
  upsertMeta($, 'property', 'og:locale', language.ogLocale)
  upsertMeta($, 'property', 'og:url', pageUrl)
  upsertMeta($, 'property', 'og:image', `${SITE_URL}/logo_full.png`)
  upsertMeta($, 'name', 'twitter:card', 'summary_large_image')
  upsertMeta($, 'name', 'twitter:title', title)
  upsertMeta($, 'name', 'twitter:description', description)
  upsertMeta($, 'name', 'twitter:image', `${SITE_URL}/logo_full.png`)
  upsertCanonical($, pageUrl)
  setAlternates($, route.path)
  setStructuredData($, title, description, pageUrl, language.locale, extraGraph)

  return $.html()
}

const writeRoutePage = async (pathName, html) => {
  const cleanedPath = pathName.replace(/^\/+/, '')
  const targetDir = path.join(DIST_DIR, cleanedPath)
  await fs.mkdir(targetDir, { recursive: true })
  await fs.writeFile(path.join(targetDir, 'index.html'), html, 'utf8')
}

const generateSitemapXml = (localizedPaths) => {
  const date = new Date().toISOString().slice(0, 10)
  const urls = Array.from(new Set(localizedPaths)).map((item) => toAbsoluteUrl(item))

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (href) =>
        `  <url><loc>${href}</loc><lastmod>${date}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n')
}

const generateRobotsTxt = () => [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin',
  'Disallow: /ru/admin',
  'Disallow: /uk/admin',
  'Disallow: /de/admin',
  'Disallow: /ru/booking/success',
  'Disallow: /uk/booking/success',
  'Disallow: /de/booking/success',
  'Disallow: /ru/booking/confirmed',
  'Disallow: /uk/booking/confirmed',
  'Disallow: /de/booking/confirmed',
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n')

const main = async () => {
  const template = await fs.readFile(TEMPLATE_PATH, 'utf8')

  for (const language of LANGUAGES) {
    for (const route of INDEXABLE_ROUTES) {
      const html = createPageHtml({
        template,
        language,
        route,
        noindex: false,
      })
      await writeRoutePage(toLocalizedPath(language.code, route.path), html)
    }

    for (const routePath of NOINDEX_ROUTES) {
      const base = {
        path: routePath,
        title: {
          ru: 'Служебная страница | Mira Beauty Salon',
          uk: 'Службова сторінка | Mira Beauty Salon',
          de: 'Service-Seite | Mira Beauty Salon',
        },
        description: {
          ru: 'Служебная страница подтверждения записи.',
          uk: 'Службова сторінка підтвердження запису.',
          de: 'Service-Seite fur Buchungsbestatigung.',
        },
        keywords: {
          ru: 'booking confirmation',
          uk: 'booking confirmation',
          de: 'booking confirmation',
        },
      }

      const html = createPageHtml({
        template,
        language,
        route: base,
        noindex: true,
      })
      await writeRoutePage(toLocalizedPath(language.code, routePath), html)
    }
  }

  const notFoundHtml = createPageHtml({
    template,
    language: LANGUAGES[0],
    route: {
      path: '/404',
      title: {
        ru: '404 | Mira Beauty Salon',
        uk: '404 | Mira Beauty Salon',
        de: '404 | Mira Beauty Salon',
      },
      description: {
        ru: 'Страница не найдена.',
        uk: 'Сторінку не знайдено.',
        de: 'Seite nicht gefunden.',
      },
      keywords: {
        ru: '404',
        uk: '404',
        de: '404',
      },
    },
    noindex: true,
  })

  await fs.writeFile(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf8')
  await fs.writeFile(path.join(DIST_DIR, 'sitemap.xml'), generateSitemapXml(), 'utf8')
  await fs.writeFile(path.join(DIST_DIR, 'robots.txt'), generateRobotsTxt(), 'utf8')
}

void main()
