import type { Field } from 'payload/types'

const languageToCountry: Record<string, string> = {
  EN: 'GB', // English -> Great Britain
  ZH: 'CN', // Chinese -> China
  JA: 'JP', // Japanese -> Japan
}

const getFlagEmoji = (code: string): string => {
  const countryCode = languageToCountry[code.toUpperCase()] || code

  if (typeof countryCode !== 'string' || countryCode.length !== 2) {
    return ''
  }

  try {
    return String.fromCodePoint(
      // @ts-expect-error
      ...[...countryCode.toUpperCase()].map(x => 0x1f1e6 + x.charCodeAt(0) - 65),
    )
  } catch (error: unknown) {
    return ''
  }
}
export interface Locale {
  code: string
  label: string
}

export const localeSelect: (availableLocales: Locale[], defaultValue?: string) => Field = (
  availableLocales,
  defaultValue = '',
) => ({
  type: 'select',
  name: 'better_i18n_locale',
  label: 'Locale',
  defaultValue,
  // its a payload 3 feature
  // virtual: true,
  admin: {
    isClearable: false,
    isSortable: false,
    hasMany: false,
    position: 'sidebar',
  },
  options: availableLocales.map(locale => ({
    label: `${locale.label} ${getFlagEmoji(locale.code.replaceAll(/.+-/g, ''))}`,
    value: locale.code,
  })),
})
