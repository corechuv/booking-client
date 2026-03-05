export type ServiceItem = {
  id: string
  title: string
  description: string
  duration: string
  price: string
  oldPrice?: string
  discountBadge?: string
  popular?: boolean
}

export type ServiceCategory = {
  id: string
  name: string
  summary: string
  services: ServiceItem[]
}

export const serviceCatalog: ServiceCategory[] = [
  {
    id: 'skin',
    name: 'Skin Care',
    summary: 'Уходовые программы для чистоты, сияния и восстановления кожи.',
    services: [
      {
        id: 'skin-glow-facial',
        title: 'Glow Facial',
        description:
          'Глубокое очищение, энзимный этап и увлажнение для ровного тона.',
        duration: '60 мин',
        price: '€49',
        oldPrice: '€55',
        discountBadge: '-11%',
        popular: true,
      },
      {
        id: 'skin-hydra-boost',
        title: 'Hydra Boost Therapy',
        description: 'Интенсивное увлажнение и успокаивающий протокол для сухой кожи.',
        duration: '70 мин',
        price: '€62',
      },
      {
        id: 'skin-sensitive-repair',
        title: 'Sensitive Repair',
        description: 'Восстановление барьера кожи и мягкое снятие реактивности.',
        duration: '65 мин',
        price: '€58',
      },
      {
        id: 'skin-anti-age-lift',
        title: 'Anti-age Lift Session',
        description: 'Уплотняющий уход с массажной техникой и лифтинг-эффектом.',
        duration: '80 мин',
        price: '€74',
      },
    ],
  },
  {
    id: 'hair',
    name: 'Hair Care',
    summary: 'Стрижка, укладка и уход для естественного и event-образа.',
    services: [
      {
        id: 'hair-ritual',
        title: 'Hair Ritual',
        description: 'Персональный уход + укладка под форму лица и текстуру волос.',
        duration: '75 мин',
        price: '€59',
        oldPrice: '€70',
        discountBadge: '-16%',
        popular: true,
      },
      {
        id: 'hair-blowout',
        title: 'Signature Blowout',
        description: 'Объемная укладка с длительной фиксацией и мягким движением.',
        duration: '55 мин',
        price: '€48',
      },
      {
        id: 'hair-color-refresh',
        title: 'Color Refresh',
        description: 'Легкое обновление оттенка и уходовый post-color протокол.',
        duration: '95 мин',
        price: '€96',
      },
      {
        id: 'hair-evening-style',
        title: 'Evening Styling',
        description: 'Сборка завершенного образа для вечернего выхода или съемки.',
        duration: '70 мин',
        price: '€78',
      },
    ],
  },
  {
    id: 'nails',
    name: 'Nail Care',
    summary: 'Чистый маникюр, стойкое покрытие и деликатный nail design.',
    services: [
      {
        id: 'nails-signature',
        title: 'Nail Signature',
        description: 'Аппаратный маникюр, укрепление и естественный финиш.',
        duration: '50 мин',
        price: '€32',
        oldPrice: '€38',
        discountBadge: '-16%',
        popular: true,
      },
      {
        id: 'nails-gel-color',
        title: 'Gel Color Set',
        description: 'Стойкое покрытие с выравниванием и ровной архитектурой.',
        duration: '65 мин',
        price: '€46',
      },
      {
        id: 'nails-soft-design',
        title: 'Soft Design',
        description: 'Минималистичный дизайн с акцентом на форму и детали.',
        duration: '70 мин',
        price: '€52',
      },
      {
        id: 'nails-express-care',
        title: 'Express Care',
        description: 'Быстрый уход и обновление формы между полноценными визитами.',
        duration: '35 мин',
        price: '€29',
      },
    ],
  },
  {
    id: 'makeup-brows',
    name: 'Makeup & Brows',
    summary: 'Макияж, брови и lashes для дневных и event-задач.',
    services: [
      {
        id: 'makeup-event',
        title: 'Event Makeup',
        description: 'Образ для мероприятия с учетом освещения и дресс-кода.',
        duration: '70 мин',
        price: '€80',
      },
      {
        id: 'makeup-day',
        title: 'Soft Day Makeup',
        description: 'Легкий макияж на каждый день с аккуратной коррекцией.',
        duration: '45 мин',
        price: '€39',
        oldPrice: '€49',
        discountBadge: '-20%',
      },
      {
        id: 'brow-architect',
        title: 'Brow Architect',
        description: 'Форма, коррекция и оттенок, чтобы подчеркнуть черты лица.',
        duration: '40 мин',
        price: '€32',
      },
      {
        id: 'lash-lift',
        title: 'Lash Lift',
        description: 'Подкручивание и фиксация ресниц с естественным эффектом.',
        duration: '55 мин',
        price: '€44',
      },
    ],
  },
]

export const addOnServices = [
  { name: 'Collagen mask', price: '€12' },
  { name: 'Scalp massage 15 min', price: '€14' },
  { name: 'Nail design mini set', price: '€10' },
  { name: 'Express eyebrow tint', price: '€9' },
]
