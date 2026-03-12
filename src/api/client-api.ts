const DEFAULT_API_URL = 'http://localhost:8001/api/v1'

const rawApiUrl = import.meta.env.VITE_API_URL?.trim()
const API_BASE_URL = (rawApiUrl && rawApiUrl.length > 0 ? rawApiUrl : DEFAULT_API_URL).replace(/\/+$/, '')

export type ClientLanguageCode = 'ru' | 'uk' | 'de'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ErrorPayload = {
  detail?: unknown
}

const normalizeErrorMessage = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') {
    return 'Request failed'
  }

  const { detail } = payload as ErrorPayload

  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0]
    if (typeof first === 'string') {
      return first
    }

    if (first && typeof first === 'object' && 'msg' in first) {
      const msg = (first as { msg?: unknown }).msg
      if (typeof msg === 'string' && msg.trim().length > 0) {
        return msg
      }
    }
  }

  return 'Request failed'
}

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as unknown
    return normalizeErrorMessage(payload)
  } catch {
    return response.statusText || 'Request failed'
  }
}

const makeHeaders = (
  initHeaders: HeadersInit | undefined,
  token?: string,
): Headers => {
  const headers = new Headers(initHeaders)

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: init.cache ?? (method === 'GET' ? 'no-store' : undefined),
    headers: makeHeaders(init.headers, token),
  })

  if (!response.ok) {
    const message = await getErrorMessage(response)
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export type TokenResponse = {
  access_token: string
  token_type: string
}

export type RegisterClientPayload = {
  full_name: string
  email: string
  phone?: string | null
  password: string
}

export type LoginClientPayload = {
  email: string
  password: string
}

export type ClientService = {
  id: number
  category_id: number
  category: string
  title_i18n?: Record<string, string> | null
  description_i18n?: Record<string, string> | null
  title: string
  description: string | null
  duration_minutes: number
  price: number | string
  old_price?: number | string | null
  discount_percent?: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ClientCategory = {
  id: number
  name: string
  description: string | null
  show_empty: boolean
}

export type CreateBookingPayload = {
  service_id: number
  specialist_name?: string | null
  starts_at: string
  consent_accepted: boolean
  comment?: string | null
}

export type PublicBookingCreatePayload = CreateBookingPayload & {
  full_name: string
  email: string
  phone?: string | null
}

export type BookingAvailability = {
  slot_interval_minutes: number
  busy_slots: string[]
}

export type BookingConfirmedResult = {
  booking_id: number
  status: 'pending' | 'confirmed' | 'completed' | 'canceled'
  service_title: string
  starts_at: string
  specialist_name: string | null
  salon_name: string
  salon_address: string
  salon_phone: string
  salon_route_url: string
  client_email: string
}

export type PublicFaq = {
  id: number
  question: string
  answer: string
  question_i18n?: Record<string, string> | null
  answer_i18n?: Record<string, string> | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type PublicContactSettings = {
  id: number
  salon_name: string
  salon_name_i18n?: Record<string, string> | null
  phone: string
  email: string
  address: string
  address_i18n?: Record<string, string> | null
  route_url: string
  created_at: string
  updated_at: string
}

export type PublicHourSlot = {
  day_of_week: number
  interval_index: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export type PublicBusinessHours = {
  scope: string
  specialist_id: number | null
  slots: PublicHourSlot[]
}

export type PublicCertificate = {
  id: number
  title: string
  title_i18n?: Record<string, string> | null
  issuer: string | null
  issuer_i18n?: Record<string, string> | null
  issued_at: string | null
  image_url: string | null
  document_url: string | null
  description: string | null
  description_i18n?: Record<string, string> | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type PublicSpecialist = {
  id: number
  full_name: string
  phone: string | null
  title: string
  title_i18n?: Record<string, string> | null
  bio: string | null
  bio_i18n?: Record<string, string> | null
  photo_url: string | null
}

export type PublicLanguage = {
  id: number
  code: ClientLanguageCode
  name: string
  sort_order: number
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export type PublicVisitTrackPayload = {
  path: string
  referrer?: string | null
  language?: string | null
  session_id?: string | null
}

export type AssistantHistoryItem = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantChatPayload = {
  message: string
  lang?: ClientLanguageCode
  history?: AssistantHistoryItem[]
  consent_accepted: boolean
}

export type AssistantChatResponse = {
  message: string
}

export type ClientBooking = {
  id: number
  client_id: number
  service_id: number
  specialist_name: string | null
  starts_at: string
  status: 'pending' | 'confirmed' | 'completed' | 'canceled'
  consent_accepted: boolean
  comment: string | null
  created_at: string
  updated_at: string
  service: ClientService
}

export const registerClient = (payload: RegisterClientPayload) =>
  request<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const loginClient = (payload: LoginClientPayload) =>
  request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

const withLangQuery = (path: string, lang?: ClientLanguageCode): string => {
  if (!lang) {
    return path
  }

  const delimiter = path.includes('?') ? '&' : '?'
  return `${path}${delimiter}lang=${encodeURIComponent(lang)}`
}

export const fetchClientServices = (lang?: ClientLanguageCode) =>
  request<ClientService[]>(withLangQuery('/client/services', lang))

export const fetchClientCategories = (lang?: ClientLanguageCode) =>
  request<ClientCategory[]>(withLangQuery('/client/categories', lang))

export const fetchBookingAvailability = (
  serviceId: number,
  dateFrom: string,
  days = 56,
) =>
  request<BookingAvailability>(
    `/client/bookings/availability?service_id=${serviceId}&date_from=${encodeURIComponent(dateFrom)}&days=${days}`,
  )

export const createClientBooking = (payload: CreateBookingPayload, token: string) =>
  request<ClientBooking>(
    '/client/bookings',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  )

export const createPublicBooking = (payload: PublicBookingCreatePayload) =>
  request<ClientBooking>('/client/bookings/public', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const confirmPublicBooking = (token: string) =>
  request<BookingConfirmedResult>(
    `/client/bookings/confirm?token=${encodeURIComponent(token)}`,
  )

export const fetchPublicFaqs = (lang?: ClientLanguageCode) =>
  request<PublicFaq[]>(withLangQuery('/client/content/faqs', lang))

export const fetchPublicContact = (lang?: ClientLanguageCode) =>
  request<PublicContactSettings>(withLangQuery('/client/content/contact', lang))

export const fetchPublicGeneralHours = () =>
  request<PublicBusinessHours>('/client/content/hours/general')

export const fetchPublicCertificates = (lang?: ClientLanguageCode) =>
  request<PublicCertificate[]>(withLangQuery('/client/content/certificates', lang))

export const fetchPublicSpecialists = (lang?: ClientLanguageCode) =>
  request<PublicSpecialist[]>(withLangQuery('/client/content/specialists', lang))

export const fetchPublicLanguages = () =>
  request<PublicLanguage[]>('/client/content/languages')

export const trackPublicVisit = (payload: PublicVisitTrackPayload) =>
  request<void>('/client/visits', {
    method: 'POST',
    body: JSON.stringify(payload),
    keepalive: true,
  })

export const chatWithAssistant = (payload: AssistantChatPayload) =>
  request<AssistantChatResponse>('/client/assistant/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
