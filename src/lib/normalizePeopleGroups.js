const REGION_ALIASES = {
  's. asia': 'South Asia',
  'southern asia': 'South Asia',
  'south asia': 'South Asia',

  'se asia': 'Southeast Asia',
  'south-east asia': 'Southeast Asia',
  'southeast asia': 'Southeast Asia',

  'e. asia': 'East Asia',
  'east asia': 'East Asia',

  'c. asia': 'Central Asia',
  'central asia': 'Central Asia',

  mena: 'Middle East & North Africa',
  'middle east': 'Middle East & North Africa',
  'n. africa & middle east': 'Middle East & North Africa',
  'middle east & north africa': 'Middle East & North Africa',

  ssa: 'Sub-Saharan Africa',
  'africa, sub-saharan': 'Sub-Saharan Africa',
  'sub-saharan africa': 'Sub-Saharan Africa',
}

const NAME_ALIASES = {
  uighur: 'Uyghur',
  uygur: 'Uyghur',
  uyghur: 'Uyghur',

  hmông: 'Hmong',
  "h'mong": 'Hmong',
  hmong: 'Hmong',

  baluch: 'Baloch',
  balochi: 'Baloch',
  baloch: 'Baloch',

  fulbe: 'Fulani',
  fula: 'Fulani',
  fulani: 'Fulani',

  zazaki: 'Zaza',
  zaza: 'Zaza',

  nûristani: 'Nuristani',
  nuristani: 'Nuristani',

  kurdish: 'Kurd',
  kurd: 'Kurd',
}

export function normalizeRegion(region) {
  if (!region) return 'Unknown'

  const key = region.trim().toLowerCase()

  return REGION_ALIASES[key] ?? region.trim()
}

export function normalizeName(name) {
  if (!name) return ''

  const cleaned = name.trim()

  return cleaned
    .split(/\s+/)
    .map(word => {
      const key = word.toLowerCase()
      return NAME_ALIASES[key] ?? word
    })
    .join(' ')
}

export function mergeDuplicateGroups(groups) {
  const merged = new Map()

  for (const group of groups) {
    const canonicalName = normalizeName(group.name)
    const country = group.country?.trim() ?? ''

    const key = `${canonicalName.toLowerCase()}|${country.toLowerCase()}`

    if (!merged.has(key)) {
      merged.set(key, {
        ...group,
        name: canonicalName,
        region: normalizeRegion(group.region),
        duplicateCount: 1,
      })
    } else {
      const existing = merged.get(key)

      merged.set(key, {
        ...existing,
        duplicateCount: existing.duplicateCount + 1,
      })
    }
  }

  return Array.from(merged.values())
}

export function parsePopulation(value) {
  if (!value) return null

  const cleaned = value.trim().toLowerCase()

  if (cleaned === 'unknown') return null

  if (cleaned.startsWith('<')) {
    const number = Number(cleaned.replace(/[<,\s]/g, ''))
    return Number.isNaN(number) ? null : number - 1
  }

  if (cleaned.includes('-')) {
    const [min, max] = cleaned
      .split('-')
      .map(part => Number(part.replace(/,/g, '').trim()))

    if (Number.isNaN(min) || Number.isNaN(max)) return null

    return Math.floor((min + max) / 2)
  }

  const number = Number(cleaned.replace(/,/g, ''))

  return Number.isNaN(number) ? null : number
}

export function parseLanguages(value) {
  if (!value) return []

  return value
    .split(';')
    .map(language => language.trim())
    .filter(Boolean)
}

export function normalizeSearchText(value) {
  if (!value) return ''

  return normalizeName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}