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

const INDEXABLE_ROUTES = [
  {
    path: '/',
    title: {
      ru: 'Mira beauty salon | Каталог процедур и онлайн-запись',
      uk: 'Mira beauty salon | Каталог процедур і онлайн-запис',
      de: 'Mira beauty salon | Leistungen und Online-Terminbuchung',
    },
    description: {
      ru: 'Mira beauty salon в Hamburg: каталог процедур, онлайн-запись, специалисты, цены и контакты.',
      uk: 'Mira beauty salon у Hamburg: каталог процедур, онлайн-запис, спеціалісти, ціни та контакти.',
      de: 'Mira beauty salon in Hamburg: Leistungskatalog, Online-Termine, Spezialisten, Preise und Kontakte.',
    },
    keywords: {
      ru: 'Mira beauty salon, Hamburg, beauty salon, каталог процедур, онлайн запись',
      uk: 'Mira beauty salon, Hamburg, beauty salon, каталог процедур, онлайн запис',
      de: 'Mira beauty salon, Hamburg, Beauty Salon, Leistungen, Online Termin',
    },
  },
  {
    path: '/catalog',
    title: {
      ru: 'Каталог процедур | Mira beauty salon',
      uk: 'Каталог процедур | Mira beauty salon',
      de: 'Leistungskatalog | Mira beauty salon',
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
      ru: 'Специалисты | Mira beauty salon',
      uk: 'Спеціалісти | Mira beauty salon',
      de: 'Spezialisten | Mira beauty salon',
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
      ru: 'Цены | Mira beauty salon',
      uk: 'Ціни | Mira beauty salon',
      de: 'Preise | Mira beauty salon',
    },
    description: {
      ru: 'Актуальные цены на процедуры Mira beauty salon в Hamburg.',
      uk: 'Актуальні ціни на процедури Mira beauty salon у Hamburg.',
      de: 'Aktuelle Preise fur Behandlungen im Mira beauty salon in Hamburg.',
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
      ru: 'Вдохновение | Mira beauty salon',
      uk: 'Натхнення | Mira beauty salon',
      de: 'Inspiration | Mira beauty salon',
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
      ru: 'Контакты | Mira beauty salon',
      uk: 'Контакти | Mira beauty salon',
      de: 'Kontakte | Mira beauty salon',
    },
    description: {
      ru: 'Адрес, телефон, карта и график работы Mira beauty salon.',
      uk: 'Адреса, телефон, мапа та графік роботи Mira beauty salon.',
      de: 'Adresse, Telefon, Karte und Offnungszeiten des Mira beauty salon.',
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
      ru: 'FAQ | Mira beauty salon',
      uk: 'FAQ | Mira beauty salon',
      de: 'FAQ | Mira beauty salon',
    },
    description: {
      ru: 'Частые вопросы по услугам и записи в Mira beauty salon.',
      uk: 'Часті питання щодо послуг і запису в Mira beauty salon.',
      de: 'Haufige Fragen zu Leistungen und Buchung im Mira beauty salon.',
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
      ru: 'Онлайн-запись | Mira beauty salon',
      uk: 'Онлайн-запис | Mira beauty salon',
      de: 'Online-Termin | Mira beauty salon',
    },
    description: {
      ru: 'Подтвердите дату и слот онлайн-записи в Mira beauty salon.',
      uk: 'Підтвердьте дату та слот онлайн-запису в Mira beauty salon.',
      de: 'Bestatigen Sie Datum und Zeitslot Ihrer Online-Buchung im Mira beauty salon.',
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
      ru: 'Политика конфиденциальности | Mira beauty salon',
      uk: 'Політика конфіденційності | Mira beauty salon',
      de: 'Datenschutz | Mira beauty salon',
    },
    description: {
      ru: 'Политика обработки персональных данных Mira beauty salon.',
      uk: 'Політика обробки персональних даних Mira beauty salon.',
      de: 'Datenschutzerklarung des Mira beauty salon.',
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
      ru: 'Условия записи | Mira beauty salon',
      uk: 'Умови запису | Mira beauty salon',
      de: 'Buchungsbedingungen | Mira beauty salon',
    },
    description: {
      ru: 'Условия бронирования и обслуживания Mira beauty salon.',
      uk: 'Умови бронювання та обслуговування Mira beauty salon.',
      de: 'Buchungs- und Servicebedingungen des Mira beauty salon.',
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
      ru: 'Cookie policy | Mira beauty salon',
      uk: 'Cookie policy | Mira beauty salon',
      de: 'Cookie-Richtlinie | Mira beauty salon',
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
      ru: 'Impressum | Mira beauty salon',
      uk: 'Impressum | Mira beauty salon',
      de: 'Impressum | Mira beauty salon',
    },
    description: {
      ru: 'Юридическая информация компании Mira beauty salon.',
      uk: 'Юридична інформація компанії Mira beauty salon.',
      de: 'Rechtliche Anbieterkennzeichnung des Mira beauty salon.',
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

const setStructuredData = ($, title, description, pageUrl, locale) => {
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: 'Mira beauty salon',
        inLanguage: locale,
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: locale,
      },
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

const createPageHtml = ({ template, language, route, noindex }) => {
  const $ = load(template, { decodeEntities: false })
  const title = route.title[language.code] ?? route.title.ru
  const description = route.description[language.code] ?? route.description.ru
  const keywords = route.keywords[language.code] ?? route.keywords.ru
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
  upsertMeta($, 'property', 'og:site_name', 'Mira beauty salon')
  upsertMeta($, 'property', 'og:locale', language.ogLocale)
  upsertMeta($, 'property', 'og:url', pageUrl)
  upsertMeta($, 'property', 'og:image', `${SITE_URL}/logo_full.png`)
  upsertMeta($, 'name', 'twitter:card', 'summary_large_image')
  upsertMeta($, 'name', 'twitter:title', title)
  upsertMeta($, 'name', 'twitter:description', description)
  upsertMeta($, 'name', 'twitter:image', `${SITE_URL}/logo_full.png`)
  upsertCanonical($, pageUrl)
  setAlternates($, route.path)
  setStructuredData($, title, description, pageUrl, language.locale)

  return $.html()
}

const writeRoutePage = async (pathName, html) => {
  const cleanedPath = pathName.replace(/^\/+/, '')
  const targetDir = path.join(DIST_DIR, cleanedPath)
  await fs.mkdir(targetDir, { recursive: true })
  await fs.writeFile(path.join(targetDir, 'index.html'), html, 'utf8')
}

const generateSitemapXml = () => {
  const date = new Date().toISOString().slice(0, 10)
  const urls = []
  for (const language of LANGUAGES) {
    for (const route of INDEXABLE_ROUTES) {
      urls.push(toAbsoluteUrl(toLocalizedPath(language.code, route.path)))
    }
  }

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
          ru: 'Служебная страница | Mira beauty salon',
          uk: 'Службова сторінка | Mira beauty salon',
          de: 'Service-Seite | Mira beauty salon',
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
        ru: '404 | Mira beauty salon',
        uk: '404 | Mira beauty salon',
        de: '404 | Mira beauty salon',
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

