import { useMemo } from 'react'
import SectionPageHero from '../components/SectionPageHero'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { getLegalContent } from '../content/legal-content'
import { SALON_NAME } from '../config/salon'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { usePublicContact } from '../hooks/usePublicContact'
import { useSeo } from '../hooks/useSeo'
import '../styles/section-page.scss'
import '../styles/legal-page.scss'

function TermsPage() {
  const { language } = useLanguage()
  const { contact } = usePublicContact()
  const { t } = useI18n()
  const legalContent = useMemo(
    () => getLegalContent(language, contact),
    [contact, language],
  )
  const content = legalContent.terms

  useSeo({
    path: '/terms',
    title: `${content.title} | ${SALON_NAME}`,
    description: content.description,
    keywords: [SALON_NAME, content.title, t('footer.terms')],
  })

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

        {content.sections.map((item) => (
          <article key={item.title} className="legal-page__section">
            <h2>{item.title}</h2>
            {item.paragraphs.map((paragraph, index) => (
              <p key={`${item.title}-paragraph-${index}`}>{paragraph}</p>
            ))}
            {item.list ? (
              <ul className="legal-page__list">
                {item.list.map((entry, index) => (
                  <li key={`${item.title}-list-${index}`}>{entry}</li>
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

export default TermsPage
