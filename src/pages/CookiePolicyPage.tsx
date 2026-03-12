import { useMemo, useState } from 'react'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { SALON_NAME } from '../config/salon'
import type { CookieCategoryKey } from '../content/legal-content'
import { getLegalContent } from '../content/legal-content'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { usePublicContact } from '../hooks/usePublicContact'
import { useSeo } from '../hooks/useSeo'
import {
  applyCookiePreferences,
  getCookiePreferences,
  persistCookiePreferences,
  type CookiePreferences,
} from '../utils/cookie-preferences'
import '../styles/section-page.scss'
import '../styles/legal-page.scss'

type TranslatedLabels = {
  table_storage_key: string
  table_storage_type: string
  table_storage_purpose: string
  table_storage_ttl: string
  table_storage_category: string
  table_service: string
  table_when: string
  table_data: string
  table_transfer: string
}

const getLabels = (language: 'ru' | 'uk' | 'de'): TranslatedLabels => {
  if (language === 'uk') {
    return {
      table_storage_key: 'Ключ',
      table_storage_type: 'Сховище',
      table_storage_purpose: 'Призначення',
      table_storage_ttl: 'Строк',
      table_storage_category: 'Категорія',
      table_service: 'Сервіс',
      table_when: 'Коли використовується',
      table_data: 'Які дані',
      table_transfer: 'Передача',
    }
  }

  if (language === 'de') {
    return {
      table_storage_key: 'Schluessel',
      table_storage_type: 'Speicher',
      table_storage_purpose: 'Zweck',
      table_storage_ttl: 'Speicherdauer',
      table_storage_category: 'Kategorie',
      table_service: 'Dienst',
      table_when: 'Wann verwendet',
      table_data: 'Daten',
      table_transfer: 'Uebermittlung',
    }
  }

  return {
    table_storage_key: 'Ключ',
    table_storage_type: 'Хранилище',
    table_storage_purpose: 'Назначение',
    table_storage_ttl: 'Срок',
    table_storage_category: 'Категория',
    table_service: 'Сервис',
    table_when: 'Когда используется',
    table_data: 'Какие данные',
    table_transfer: 'Передача',
  }
}

function CookiePolicyPage() {
  const { language } = useLanguage()
  const { contact } = usePublicContact()
  const { t } = useI18n()
  const legalContent = useMemo(
    () => getLegalContent(language, contact),
    [contact, language],
  )
  const cookieContent = legalContent.cookies
  const labels = useMemo(() => getLabels(language), [language])
  const [preferences, setPreferences] = useState<CookiePreferences>(() =>
    getCookiePreferences(),
  )
  const categoryTitleMap = useMemo(() => {
    const map: Record<CookieCategoryKey, string> = {
      necessary: '',
      functional: '',
      analytics: '',
      marketing: '',
    }

    cookieContent.categories.forEach((category) => {
      map[category.key] = category.title
    })

    return map
  }, [cookieContent.categories])

  const toggleCategory = (key: CookieCategoryKey) => {
    if (key === 'necessary') {
      return
    }

    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const savePreferences = (nextPreferences: CookiePreferences) => {
    const saved = persistCookiePreferences({
      necessary: true,
      functional: nextPreferences.functional,
      analytics: nextPreferences.analytics,
      marketing: nextPreferences.marketing,
    })
    applyCookiePreferences(saved)
    setPreferences(saved)
    window.location.reload()
  }

  useSeo({
    path: '/cookies',
    title: `${cookieContent.title} | ${SALON_NAME}`,
    description: cookieContent.description,
    keywords: [SALON_NAME, cookieContent.title, t('footer.cookies')],
  })

  return (
    <main className="section-page legal-page">
      <div className="section-page__glow section-page__glow--left" />
      <div className="section-page__glow section-page__glow--right" />

      <SiteNav />

      <SectionPageHero
        eyebrow={t('legal.eyebrow')}
        title={cookieContent.title}
        description={cookieContent.description}
      />

      <section className="legal-page__content">
        <p className="legal-page__updated">
          {t('legal.updated', { date: legalContent.updated_at })}
        </p>

        <article className="legal-page__section">
          <h2>{cookieContent.categories_title}</h2>
          <p>{cookieContent.intro}</p>
        </article>

        <article className="legal-page__section legal-page__section--settings">
          <h2>{cookieContent.settings_title}</h2>
          <div className="legal-page__category-grid">
            {cookieContent.categories.map((category) => {
              const isChecked =
                category.key === 'necessary' ? true : preferences[category.key]
              return (
                <div key={category.key} className="legal-page__category-card">
                  <label className="legal-page__toggle">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(category.key)}
                      disabled={Boolean(category.always_on)}
                    />
                    <span>{category.title}</span>
                  </label>
                  <p>{category.description}</p>
                  <p className="legal-page__meta">{category.legal_basis}</p>
                </div>
              )
            })}
          </div>
          <div className="legal-page__actions">
            <button
              type="button"
              className="legal-page__action legal-page__action--primary"
              onClick={() => savePreferences(preferences)}
            >
              {cookieContent.save_label}
            </button>
            <button
              type="button"
              className="legal-page__action"
              onClick={() =>
                savePreferences({
                  ...preferences,
                  functional: false,
                  analytics: false,
                  marketing: false,
                })
              }
            >
              {cookieContent.essentials_only_label}
            </button>
          </div>
          <p className="legal-page__meta">{cookieContent.reload_label}</p>
        </article>

        <article className="legal-page__section">
          <h2>{cookieContent.storage_title}</h2>
          <div className="legal-page__table-wrap">
            <table className="legal-page__table">
              <thead>
                <tr>
                  <th>{labels.table_storage_key}</th>
                  <th>{labels.table_storage_type}</th>
                  <th>{labels.table_storage_purpose}</th>
                  <th>{labels.table_storage_ttl}</th>
                  <th>{labels.table_storage_category}</th>
                </tr>
              </thead>
              <tbody>
                {cookieContent.storage_rows.map((row) => (
                  <tr key={row.key_name}>
                    <td>{row.key_name}</td>
                    <td>{row.storage}</td>
                    <td>{row.purpose}</td>
                    <td>{row.ttl}</td>
                    <td>{categoryTitleMap[row.category]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="legal-page__section">
          <h2>{cookieContent.third_party_title}</h2>
          <div className="legal-page__table-wrap">
            <table className="legal-page__table">
              <thead>
                <tr>
                  <th>{labels.table_service}</th>
                  <th>{labels.table_when}</th>
                  <th>{labels.table_data}</th>
                  <th>{labels.table_transfer}</th>
                </tr>
              </thead>
              <tbody>
                {cookieContent.third_party_rows.map((row) => (
                  <tr key={row.service}>
                    <td>{row.service}</td>
                    <td>{row.when_used}</td>
                    <td>{row.data}</td>
                    <td>{row.transfer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="legal-page__section">
          <h2>{cookieContent.rights_title}</h2>
          <p>{cookieContent.rights_text}</p>
        </article>
      </section>

      <SiteFooter />
    </main>
  )
}

export default CookiePolicyPage
