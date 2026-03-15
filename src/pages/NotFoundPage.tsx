import LinkButton from '../components/LinkButton'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { SALON_NAME } from '../config/salon'
import { useLanguage } from '../context/language-context'
import { useI18n } from '../hooks/useI18n'
import { useSeo } from '../hooks/useSeo'

function NotFoundPage() {
  const { t } = useI18n()
  const { language } = useLanguage()
  const title =
    language === 'de'
      ? 'Seite nicht gefunden'
      : language === 'uk'
        ? 'Сторінку не знайдено'
        : 'Страница не найдена'
  const description =
    language === 'de'
      ? 'Die Seite existiert nicht oder wurde verschoben.'
      : language === 'uk'
        ? 'Сторінка не існує або була переміщена.'
        : 'Страница не существует или была перемещена.'

  useSeo({
    path: '/404',
    title: `404 | ${SALON_NAME}`,
    description,
    noindex: true,
  })

  return (
    <main className="section-page">
      <SiteNav />
      <section className="section-page__hero">
        <p className="section-page__eyebrow">404</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="section-page__actions">
          <LinkButton to="/" tone="primary" size="lg">
            {t('common.toHome')}
          </LinkButton>
          <LinkButton to="/catalog" size="lg">
            {t('nav.catalog')}
          </LinkButton>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

export default NotFoundPage
