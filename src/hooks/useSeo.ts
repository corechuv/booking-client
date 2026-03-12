import { useEffect, useMemo } from 'react'
import {
  SALON_ADDRESS,
  SALON_NAME,
  SALON_PHONE,
  SALON_ROUTE_URL,
} from '../config/salon'
import { useLanguage } from '../context/language-context'

type SeoJsonLd = Record<string, unknown>

type UseSeoPayload = {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: SeoJsonLd | SeoJsonLd[]
}

const SITE_URL_FALLBACK = 'https://center-mira.com'

const LOCALE_BY_LANGUAGE = {
  ru: 'ru-RU',
  uk: 'uk-UA',
  de: 'de-DE',
} as const

const OGP_LOCALE_BY_LANGUAGE = {
  ru: 'ru_RU',
  uk: 'uk_UA',
  de: 'de_DE',
} as const

const resolveSiteUrl = (): string => {
  const envSiteUrl =
    (import.meta.env.VITE_SITE_URL as string | undefined)?.trim() ?? ''
  if (envSiteUrl) {
    return envSiteUrl.replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '')
  }
  return SITE_URL_FALLBACK
}

const toAbsoluteUrl = (value: string, siteUrl: string): string => {
  if (!value) {
    return siteUrl
  }
  if (/^https?:\/\//i.test(value)) {
    return value
  }
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`
}

const ensureMeta = (
  attr: 'name' | 'property',
  key: string,
  content: string,
): void => {
  if (typeof document === 'undefined') {
    return
  }
  const selector = `meta[${attr}="${key}"]`
  let element = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    element.setAttribute('data-seo-managed', 'true')
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

const ensureCanonical = (href: string): void => {
  if (typeof document === 'undefined') {
    return
  }
  let element = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    element.setAttribute('data-seo-managed', 'true')
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

const ensureStructuredData = (payload: SeoJsonLd): void => {
  if (typeof document === 'undefined') {
    return
  }
  const current = document.getElementById('seo-structured-data')
  if (current?.parentNode) {
    current.parentNode.removeChild(current)
  }
  const element = document.createElement('script')
  element.id = 'seo-structured-data'
  element.type = 'application/ld+json'
  element.setAttribute('data-seo-managed', 'true')
  element.text = JSON.stringify(payload)
  document.head.appendChild(element)
}

const normalizePath = (path: string): string => {
  if (!path) {
    return '/'
  }
  return path.startsWith('/') ? path : `/${path}`
}

export const useSeo = ({
  title,
  description,
  path,
  keywords = [],
  image = '/logo_full.png',
  type = 'website',
  noindex = false,
  jsonLd,
}: UseSeoPayload): void => {
  const { language } = useLanguage()

  const seoData = useMemo(() => {
    const siteUrl = resolveSiteUrl()
    const normalizedPath = normalizePath(path)
    const pageUrl = `${siteUrl}${normalizedPath}`
    const imageUrl = toAbsoluteUrl(image, siteUrl)
    const localeTag = LOCALE_BY_LANGUAGE[language]
    const ogpLocale = OGP_LOCALE_BY_LANGUAGE[language]
    const keywordsValue = keywords
      .map((item) => item.trim())
      .filter(Boolean)
      .join(', ')

    const additionalGraph = Array.isArray(jsonLd)
      ? jsonLd
      : jsonLd
        ? [jsonLd]
        : []

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}#website`,
          url: siteUrl,
          name: SALON_NAME,
          inLanguage: localeTag,
        },
        {
          '@type': 'BeautySalon',
          '@id': `${siteUrl}#salon`,
          name: SALON_NAME,
          telephone: SALON_PHONE,
          url: siteUrl,
          image: imageUrl,
          address: {
            '@type': 'PostalAddress',
            streetAddress: SALON_ADDRESS,
            addressLocality: 'Hamburg',
            addressCountry: 'DE',
          },
          hasMap: SALON_ROUTE_URL,
        },
        {
          '@type': 'WebPage',
          '@id': `${pageUrl}#webpage`,
          url: pageUrl,
          name: title,
          description,
          inLanguage: localeTag,
          isPartOf: {
            '@id': `${siteUrl}#website`,
          },
        },
        ...additionalGraph,
      ],
    }

    return {
      pageUrl,
      imageUrl,
      localeTag,
      ogpLocale,
      keywordsValue,
      structuredData,
    }
  }, [description, image, jsonLd, keywords, language, path, title])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    document.title = title

    ensureMeta('name', 'description', description)
    ensureMeta('name', 'language', language)
    ensureMeta('name', 'content-language', language)
    ensureMeta(
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow, noarchive'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    )
    ensureMeta('property', 'og:title', title)
    ensureMeta('property', 'og:description', description)
    ensureMeta('property', 'og:type', type)
    ensureMeta('property', 'og:url', seoData.pageUrl)
    ensureMeta('property', 'og:site_name', SALON_NAME)
    ensureMeta('property', 'og:locale', seoData.ogpLocale)
    ensureMeta('property', 'og:image', seoData.imageUrl)
    ensureMeta('name', 'twitter:card', 'summary_large_image')
    ensureMeta('name', 'twitter:title', title)
    ensureMeta('name', 'twitter:description', description)
    ensureMeta('name', 'twitter:image', seoData.imageUrl)

    ensureMeta('name', 'keywords', seoData.keywordsValue || SALON_NAME)

    ensureCanonical(seoData.pageUrl)
    ensureStructuredData(seoData.structuredData)
  }, [description, language, noindex, seoData, title, type])
}
