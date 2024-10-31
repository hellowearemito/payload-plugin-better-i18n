import { Field } from 'payload'

const getFlagEmoji = (countryCode: string) =>
  String.fromCodePoint(
    // @ts-expect-error
    ...[...countryCode.toUpperCase()].map(x => 0x1f1a5 + x.charCodeAt()),
  )

export type Locale = {
  code: string
  label: string
}

export const localeSelect: (
  availableLocales: Locale[],
  defaultValue?: string,
) => Field = (availableLocales, defaultValue = '') => ({
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
