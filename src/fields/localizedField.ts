import type { Field } from 'payload/types'

import type { Locale } from './localeSelect'

export const createLocalizedField = (field: Field, locales: Locale[]): Field[] =>
  locales.flatMap(({ code, label }) => ({
    ...field,
    // @ts-expect-error
    name: `${field.name}_${code}`,
    // @ts-expect-error
    label: `${field.label} (${label})`,
    admin: {
      ...(field?.admin as {}),
      condition: (data, siblingData, { user }) => {
        return field.admin?.condition
          ? field.admin?.condition?.(data, siblingData, { user }) &&
              data.better_i18n_locale === code
          : data.better_i18n_locale === code
      },
    },
  }))
