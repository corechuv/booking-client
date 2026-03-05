import { certificates } from '../data/certificates'
import { useI18n } from '../hooks/useI18n'
import LinkButton from './LinkButton'

export type CertificateCardItem = {
  id: string | number
  title: string
  area: string
  preview: string
  pdf: string
}

type CertificatesGridProps = {
  id?: string
  title?: string
  description?: string
  limit?: number
  items?: readonly CertificateCardItem[]
}

const toPublicUrl = (path: string) => encodeURI(path)

function CertificatesGrid({
  id = 'certificates',
  title,
  description,
  limit,
  items,
}: CertificatesGridProps) {
  const { t } = useI18n()
  const sourceItems = items ?? certificates
  const visibleItems = typeof limit === 'number' ? sourceItems.slice(0, limit) : sourceItems
  const resolvedTitle = title ?? t('cert.title')
  const resolvedDescription = description ?? t('cert.description')
  const hasDescription = resolvedDescription.trim().length > 0

  return (
    <section className="section-page__strip section-page__certificates" id={id}>
      <div className="section-page__strip-head">
        <h2>{resolvedTitle}</h2>
        {hasDescription ? <p>{resolvedDescription}</p> : null}
      </div>

      <div className="certificate-grid">
        {visibleItems.map((item) => (
          <article className="certificate-card" key={item.id}>
            <a
              className="certificate-card__preview-link"
              href={toPublicUrl(item.pdf)}
              target="_blank"
              rel="noreferrer"
              aria-label={t('cert.openAria', { title: item.title })}
            >
              <img
                className="certificate-card__preview"
                src={toPublicUrl(item.preview)}
                alt={t('cert.imageAlt', { title: item.title })}
                loading="lazy"
              />
            </a>

            <div className="certificate-card__body">
              <p className="section-card__meta">{item.area}</p>
              <h3>{item.title}</h3>

              <div className="certificate-card__actions">
                <LinkButton
                  href={toPublicUrl(item.pdf)}
                  target="_blank"
                  rel="noreferrer"
                  size="sm"
                >
                  {t('cert.open')}
                </LinkButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CertificatesGrid
