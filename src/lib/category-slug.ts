const CHAR_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  ґ: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  є: 'ye',
  ж: 'zh',
  з: 'z',
  и: 'i',
  і: 'i',
  ї: 'yi',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
}

const transliterate = (value: string): string =>
  value
    .split('')
    .map((char) => {
      const lower = char.toLowerCase()
      return CHAR_MAP[lower] ?? char
    })
    .join('')

export const slugifyCategoryLabel = (value: string): string => {
  const transliterated = transliterate(value)
  const normalized = transliterated
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`"]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return normalized || 'category'
}

export const buildCategorySlug = (name: string, id: number | string): string =>
  `${slugifyCategoryLabel(name)}-${id}`

export const extractCategoryNumericId = (
  value: string | null | undefined,
): number | null => {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const withSuffix = trimmed.match(/-(\d+)$/)
  if (withSuffix) {
    const parsed = Number.parseInt(withSuffix[1], 10)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (/^\d+$/.test(trimmed)) {
    const parsed = Number.parseInt(trimmed, 10)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}
