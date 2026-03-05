import { useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon } from './icons'

export type FaqAccordionItem = {
  id: string | number
  question: string
  answer: string
}

type FaqAccordionProps = {
  items: readonly FaqAccordionItem[]
  defaultOpenCount?: number
  className?: string
}

function FaqAccordion({
  items,
  defaultOpenCount = 0,
  className,
}: FaqAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(items.slice(0, defaultOpenCount).map((item) => String(item.id))),
  )

  const toggleItem = (id: string | number) => {
    const key = String(id)
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const accordionClassName = className
    ? `faq-accordion ${className}`
    : 'faq-accordion'

  return (
    <ul className={accordionClassName}>
      {items.map((item) => {
        const itemId = String(item.id)
        const isOpen = openIds.has(itemId)
        const triggerId = `faq-trigger-${item.id}`
        const panelId = `faq-panel-${item.id}`

        return (
          <li
            key={item.id}
            className={isOpen ? 'faq-accordion__item is-open' : 'faq-accordion__item'}
          >
            <button
              id={triggerId}
              className="faq-accordion__trigger"
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleItem(item.id)}
            >
              <span>{item.question}</span>
              {isOpen ? (
                <ArrowUpIcon className="faq-accordion__icon" aria-hidden="true" />
              ) : (
                <ArrowDownIcon className="faq-accordion__icon" aria-hidden="true" />
              )}
            </button>
            <div
              id={panelId}
              className="faq-accordion__panel"
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
            >
              <p>{item.answer}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default FaqAccordion
