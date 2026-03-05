import type { ReactNode } from 'react'

type SectionPageHeroProps = {
  eyebrow: string
  title: string
  description: ReactNode
  actions?: ReactNode
}

function SectionPageHero({
  eyebrow,
  title,
  description,
  actions,
}: SectionPageHeroProps) {
  return (
    <section className="section-page__hero">
      <p className="section-page__eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {actions ? <div className="section-page__hero-links">{actions}</div> : null}
    </section>
  )
}

export default SectionPageHero
