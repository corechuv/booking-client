import LinkButton from './LinkButton'
import { useI18n } from '../hooks/useI18n'

function ProcedureCatalog() {
  const { t } = useI18n()

  return (
    <LinkButton className="catalog-trigger" to="/catalog" size="lg">
      {t('nav.catalog')}
    </LinkButton>
  )
}

export default ProcedureCatalog
