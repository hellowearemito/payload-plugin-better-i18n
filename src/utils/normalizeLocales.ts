import type { ConfigLocales, LocaleObject } from '../index'

export const normalizeLocales = (locales: ConfigLocales): LocaleObject[] => {
  if (!locales.length) return []

  if (typeof locales[0] === 'string') {
    return (locales as string[]).map(locale => ({
      code: locale,
      label: locale,
    }))
  }

  return locales as LocaleObject[]
}
