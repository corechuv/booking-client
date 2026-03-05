import { useMemo } from 'react'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { getLegalContent } from '../content/legal-content'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { usePublicContact } from '../hooks/usePublicContact'
import '../styles/section-page.scss'
import '../styles/legal-page.scss'

function ImpressumPage() {
  const { language } = useLanguage()
  const { contact } = usePublicContact()
  const { t } = useI18n()
  const legalContent = useMemo(
    () => getLegalContent(language, contact),
    [contact, language],
  )
  const content = legalContent.impressum

  return (
    <main className="section-page legal-page">
      <div className="section-page__glow section-page__glow--left" />
      <div className="section-page__glow section-page__glow--right" />

      <SiteNav />

      <SectionPageHero
        eyebrow={t('legal.eyebrow')}
        title={content.title}
        description={content.description}
      />

      <section className="legal-page__content">
        <p className="legal-page__updated">
          {t('legal.updated', { date: legalContent.updated_at })}
        </p>

        {content.sections.map((section) => (
          <article key={section.title} className="legal-page__section">
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${section.title}-paragraph-${index}`}>{paragraph}</p>
            ))}
            {section.list ? (
              <ul className="legal-page__list">
                {section.list.map((entry, index) => (
                  <li key={`${section.title}-list-${index}`}>{entry}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <SiteFooter />
    </main>
  )
}

export default ImpressumPage
