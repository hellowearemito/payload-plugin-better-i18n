import type { Field } from 'payload/types'

const getFlagEmoji = (countryCode: string): string =>
  String.fromCodePoint(
    // @ts-expect-error
    ...[...countryCode.toUpperCase()].map(x => 0x1f1a5 + x.charCodeAt()),
  )

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
  label: 'Language',
  defaultValue,
  virtual: true,
  admin: {
    position: 'sidebar',
  },
  options: availableLocales.map(locale => ({
    label: `${locale.label} ${getFlagEmoji(locale.code.replaceAll(/.+-/g, ''))}`,
    value: locale.code,
  })),
})
