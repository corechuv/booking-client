import type { PublicContactSettings } from '../api/client-api'
import type { AppLanguageCode } from '../i18n/types'

type LegalSection = {
  title: string
  paragraphs: string[]
  list?: string[]
}

export type CookieCategoryKey = 'necessary' | 'functional' | 'analytics' | 'marketing'

export type CookieCategory = {
  key: CookieCategoryKey
  title: string
  description: string
  legal_basis: string
  always_on?: boolean
}

export type CookieStorageRow = {
  key_name: string
  storage: string
  purpose: string
  ttl: string
  category: CookieCategoryKey
}

export type ThirdPartyRow = {
  service: string
  when_used: string
  data: string
  transfer: string
}

export type LegalPageContent = {
  updated_at: string
  notice: string
  privacy: {
    title: string
    description: string
    sections: LegalSection[]
  }
  terms: {
    title: string
    description: string
    sections: LegalSection[]
  }
  cookies: {
    title: string
    description: string
    intro: string
    categories_title: string
    categories: CookieCategory[]
    settings_title: string
    save_label: string
    essentials_only_label: string
    reload_label: string
    storage_title: string
    storage_rows: CookieStorageRow[]
    third_party_title: string
    third_party_rows: ThirdPartyRow[]
    rights_title: string
    rights_text: string
  }
  impressum: {
    title: string
    description: string
    sections: LegalSection[]
  }
}

const getFallback = (
  value: string | null | undefined,
  fallback: string,
): string => {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : fallback
}

