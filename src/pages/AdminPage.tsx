import { Link } from 'react-router-dom'
import LinkButton from '../components/LinkButton'
import { useTheme } from '../context/theme-context'
import '../styles/admin-page.scss'

const sectionLinks = [
  { href: '#overview', label: 'Обзор' },
  { href: '#bookings', label: 'Записи' },
  { href: '#services', label: 'Процедуры' },
  { href: '#specialists', label: 'Специалисты' },
  { href: '#content', label: 'Контент' },
  { href: '#integrations', label: 'Интеграции' },
]

const kpiCards = [
  { label: 'Записей сегодня', value: '42', meta: '+7 vs вчера' },
  { label: 'Новые клиенты', value: '11', meta: '26% от общего потока' },
  { label: 'Средний чек', value: '€74', meta: 'без учёта bundle-пакетов' },
  { label: 'Заполненность дня', value: '87%', meta: 'следующий слот 16:45' },
]

const timeline = [
  {
    time: '10:00',
    client: 'Emma N.',
    service: 'Glow Facial',
    specialist: 'Mira',
    status: 'Подтверждено',
  },
  {
    time: '11:15',
    client: 'Alina B.',
    service: 'Hair Ritual + Styling',
    specialist: 'Alina',
    status: 'В ожидании',
  },
  {
    time: '12:30',
    client: 'Sofia R.',
    service: 'Nail Signature',
    specialist: 'Sonia',
    status: 'Новый',
  },
  {
    time: '14:00',
    client: 'Lena K.',
    service: 'Sensitive Repair',
    specialist: 'Mira',
    status: 'Подтверждено',
  },
]

const incomingRequests = [
  {
    id: '#BK-1042',
    client: 'Julia P.',
    phone: '+49 30 555 901',
    request: 'Bridal hair styling',
    date: '07 Mar · 12:30',
  },
  {
    id: '#BK-1043',
    client: 'Marta S.',
    phone: '+49 30 555 214',
    request: 'Hydra Boost Therapy',
    date: '07 Mar · 13:15',
  },
  {
    id: '#BK-1044',
    client: 'Oksana D.',
    phone: '+49 30 555 774',
    request: 'Express manicure',
    date: '07 Mar · 15:00',
  },
]

const serviceGroups = [
  {
    name: 'Skin Care',
    count: '8 процедур',
    promo: '2 активные скидки',
    priceRange: '€49 — €82',
  },
  {
    name: 'Hair',
    count: '5 процедур',
    promo: '1 активная скидка',
    priceRange: '€58 — €110',
  },
  {
    name: 'Nails',
    count: '4 процедуры',
    promo: 'без промо',
    priceRange: '€35 — €58',
  },
]

const specialists = [
  { name: 'Mira', role: 'Lead esthetician', load: 92, today: '7 визитов' },
  { name: 'Alina', role: 'Hair stylist', load: 74, today: '5 визитов' },
  { name: 'Sonia', role: 'Nail artist', load: 68, today: '4 визита' },
]

const contentTasks = [
  { title: 'Обновить прайс-лист', state: 'Черновик', owner: 'Manager' },
  { title: 'Добавить новые сертификаты', state: 'На проверке', owner: 'Admin' },
  { title: 'Промо блок на главной', state: 'Опубликовано', owner: 'Marketing' },
]

const integrations = [
  {
    title: 'Python API',
    text: 'Endpoint-блоки пока в статусе UI mock, подключение будет через отдельный backend.',
    state: 'Pending',
  },
  {
    title: 'PostgreSQL',
    text: 'Схемы бронирований и справочников запланированы, таблицы еще не подключены.',
    state: 'Planned',
  },
  {
    title: 'Email workflow',
    text: 'Подтверждения и напоминания — дизайн готов, интеграция после backend этапа.',
    state: 'Ready for API',
  },
]

function AdminPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="admin-page">
      <div className="admin-page__glow admin-page__glow--left" />
      <div className="admin-page__glow admin-page__glow--right" />

      <div className="admin-page__shell">
        <header className="admin-topbar">
          <Link className="admin-topbar__brand" to="/" aria-label="Mira home">
            <img src="/logo_full.png" alt="Mira logo" />
            <span>Admin UI</span>
          </Link>

          <div className="admin-topbar__status">
            <span className="admin-tag">UI only</span>
            <span className="admin-tag">Responsive</span>
            <span className="admin-tag">API later</span>
          </div>

          <div className="admin-topbar__actions">
            <LinkButton to="/booking" size="sm">
              Клиентский booking
            </LinkButton>
            <button
              className="admin-theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'mira-dark'
                  ? 'Переключить на светлую тему'
                  : 'Переключить на темную тему'
              }
            >
              {theme === 'mira-dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <section className="admin-panel">
              <p className="admin-panel__label">Навигация</p>
              <nav className="admin-side-nav" aria-label="Admin sections">
                {sectionLinks.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </section>

            <section className="admin-panel">
              <p className="admin-panel__label">Сегодня</p>
              <ul className="admin-side-list">
                <li>
                  <span>Ожидают подтверждения</span>
                  <strong>6</strong>
                </li>
                <li>
                  <span>Свободных слотов</span>
                  <strong>13</strong>
                </li>
                <li>
                  <span>Повторных клиентов</span>
                  <strong>63%</strong>
                </li>
              </ul>
            </section>

            <section className="admin-panel">
              <p className="admin-panel__label">Системный статус</p>
              <ul className="admin-side-list">
                <li>
                  <span>Backend API</span>
                  <strong className="is-pending">Pending</strong>
                </li>
                <li>
                  <span>Database</span>
                  <strong className="is-pending">Planned</strong>
                </li>
                <li>
                  <span>Email / SMS</span>
                  <strong className="is-ready">Ready UI</strong>
                </li>
              </ul>
            </section>
          </aside>

          <div className="admin-content">
            <section className="admin-block" id="overview">
              <div className="admin-block__head">
                <h1>Панель управления Mira</h1>
                <p>Дизайн админки подготовлен под подключение Python API и PostgreSQL.</p>
              </div>
              <div className="admin-kpi-grid">
                {kpiCards.map((card) => (
                  <article className="admin-kpi-card" key={card.label}>
                    <p>{card.label}</p>
                    <strong>{card.value}</strong>
                    <span>{card.meta}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-block admin-block--split" id="bookings">
              <article className="admin-card">
                <div className="admin-card__head">
                  <h2>Лента бронирований</h2>
                  <span>Сегодня</span>
                </div>
                <ul className="admin-timeline">
                  {timeline.map((item) => (
                    <li key={`${item.time}-${item.client}`}>
                      <div>
                        <strong>{item.time}</strong>
                        <span>{item.specialist}</span>
                      </div>
                      <div>
                        <p>{item.client}</p>
                        <span>{item.service}</span>
                      </div>
                      <span className="admin-status">{item.status}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="admin-card">
                <div className="admin-card__head">
                  <h2>Новые заявки</h2>
                  <span>Входящий поток</span>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Клиент</th>
                        <th>Контакт</th>
                        <th>Запрос</th>
                        <th>Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomingRequests.map((row) => (
                        <tr key={row.id}>
                          <td>{row.id}</td>
                          <td>{row.client}</td>
                          <td>{row.phone}</td>
                          <td>{row.request}</td>
                          <td>{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>

            <section className="admin-block admin-block--split" id="services">
              <article className="admin-card">
                <div className="admin-card__head">
                  <h2>Категории процедур</h2>
                  <span>Каталог / цены / скидки</span>
                </div>
                <div className="admin-service-grid">
                  {serviceGroups.map((group) => (
                    <article className="admin-service-card" key={group.name}>
                      <h3>{group.name}</h3>
                      <p>{group.count}</p>
                      <span>{group.promo}</span>
                      <strong>{group.priceRange}</strong>
                    </article>
                  ))}
                </div>
              </article>

              <article className="admin-card" id="specialists">
                <div className="admin-card__head">
                  <h2>Загрузка специалистов</h2>
                  <span>Смена / слоты</span>
                </div>
                <ul className="admin-staff-list">
                  {specialists.map((item) => (
                    <li key={item.name}>
                      <div className="admin-staff-list__head">
                        <p>
                          <strong>{item.name}</strong>
                          <span>{item.role}</span>
                        </p>
                        <b>{item.today}</b>
                      </div>
                      <div className="admin-loadbar">
                        <span style={{ width: `${item.load}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="admin-block admin-block--split" id="content">
              <article className="admin-card">
                <div className="admin-card__head">
                  <h2>Контент и публикации</h2>
                  <span>Лендинг / каталог / legal</span>
                </div>
                <ul className="admin-content-list">
                  {contentTasks.map((item) => (
                    <li key={item.title}>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.owner}</span>
                      </div>
                      <b>{item.state}</b>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="admin-card" id="integrations">
                <div className="admin-card__head">
                  <h2>Интеграции</h2>
                  <span>Будущий backend этап</span>
                </div>
                <div className="admin-integration-grid">
                  {integrations.map((item) => (
                    <article className="admin-integration-card" key={item.title}>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <span>{item.state}</span>
                    </article>
                  ))}
                </div>
              </article>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AdminPage
