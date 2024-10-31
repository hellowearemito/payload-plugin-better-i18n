import { LocaleObject } from '@/plugins/i18n'

type FilterOptions = {
  localeSet: Set<string>
  localeSuffix: string
  localeSuffixLen: number
}

const isObject = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const filterValue = (value: any, options: FilterOptions): any => {
  if (Array.isArray(value)) {
    return value.map(item => filterValue(item, options))
  }

  if (isObject(value)) {
    return filterNestedDocument(value, options)
  }

  return value
}

const filterNestedDocument = (
  doc: Record<string, any>,
  options: FilterOptions,
): Record<string, any> => {
  const { localeSet, localeSuffix, localeSuffixLen } = options
  const filteredDoc: Record<string, any> = {}

  for (const [key, value] of Object.entries(doc)) {
    if (key === 'better_i18n_locale') continue

    if (key.endsWith(localeSuffix)) {
      const baseKey = key.slice(0, -localeSuffixLen)
      filteredDoc[baseKey] = filterValue(value, options)
      continue
    }

    let hasLocaleSuffix = false
    for (const localeCode of localeSet) {
      if (key.endsWith(`_${localeCode}`)) {
        hasLocaleSuffix = true
        break
      }
    }

    if (!hasLocaleSuffix) {
      filteredDoc[key] = filterValue(value, options)
    }
  }

  return filteredDoc
}

export const filterDocument = (
  doc: Record<string, any>,
  availableLocales: LocaleObject[],
  locale: string,
): Record<string, any> => {
  const options: FilterOptions = {
    localeSet: new Set(availableLocales.map(loc => loc.code)),
    localeSuffix: `_${locale}`,
    localeSuffixLen: locale.length + 1,
  }

  return filterNestedDocument(doc, options)
}