export const getLegalContent = (
  language: AppLanguageCode,
  contact?: PublicContactSettings,
): LegalPageContent => {
  const salonName = getFallback(contact?.salon_name, 'Mira beauty salon')
  const salonEmail = getFallback(contact?.email, 'info@center-mira.com')
  const salonPhone = getFallback(contact?.phone, '+49 30 9999 1212')
  const salonAddress = getFallback(contact?.address, 'Berlin, Friedrichstrasse 12')
  const routeUrl = getFallback(
    contact?.route_url,
    'https://maps.google.com/?q=Berlin+Friedrichstrasse+12',
  )

  if (language === 'uk') {
    return {
      updated_at: '05.03.2026',
      notice: '',
      privacy: {
        title: 'Політика конфіденційності',
        description:
          'Як обробляються персональні дані на сайті, у формі запису та в процесі email-підтвердження.',
        sections: [
          {
            title: '1. Відповідальний за обробку',
            paragraphs: [
              `Відповідальний: ${salonName}.`,
              `Контакти: ${salonAddress}, ${salonEmail}, ${salonPhone}.`,
              'Правова база: Загальний регламент захисту даних (GDPR / DSGVO), BDSG та норми Німеччини щодо цифрових сервісів.',
            ],
          },
          {
            title: '2. Які дані ми обробляємо',
            paragraphs: ['Під час запису, підтвердження та адміністрування можуть оброблятися:'],
            list: [
              "ідентифікаційні дані клієнта (ім'я, email, телефон);",
              'дані запису (послуга, майстер, дата/час, коментар, статус);',
              'дані згоди (чекбокс, час підтвердження, версія тексту згоди, IP, User-Agent);',
              'технічні дані запитів до API (час, endpoint, код відповіді, технічні журнали).',
            ],
          },
          {
            title: '3. Цілі та правові підстави',
            paragraphs: ['Ми обробляємо дані для виконання сервісу запису та безпеки платформи.'],
            list: [
              'Організація і виконання запису: ст. 6(1)(b) DSGVO (договір / переддоговірні дії).',
              'Підтвердження запису та службові повідомлення: ст. 6(1)(b) DSGVO.',
              'Фіксація згоди на процедуру: ст. 6(1)(a) та ст. 7 DSGVO.',
              'Захист від конфліктів слотів, зловживань, претензій: ст. 6(1)(f) DSGVO (legitimate interest).',
              'Виконання обов’язкових вимог бухгалтерського/податкового права: ст. 6(1)(c) DSGVO.',
            ],
          },
          {
            title: '4. Подвійне підтвердження запису',
            paragraphs: [
              'Запис створюється у статусі pending і стає підтвердженим лише після переходу за одноразовим посиланням із email.',
              'Токен підтвердження дійсний максимум 24 години та не пізніше ніж за 1 годину до початку запису.',
              'Мета цього механізму: підтвердити волю клієнта, зменшити фейкові записи та захистити розклад.',
            ],
          },
          {
            title: '5. Одержувачі та обробники',
            paragraphs: ['Дані можуть передаватися лише в обсязі, необхідному для надання сервісу:'],
            list: [
              'хостинг / база даних (бекенд і PostgreSQL);',
              'SMTP-провайдер для листів підтвердження та сповіщень;',
              'картографічні сервіси (тайли/геокодування) під час використання карти;',
              'Google Maps лише за кліком на кнопку маршруту.',
            ],
          },
          {
            title: '6. Міжнародні передачі',
            paragraphs: [
              'Якщо сервіс-провайдери знаходяться поза ЄС/ЄЕЗ, передача можлива лише за умов глави V DSGVO (наприклад, adequacy decision або відповідні гарантії).',
              'Для США оцінюємо механізми передачі згідно з актуальними рішеннями Єврокомісії та вимогами наглядових органів.',
            ],
          },
          {
            title: '7. Строки зберігання',
            paragraphs: [
              'Дані записів та згоду з технічними метаданими ми зберігаємо стільки, скільки потрібно для сервісу, доказування та захисту правових вимог.',
              'Документи, пов’язані з бухгалтерією та податковим обліком, зберігаються у строки, визначені законодавством Німеччини.',
              'Після завершення строків дані видаляються або анонімізуються.',
            ],
          },
          {
            title: '8. Права суб’єкта даних',
            paragraphs: ['Ви маєте права за ст. 15-22 DSGVO, зокрема:'],
            list: [
              'право на доступ до даних;',
              'право на виправлення та видалення;',
              'право на обмеження обробки;',
              'право на заперечення;',
              'право на перенесення даних;',
              'право відкликати згоду на майбутнє.',
            ],
          },
          {
            title: '9. Безпека обробки',
            paragraphs: [
              'Ми застосовуємо технічні та організаційні заходи відповідно до ст. 32 DSGVO: обмеження доступу, контроль доступу до адмін-функцій, журналювання подій, мінімізація даних, захист токенів підтвердження.',
            ],
          },
          {
            title: '10. Скарги та нагляд',
            paragraphs: [
              'Ви можете подати скаргу до компетентного органу захисту даних у Німеччині.',
              'Спочатку рекомендуємо звернутися до нас: це часто дозволяє швидко вирішити питання без спору.',
            ],
          },
        ],
      },
      terms: {
        title: 'Умови запису',
        description:
          'Правила онлайн-запису, підтвердження, перенесення та взаємодії клієнта з салоном.',
        sections: [
          {
            title: '1. Сфера дії',
            paragraphs: [
              `Ці умови застосовуються до онлайн-запису на послуги ${salonName} через вебсайт.`,
              'Оформлення запису означає згоду клієнта з цими умовами та політикою конфіденційності.',
            ],
          },
          {
            title: '2. Як формується запис',
            paragraphs: [
              'Крок 1: вибір послуги в каталозі; крок 2: вибір слота; крок 3: відправка форми.',
              'Після відправки заявка має статус pending і повинна бути підтверджена через email-посилання.',
              'Поки посилання не підтверджене, слот може бути звільнений системою.',
            ],
          },
          {
            title: '3. Часові обмеження підтвердження',
            paragraphs: [
              'Посилання на підтвердження діє максимум 24 години.',
              'Підтвердження можливе лише не пізніше ніж за 1 годину до початку запису.',
            ],
          },
          {
            title: '4. Перенесення та скасування',
            paragraphs: [
              'Запит на перенесення або скасування надсилайте через контакти салону якомога раніше.',
              'Фактичні умови пізнього скасування/неявки можуть встановлюватися прайсом, офертою або персональними умовами запису.',
            ],
          },
          {
            title: '5. Запізнення та неявка',
            paragraphs: [
              'У разі запізнення тривалість процедури може бути скоригована для збереження розкладу.',
              'За суттєвої неявки без попередження салон може обмежити майбутні бронювання.',
            ],
          },
          {
            title: '6. Здоров’я та обмеження процедур',
            paragraphs: [
              'Клієнт зобов’язаний повідомити про протипоказання, алергії або інші обставини, важливі для безпечного надання послуги.',
              'Салон має право відмовити або змінити процедуру з міркувань безпеки.',
            ],
          },
          {
            title: '7. Ціни та оплата',
            paragraphs: [
              'Актуальна ціна визначається прайсом на момент підтвердження запису або погодження послуги.',
              'Додаткові опції та апгрейди оплачуються окремо за чинним тарифом.',
            ],
          },
          {
            title: '8. Електронна згода і підпис',
            paragraphs: [
              'Чекбокс згоди у формі запису є електронним волевиявленням клієнта.',
              'Система фіксує факт згоди (час, версію згоди, IP, User-Agent) як доказову інформацію.',
              'Для окремих процедур салон може додатково запросити письмову згоду на місці перед початком послуги.',
            ],
          },
          {
            title: '9. Відповідальність і доступність сервісу',
            paragraphs: [
              'Салон не гарантує безперервну роботу сайту 24/7, але докладає розумних зусиль для стабільного доступу.',
              'У разі технічних збоїв та форс-мажору час запису може бути змінений з повідомленням клієнта.',
            ],
          },
          {
            title: '10. Спори та позасудове врегулювання',
            paragraphs: [
              'Спочатку звертайтесь до салону через контакти на сайті: ми намагаємося врегулювати питання напряму.',
              'Інформація про участь у процедурах споживчого врегулювання (якщо застосовується) публікується в Impressum.',
            ],
          },
        ],
      },
      cookies: {
        title: 'Налаштування cookie та сховищ',
        description:
          'Які технології зберігання ми застосовуємо зараз, навіщо вони потрібні та як керувати згодою.',
        intro:
          'На сайті не використовується рекламний трекінг за замовчуванням. Клієнтський додаток не зберігає персональні налаштування у localStorage/sessionStorage: дані завантажуються з API.',
        categories_title: 'Категорії зберігання',
        categories: [
          {
            key: 'necessary',
            title: 'Необхідні',
            description:
              'Потрібні для базової роботи сайту та безпечної взаємодії з backend (без них сервіс може працювати некоректно).',
            legal_basis: '§ 25 Abs. 2 TDDDG / ст. 6(1)(f) DSGVO',
            always_on: true,
          },
          {
            key: 'functional',
            title: 'Функціональні',
            description:
              'Функціональні налаштування застосовуються в рамках поточної сесії без довгострокового збереження у браузері.',
            legal_basis: '§ 25 Abs. 1 TDDDG + ст. 6(1)(a) DSGVO',
          },
          {
            key: 'analytics',
            title: 'Аналітика',
            description:
              'Збір статистики використання сайту. Станом на зараз у клієнті не підключено.',
            legal_basis: '§ 25 Abs. 1 TDDDG + ст. 6(1)(a) DSGVO',
          },
          {
            key: 'marketing',
            title: 'Маркетинг',
            description:
              'Профілювання, рекламні теги та міжсайтове відстеження. Станом на зараз у клієнті не підключено.',
            legal_basis: '§ 25 Abs. 1 TDDDG + ст. 6(1)(a) DSGVO',
          },
        ],
        settings_title: 'Керування згодою',
        save_label: 'Зберегти налаштування',
        essentials_only_label: 'Лише необхідні',
        reload_label: 'Після збереження сторінка перезавантажиться для застосування нових правил.',
        storage_title: 'Що реально використовується на сайті',
        storage_rows: [
          {
            key_name: 'Немає постійних ключів',
            storage: 'Не використовується',
            purpose:
              'Клієнт не зберігає дані у localStorage/sessionStorage; контент завантажується напряму з backend API.',
            ttl: 'Не застосовується',
            category: 'necessary',
          },
        ],
        third_party_title: 'Зовнішні сервіси і мережеві запити',
        third_party_rows: [
          {
            service: 'OpenStreetMap Nominatim',
            when_used: 'При рендері карти для геокодування адреси',
            data: 'IP-адреса, технічні параметри запиту',
            transfer: 'Можлива міжнародна передача, залежить від інфраструктури провайдера',
          },
          {
            service: 'CARTO map tiles',
            when_used: 'При завантаженні тайлів карти у компоненті Leaflet',
            data: 'IP-адреса, browser metadata',
            transfer: 'Можлива міжнародна передача',
          },
          {
            service: 'Google Maps',
            when_used: 'Лише після натискання кнопки маршруту або відкриття карти',
            data: 'Передача відбувається напряму між браузером і Google',
            transfer: 'Можлива передача в США; застосовуються правила глави V DSGVO',
          },
        ],
        rights_title: 'Ваші права щодо згоди',
        rights_text:
          'Ви можете змінити налаштування в будь-який момент. Відкликання не впливає на законність обробки до моменту відкликання.',
      },
      impressum: {
        title: 'Impressum',
        description:
          'Обов’язкові відомості для цифрових сервісів у Німеччині (DDG) та додаткові дані для редакційних матеріалів (MStV, якщо застосовується).',
        sections: [
          {
            title: '1. Постачальник послуги (Diensteanbieter)',
            paragraphs: [
              `Назва проєкту/салону: ${salonName}`,
              'Юридична особа або ФОП: [додайте точну правову форму]',
              'Представник(и): [додайте ПІБ уповноваженої особи]',
              `Адреса (ladungsfaehig): ${salonAddress}`,
            ],
          },
          {
            title: '2. Контакти',
            paragraphs: [`Email: ${salonEmail}`, `Телефон: ${salonPhone}`, `Маршрут: ${routeUrl}`],
          },
          {
            title: '3. Реєстр і податкові реквізити (за наявності)',
            paragraphs: [
              'Handelsregister: [додайте суд/номер або вкажіть, що відсутній]',
              'USt-IdNr. за §27a UStG: [додайте, якщо є]',
              'Wirtschafts-Identifikationsnummer за §139c AO: [додайте, якщо є]',
            ],
          },
          {
            title: '4. Наглядовий орган / професійні правила (за потреби)',
            paragraphs: [
              'Якщо діяльність підлягає ліцензуванню/професійним правилам, додайте компетентний наглядовий орган і посилання на норми.',
            ],
          },
          {
            title: '5. Відповідальний за редакційний контент (§ 18 Abs. 2 MStV)',
            paragraphs: [
              'Якщо на сайті є журналістсько-редакційні матеріали, вкажіть відповідальну особу з ім’ям та адресою.',
              'Якщо таких матеріалів немає, прямо зафіксуйте це у внутрішніх правилах контенту.',
            ],
          },
          {
            title: '6. Verbraucherstreitbeilegung (VSBG)',
            paragraphs: [
              'Додайте заяву щодо готовності/обов’язку брати участь у позасудовому врегулюванні спорів із споживачами (якщо на вас поширюється вимога).',
              'Після закриття платформи ODR ЄС з 20.07.2025, застарілі посилання на OS-платформу слід видалити.',
            ],
          },
        ],
      },
    }
  }

  if (language === 'de') {
    return {
      updated_at: '05.03.2026',
      notice: '',
      privacy: {
        title: 'Datenschutzerklaerung',
        description:
          'Wie personenbezogene Daten auf der Website, im Buchungsformular und bei der E-Mail-Bestaetigung verarbeitet werden.',
        sections: [
          {
            title: '1. Verantwortlicher',
            paragraphs: [
              `Verantwortlich: ${salonName}.`,
              `Kontakt: ${salonAddress}, ${salonEmail}, ${salonPhone}.`,
              'Rechtsrahmen: DSGVO, BDSG sowie einschlaegige deutsche Vorschriften fuer digitale Dienste.',
            ],
          },
          {
            title: '2. Verarbeitete Datenkategorien',
            paragraphs: ['Im Rahmen von Buchung und Servicebetrieb werden insbesondere verarbeitet:'],
            list: [
              'Kundenstammdaten (Name, E-Mail, Telefon);',
              'Buchungsdaten (Leistung, Termin, Dauer, Specialist, Kommentar, Status);',
              'Einwilligungsdaten (Checkbox, Zeitpunkt, Einwilligungsversion, IP-Adresse, User-Agent);',
              'technische Protokolldaten fuer Betriebssicherheit und Fehleranalyse.',
            ],
          },
          {
            title: '3. Zwecke und Rechtsgrundlagen',
            paragraphs: ['Die Verarbeitung erfolgt zweckgebunden und datensparsam:'],
            list: [
              'Terminabwicklung und Kommunikation: Art. 6 Abs. 1 lit. b DSGVO.',
              'Buchungsbestaetigung per E-Mail und Terminverwaltung: Art. 6 Abs. 1 lit. b DSGVO.',
              'Dokumentation der Einwilligung zur Behandlung: Art. 6 Abs. 1 lit. a, Art. 7 DSGVO.',
              'Missbrauchspraevention, Konfliktpruefung von Zeitfenstern, Rechtsverteidigung: Art. 6 Abs. 1 lit. f DSGVO.',
              'gesetzliche Aufbewahrungs- und Nachweispflichten: Art. 6 Abs. 1 lit. c DSGVO.',
            ],
          },
          {
            title: '4. Double-Opt-in fuer Buchungen',
            paragraphs: [
              'Eine oeffentliche Buchung wird initial als pending gespeichert.',
              'Die endgueltige Bestaetigung erfolgt erst nach Klick auf den einmaligen Token-Link per E-Mail.',
              'Die Token-Geltung ist auf maximal 24 Stunden begrenzt und endet spaetestens 1 Stunde vor Terminbeginn.',
            ],
          },
          {
            title: '5. Empfaenger und Auftragsverarbeiter',
            paragraphs: ['Eine Weitergabe erfolgt nur, soweit dies zur Leistungserbringung notwendig ist:'],
            list: [
              'Hosting- und Datenbankanbieter fuer den technischen Betrieb;',
              'SMTP-/Mail-Dienstleister fuer Buchungs- und Bestaetigungs-E-Mails;',
              'Kartendienste fuer Geocoding und Kachelmaterial;',
              'Google Maps nur nach aktivem Klick auf Routenfunktionen.',
            ],
          },
          {
            title: '6. Drittlanduebermittlungen',
            paragraphs: [
              'Bei Dienstleistern ausserhalb der EU/des EWR erfolgen Uebermittlungen nur unter den Voraussetzungen von Kapitel V DSGVO.',
              'Soweit Uebermittlungen in die USA stattfinden, werden die jeweils gueltigen Transfermechanismen (z. B. Angemessenheitsbeschluss oder geeignete Garantien) angewendet.',
            ],
          },
          {
            title: '7. Speicherdauer',
            paragraphs: [
              'Buchungs- und Einwilligungsdaten werden nur so lange gespeichert, wie dies fuer Terminabwicklung, Nachweisfuehrung und die Abwehr/Realisierung von Anspruechen erforderlich ist.',
              'Steuer- und handelsrechtlich relevante Unterlagen werden gemaess gesetzlichen Fristen aufbewahrt.',
            ],
          },
          {
            title: '8. Rechte betroffener Personen',
            paragraphs: ['Sie haben Rechte nach Art. 15-22 DSGVO, insbesondere:'],
            list: [
              'Auskunft, Berichtigung, Loeschung;',
              'Einschraenkung der Verarbeitung;',
              'Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. e/f DSGVO;',
              'Datenuertragbarkeit;',
              'Widerruf erteilter Einwilligungen mit Wirkung fuer die Zukunft.',
            ],
          },
          {
            title: '9. Sicherheit der Verarbeitung',
            paragraphs: [
              'Es werden angemessene technische und organisatorische Massnahmen nach Art. 32 DSGVO eingesetzt (Zugriffssteuerung, rollenbasierte Rechte, Token-Hashing, Integritaetspruefungen, Logging).',
            ],
          },
          {
            title: '10. Beschwerderecht',
            paragraphs: [
              'Unabhaengig von internen Klaerungen koennen Sie sich bei einer zustaendigen Datenschutzaufsichtsbehoerde beschweren.',
            ],
          },
        ],
      },
      terms: {
        title: 'Buchungsbedingungen',
        description:
          'Regeln fuer Online-Terminbuchung, Bestaetigung, Umbuchung und die vertragliche Zusammenarbeit.',
        sections: [
          {
            title: '1. Geltungsbereich',
            paragraphs: [
              `Diese Bedingungen gelten fuer Online-Buchungen ueber die Website von ${salonName}.`,
              'Mit Absenden der Buchung werden diese Bedingungen und die Datenschutzerklaerung akzeptiert.',
            ],
          },
          {
            title: '2. Buchungsablauf',
            paragraphs: [
              'Leistung waehlen, Terminfenster waehlen, Formular absenden, E-Mail-Link bestaetigen.',
              'Eine Buchung gilt erst nach erfolgreicher Link-Bestaetigung als verbindlich bestaetigt.',
            ],
          },
          {
            title: '3. Bestaetigungsfenster',
            paragraphs: [
              'Der Bestaetigungslink ist hoechstens 24 Stunden gueltig.',
              'Eine Bestaetigung ist nur bis spaetestens 1 Stunde vor Terminbeginn moeglich.',
            ],
          },
          {
            title: '4. Umbuchung und Stornierung',
            paragraphs: [
              'Umbuchungen und Stornierungen sollen so frueh wie moeglich ueber die Kontaktkanaele des Salons erfolgen.',
              'Konkrete Fristen oder Gebuehren fuer Spaetstorno/No-Show koennen in Preislisten oder individuellen Vereinbarungen geregelt werden.',
            ],
          },
          {
            title: '5. Verspaetung und Nichterscheinen',
            paragraphs: [
              'Bei Verspaetung kann die Behandlungsdauer angepasst werden, um Folgetermine zu schuetzen.',
              'Bei wiederholtem Nichterscheinen kann die Annahme weiterer Online-Buchungen eingeschraenkt werden.',
            ],
          },
          {
            title: '6. Gesundheitsangaben',
            paragraphs: [
              'Kundinnen und Kunden muessen gesundheitlich relevante Informationen (z. B. Allergien, Kontraindikationen) wahrheitsgemaess mitteilen.',
              'Der Salon kann aus Sicherheitsgruenden Leistungen ablehnen, anpassen oder verschieben.',
            ],
          },
          {
            title: '7. Preise und Zahlung',
            paragraphs: [
              'Massgeblich ist der zum Buchungszeitpunkt bzw. bei Leistungserbringung gueltige Preis.',
              'Zusatzleistungen werden gesondert nach aktueller Preisliste berechnet.',
            ],
          },
          {
            title: '8. Elektronische Einwilligung und Signaturhinweis',
            paragraphs: [
              'Die Zustimmung per Checkbox stellt eine elektronische Willenserklaerung dar.',
              'Zeitpunkt, Einwilligungsversion, IP-Adresse und User-Agent werden als Nachweis protokolliert.',
              'Nach eIDAS darf elektronischen Signaturen die Beweiswirkung nicht allein wegen ihrer Form abgesprochen werden; eine qualifizierte Signatur ist fuer die Terminbuchung regelmaessig nicht erforderlich.',
            ],
          },
          {
            title: '9. Haftung und Verfuegbarkeit',
            paragraphs: [
              'Der Salon haftet im gesetzlichen Rahmen. Fuer kurzfristige technische Stoerungen der Website kann keine ununterbrochene Verfuegbarkeit garantiert werden.',
              'Bei unvermeidbaren Stoerungen werden Termine in Abstimmung mit Kundinnen und Kunden neu disponiert.',
            ],
          },
          {
            title: '10. Verbraucherstreitbeilegung',
            paragraphs: [
              'Informationen zur Teilnahmebereitschaft an Streitbeilegungsverfahren werden im Impressum bereitgestellt.',
              'Veraltete Hinweise auf die ehemalige EU-ODR-Plattform wurden entfernt, da diese seit 20.07.2025 eingestellt ist.',
            ],
          },
        ],
      },
      cookies: {
        title: 'Cookie- und Speichereinstellungen',
        description:
          'Diese Seite zeigt transparent, welche Speichertechnologien wir aktuell verwenden und wie Sie Ihre Einwilligung steuern.',
        intro:
          'Der Client setzt derzeit keine Marketing- oder Tracking-Cookies. Es werden keine dauerhaften Daten in localStorage/sessionStorage gespeichert; Inhalte werden aus dem API geladen.',
        categories_title: 'Kategorien',
        categories: [
          {
            key: 'necessary',
            title: 'Notwendig',
            description:
              'Erforderlich fuer den sicheren und funktionsfaehigen Betrieb des Dienstes.',
            legal_basis: '§ 25 Abs. 2 TDDDG / Art. 6 Abs. 1 lit. f DSGVO',
            always_on: true,
          },
          {
            key: 'functional',
            title: 'Funktional',
            description:
              'Funktionale Einstellungen gelten nur innerhalb der aktuellen Sitzung und werden nicht dauerhaft im Browser gespeichert.',
            legal_basis: '§ 25 Abs. 1 TDDDG + Art. 6 Abs. 1 lit. a DSGVO',
          },
          {
            key: 'analytics',
            title: 'Analytics',
            description:
              'Statistische Reichweitenanalyse. Aktuell in diesem Projekt nicht aktiviert.',
            legal_basis: '§ 25 Abs. 1 TDDDG + Art. 6 Abs. 1 lit. a DSGVO',
          },
          {
            key: 'marketing',
            title: 'Marketing',
            description:
              'Werbe- und Profiling-Technologien. Aktuell in diesem Projekt nicht aktiviert.',
            legal_basis: '§ 25 Abs. 1 TDDDG + Art. 6 Abs. 1 lit. a DSGVO',
          },
        ],
        settings_title: 'Einwilligung verwalten',
        save_label: 'Einstellungen speichern',
        essentials_only_label: 'Nur notwendige aktivieren',
        reload_label: 'Nach dem Speichern wird die Seite neu geladen, damit die Auswahl wirksam wird.',
        storage_title: 'Tatsaechlich eingesetzte Speicherobjekte',
        storage_rows: [
          {
            key_name: 'Keine persistenten Keys',
            storage: 'Nicht verwendet',
            purpose:
              'Der Client speichert keine Daten in localStorage/sessionStorage; Inhalte werden direkt vom Backend-API geladen.',
            ttl: 'Nicht anwendbar',
            category: 'necessary',
          },
        ],
        third_party_title: 'Externe Dienste bei Karten- und Routenfunktionen',
        third_party_rows: [
          {
            service: 'OpenStreetMap Nominatim',
            when_used: 'Bei Adress-Geocoding im Kartenmodul',
            data: 'IP-Adresse und technische Request-Metadaten',
            transfer: 'Kann internationale Verarbeitung beinhalten',
          },
          {
            service: 'CARTO Tile Service',
            when_used: 'Beim Laden von Kartenkacheln',
            data: 'IP-Adresse, Browser-Metadaten',
            transfer: 'Kann internationale Verarbeitung beinhalten',
          },
          {
            service: 'Google Maps',
            when_used: 'Nur nach aktivem Klick auf Route/Karte',
            data: 'Direkte Uebertragung zwischen Browser und Google',
            transfer: 'Moegliche Uebermittlung in die USA',
          },
        ],
        rights_title: 'Widerruf und Aenderung',
        rights_text:
          'Sie koennen Einwilligungen jederzeit mit Wirkung fuer die Zukunft anpassen oder widerrufen. Die Rechtmaessigkeit der bis dahin erfolgten Verarbeitung bleibt unberuehrt.',
      },
      impressum: {
        title: 'Impressum',
        description:
          'Pflichtangaben fuer geschaeftsmaessige digitale Dienste nach deutschem Recht (insbesondere § 5 DDG).',
        sections: [
          {
            title: '1. Diensteanbieter',
            paragraphs: [
              `Name/Bezeichnung: ${salonName}`,
              'Rechtsform: [bitte ergaenzen, z. B. Einzelunternehmen, GmbH, UG]',
              'Vertretungsberechtigte Person(en): [bitte ergaenzen]',
              `Ladungsfaehige Anschrift: ${salonAddress}`,
            ],
          },
          {
            title: '2. Kontakt',
            paragraphs: [`E-Mail: ${salonEmail}`, `Telefon: ${salonPhone}`, `Route: ${routeUrl}`],
          },
          {
            title: '3. Register und Steuernummern (falls vorhanden)',
            paragraphs: [
              'Handelsregister: [Registergericht, Registernummer oder Hinweis: nicht eingetragen]',
              'USt-IdNr. gemaess § 27a UStG: [bitte ergaenzen]',
              'Wirtschafts-Identifikationsnummer gemaess § 139c AO: [bitte ergaenzen]',
            ],
          },
          {
            title: '4. Aufsichtsbehoerde / Berufsrecht (falls einschlaegig)',
            paragraphs: [
              'Sofern eine erlaubnispflichtige oder reglementierte Taetigkeit ausgeuebt wird, sind zustaendige Kammern/Aufsichtsbehoerden und berufsrechtliche Regelungen anzugeben.',
            ],
          },
          {
            title: '5. Redaktionell Verantwortliche Person (§ 18 Abs. 2 MStV)',
            paragraphs: [
              'Nur erforderlich, wenn journalistisch-redaktionelle Inhalte angeboten werden.',
              'Dann Name und Anschrift der verantwortlichen Person gesondert angeben.',
            ],
          },
          {
            title: '6. Verbraucherstreitbeilegung (VSBG)',
            paragraphs: [
              'Bitte erklaeren, ob eine Bereitschaft oder Verpflichtung zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle besteht.',
              'Hinweise auf die fruehere EU-ODR-Plattform sind seit deren Abschaltung zu entfernen.',
            ],
          },
        ],
      },
    }
  }

  return {
    updated_at: '05.03.2026',
    notice: '',
    privacy: {
      title: 'Политика конфиденциальности',
      description:
        'Как мы обрабатываем персональные данные на сайте и в процессе подтверждения записи.',
      sections: [
        {
          title: '1. Кто отвечает за обработку',
          paragraphs: [
            `Ответственный: ${salonName}.`,
            `Контакты: ${salonAddress}, ${salonEmail}, ${salonPhone}.`,
            'Применяемое право: GDPR (DSGVO), BDSG и релевантные нормы Германии для цифровых сервисов.',
          ],
        },
        {
          title: '2. Какие данные мы собираем',
          paragraphs: ['При использовании сайта и формы booking могут обрабатываться:'],
          list: [
            'данные клиента: имя, email, телефон;',
            'данные записи: услуга, специалист, дата/время, комментарий, статус;',
            'данные согласия: отметка checkbox, время, версия согласия, IP, User-Agent;',
            'технические журналы API и системные события безопасности.',
          ],
        },
        {
          title: '3. Цели и правовые основания',
          paragraphs: ['Обработка выполняется только для четко определенных задач:'],
          list: [
            'оформление и сопровождение записи: Art. 6(1)(b) DSGVO;',
            'email-подтверждение и коммуникация по визиту: Art. 6(1)(b) DSGVO;',
            'фиксация согласия на процедуру: Art. 6(1)(a), Art. 7 DSGVO;',
            'защита расписания, антифрод, защита правовых требований: Art. 6(1)(f) DSGVO;',
            'исполнение обязательных требований налогового/бухгалтерского учета: Art. 6(1)(c) DSGVO.',
          ],
        },
        {
          title: '4. Подтверждение записи по email',
          paragraphs: [
            'Публичная запись сначала создается в статусе pending.',
            'Финальное подтверждение происходит только после перехода по одноразовой ссылке в письме.',
            'Срок ссылки ограничен: максимум 24 часа и не позже чем за 1 час до начала процедуры.',
          ],
        },
        {
          title: '5. Кому передаются данные',
          paragraphs: ['Передача осуществляется только в необходимом объеме:'],
          list: [
            'провайдер инфраструктуры (хостинг и база данных);',
            'SMTP-провайдер для отправки писем;',
            'картографические сервисы (тайлы/геокодинг) при использовании карты;',
            'Google Maps только при явном действии пользователя (клик по маршруту).',
          ],
        },
        {
          title: '6. Международные передачи',
          paragraphs: [
            'Если данные передаются за пределы ЕС/ЕЭЗ, применяются механизмы Chapter V DSGVO (например adequacy decision или подходящие гарантии).',
            'Для США применяем актуальные трансграничные механизмы согласно решениям ЕС и позиции надзорных органов.',
          ],
        },
        {
          title: '7. Сроки хранения',
          paragraphs: [
            'Данные записи и подтверждения согласия храним столько, сколько необходимо для выполнения услуги, доказательной базы и правовой защиты.',
            'Документы с налогово-учетной значимостью хранятся в сроки, установленные законодательством Германии.',
            'По окончании сроков данные удаляются или анонимизируются.',
          ],
        },
        {
          title: '8. Права субъекта данных',
          paragraphs: ['Вы имеете права по Art. 15-22 DSGVO, включая:'],
          list: [
            'право доступа;',
            'право исправления и удаления;',
            'право ограничения обработки;',
            'право возражения;',
            'право переноса данных;',
            'право отзыва согласия на будущее.',
          ],
        },
        {
          title: '9. Безопасность',
          paragraphs: [
            'Мы применяем технические и организационные меры по Art. 32 DSGVO: разграничение доступов, role-based доступ к admin, хеширование токенов подтверждения, проверка целостности слотов, журналирование.',
          ],
        },
        {
          title: '10. Куда жаловаться',
          paragraphs: [
            'Вы можете подать жалобу в компетентный орган по защите данных в Германии.',
            'Перед подачей жалобы рекомендуем сначала написать нам, чтобы решить вопрос быстрее.',
          ],
        },
      ],
    },
    terms: {
      title: 'Условия записи',
      description:
        'Правила использования booking-сервиса, подтверждения записей и взаимодействия с салоном.',
      sections: [
        {
          title: '1. Сфера действия',
          paragraphs: [
            `Условия применяются к онлайн-записи на услуги ${salonName}.`,
            'Оформляя запись, клиент подтверждает согласие с этими условиями и политикой конфиденциальности.',
          ],
        },
        {
          title: '2. Формирование записи',
          paragraphs: [
            'Шаги: выбор услуги в каталоге, выбор даты/слота, отправка формы, подтверждение по email.',
            'До подтверждения по ссылке запись не считается окончательно подтвержденной.',
          ],
        },
        {
          title: '3. Срок подтверждения',
          paragraphs: [
            'Ссылка подтверждения действует не более 24 часов.',
            'Подтверждение возможно только не позднее чем за 1 час до времени записи.',
          ],
        },
        {
          title: '4. Перенос и отмена',
          paragraphs: [
            'Запрос на перенос/отмену направляйте через контакты салона как можно раньше.',
            'Конкретные условия поздней отмены/неявки могут определяться прайсом или индивидуальными условиями записи.',
          ],
        },
        {
          title: '5. Опоздание и неявка',
          paragraphs: [
            'При опоздании длительность услуги может быть скорректирована для сохранения расписания.',
            'При повторной неявке без предупреждения salon может ограничить дальнейшее онлайн-бронирование.',
          ],
        },
        {
          title: '6. Данные о здоровье и противопоказания',
          paragraphs: [
            'Клиент обязан сообщить о противопоказаниях, аллергиях и иных факторах, влияющих на безопасность процедуры.',
            'Салон вправе изменить или отказать в услуге по медицинским/безопасностным основаниям.',
          ],
        },
        {
          title: '7. Цены и оплата',
          paragraphs: [
            'Применяется актуальная стоимость услуги на момент подтверждения записи либо оказания услуги.',
            'Дополнительные опции оплачиваются отдельно по действующему прайсу.',
          ],
        },
        {
          title: '8. Подпись и согласие в электронном виде',
          paragraphs: [
            'Checkbox согласия в форме booking считается электронным волеизъявлением клиента.',
            'Система хранит подтверждающие атрибуты согласия (timestamp, версия, IP, User-Agent).',
            'Для отдельных процедур salon может запросить дополнительное письменное согласие офлайн перед началом услуги.',
          ],
        },
        {
          title: '9. Ответственность и доступность',
          paragraphs: [
            'Сервис предоставляется с разумными мерами надежности, но без гарантии полной бесперебойности.',
            'В случае технических сбоев или форс-мажора время визита может быть изменено с уведомлением клиента.',
          ],
        },
        {
          title: '10. Споры и внесудебное урегулирование',
          paragraphs: [
            'Сначала обратитесь в salon напрямую по контактам на сайте.',
            'Статус участия в потребительском ADR-порядке публикуется в Impressum (если применимо).',
          ],
        },
      ],
    },
    cookies: {
      title: 'Cookie и настройки хранения',
      description:
        'Подробно о том, какие технологии хранения мы используем сейчас и как вы управляете согласием.',
      intro:
        'На текущей версии сайта нет включенного рекламного или аналитического трекинга. Клиент не сохраняет данные в localStorage/sessionStorage и получает контент напрямую из API.',
      categories_title: 'Категории',
      categories: [
        {
          key: 'necessary',
          title: 'Необходимые',
          description:
            'Нужны для технической работы сайта, безопасности и корректного обмена с API.',
          legal_basis: '§ 25 Abs. 2 TDDDG / Art. 6(1)(f) DSGVO',
          always_on: true,
        },
        {
          key: 'functional',
          title: 'Функциональные',
          description:
            'Функциональные настройки применяются только в рамках текущей сессии без долгосрочного хранения в браузере.',
          legal_basis: '§ 25 Abs. 1 TDDDG + Art. 6(1)(a) DSGVO',
        },
        {
          key: 'analytics',
          title: 'Аналитика',
          description:
            'Метрики использования сайта. В текущей сборке не подключена.',
          legal_basis: '§ 25 Abs. 1 TDDDG + Art. 6(1)(a) DSGVO',
        },
        {
          key: 'marketing',
          title: 'Маркетинг',
          description:
            'Рекламные и профильные трекеры. В текущей сборке не подключены.',
          legal_basis: '§ 25 Abs. 1 TDDDG + Art. 6(1)(a) DSGVO',
        },
      ],
      settings_title: 'Управление согласием',
      save_label: 'Сохранить настройки',
      essentials_only_label: 'Только необходимые',
      reload_label: 'После сохранения страница будет перезагружена для применения новых правил.',
      storage_title: 'Что реально используется в клиенте',
      storage_rows: [
        {
          key_name: 'Постоянные ключи не используются',
          storage: 'Не используется',
          purpose:
            'Клиент не сохраняет данные в localStorage/sessionStorage; контент загружается напрямую из backend API.',
          ttl: 'Не применяется',
          category: 'necessary',
        },
      ],
      third_party_title: 'Внешние сервисы при работе карты',
      third_party_rows: [
        {
          service: 'OpenStreetMap Nominatim',
          when_used: 'При геокодировании адреса в блоке карты',
          data: 'IP и технические параметры HTTP-запроса',
          transfer: 'Возможна международная обработка',
        },
        {
          service: 'CARTO (map tiles)',
          when_used: 'При загрузке картографических тайлов',
          data: 'IP и browser metadata',
          transfer: 'Возможна международная обработка',
        },
        {
          service: 'Google Maps',
          when_used: 'Только после клика по кнопке маршрута/карты',
          data: 'Передача напрямую между браузером и Google',
          transfer: 'Возможна передача в США',
        },
      ],
      rights_title: 'Ваш контроль',
      rights_text:
        'Вы можете изменить или отозвать согласие в любой момент. Отзыв действует на будущее и не отменяет законность обработки до момента отзыва.',
    },
    impressum: {
      title: 'Impressum',
      description:
        'Обязательные сведения для коммерческого цифрового сервиса в Германии (включая DDG; при необходимости MStV/VSBG).',
      sections: [
        {
          title: '1. Diensteanbieter',
          paragraphs: [
            `Название: ${salonName}`,
            'Юридическая форма: [укажите точно, например Einzelunternehmen/GmbH/UG]',
            'Представитель(и): [укажите уполномоченное лицо]',
            `Почтовый адрес (ladungsfaehig): ${salonAddress}`,
          ],
        },
        {
          title: '2. Контакты',
          paragraphs: [`Email: ${salonEmail}`, `Телефон: ${salonPhone}`, `Маршрут: ${routeUrl}`],
        },
        {
          title: '3. Реестры и налоговые идентификаторы (если применимо)',
          paragraphs: [
            'Handelsregister: [суд и номер или пометка, что не применяется]',
            'USt-IdNr. по §27a UStG: [добавьте при наличии]',
            'Wirtschafts-Identifikationsnummer по §139c AO: [добавьте при наличии]',
          ],
        },
        {
          title: '4. Надзорный орган / профессиональные нормы',
          paragraphs: [
            'Если деятельность лицензируемая или регулируемая, укажите компетентный надзорный орган и профильные правовые нормы.',
          ],
        },
        {
          title: '5. Ответственный за редакционный контент (§ 18 Abs. 2 MStV)',
          paragraphs: [
            'Если публикуются журналистско-редакционные материалы, необходимо указать ответственное лицо (имя и адрес).',
          ],
        },
        {
          title: '6. Verbraucherstreitbeilegung (VSBG)',
          paragraphs: [
            'Добавьте заявление о готовности/обязанности участвовать в потребительском внесудебном урегулировании (если обязанность применима к вашему бизнесу).',
            'Устаревшие ссылки на прежнюю EU ODR платформу должны быть удалены после ее прекращения.',
          ],
        },
      ],
    },
  }
}
