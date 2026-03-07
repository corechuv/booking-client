import type { ReactNode } from 'react'

type SectionPageHeroProps = {
  eyebrow: string
  title: string
  description: ReactNode
  actions?: ReactNode
  meta?: ReactNode
  className?: string
}

function SectionPageHero({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: SectionPageHeroProps) {
  const classes = [
    'section-page__hero',
    meta ? 'section-page__hero--split' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={classes}>
      <div className="section-page__hero-main">
        <p className="section-page__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {meta ? <div className="section-page__hero-meta">{meta}</div> : null}
      {actions ? <div className="section-page__hero-links">{actions}</div> : null}
    </section>
  )
}

export default SectionPageHero
