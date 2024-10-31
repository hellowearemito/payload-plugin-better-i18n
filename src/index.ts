import type { Config } from 'payload/dist/config/types'
import type { Field } from 'payload/types'
import { localeSelect } from './fields/localeSelect'
import { createLocalizedField } from './fields/localizedField'
import { filterDocument } from './utils/filterDocument'
import { normalizeLocales } from './utils/normalizeLocales'

type PayloadField = Field & {
  fields?: PayloadField[]
  tabs?: Array<{ fields: PayloadField[] }>
  custom?: {
    localizable?: boolean
  }
}

export interface LocaleObject {
  code: string
  label: string
}

export type ConfigLocales = string[] | LocaleObject[]

const validateAndCleanFields = (
  fields: PayloadField[],
  parentIsLocalizable = false,
): PayloadField[] => {
  return fields.map(field => {
    const cleanedField = { ...field }

    // If parent is localizable, remove localizable flag from children
    // as they'll be handled by the parent's localization
    if (parentIsLocalizable && field.custom?.localizable) {
      // eslint-disable-next-line no-console
      console.warn(
        // @ts-expect-error
        `[betterI18n] Warning: Field "${field.name}" is marked as localizable but its parent is already localizable. ` +
          `The child's localizable property will be ignored.`,
      )
      cleanedField.custom = { ...field.custom, localizable: false }
    }

    if (field.fields) {
      cleanedField.fields = validateAndCleanFields(
        field.fields,
        field.custom?.localizable || parentIsLocalizable,
      )
    }

    if (field.tabs) {
      cleanedField.tabs = field.tabs.map(tab => ({
        ...tab,
        fields: validateAndCleanFields(
          tab.fields,
          field.custom?.localizable || parentIsLocalizable,
        ),
      }))
    }

    return cleanedField
  })
}

const findLocalizableFields = (fields: PayloadField[]): PayloadField[] => {
  const localizableFields: PayloadField[] = []

  const processField = (field: PayloadField): PayloadField[] | undefined => {
    if (field.custom?.localizable) {
      localizableFields.push(field)
      return
    }

    if (field.fields) {
      field.fields.forEach(processField)
    }

    if (field.tabs) {
      field.tabs.forEach(tab => {
        if (tab.fields) {
          tab.fields.forEach(processField)
        }
      })
    }
  }

  fields.forEach(processField)
  return localizableFields
}

const processFields = (
  fields: PayloadField[],
  availableLocales: Array<{ code: string; label: string }>,
): PayloadField[] => {
  const cleanedFields = validateAndCleanFields(fields)

  return cleanedFields
    .map(field => {
      if (field.custom?.localizable) {
        return createLocalizedField(field, availableLocales)
      }

      const processedField = { ...field }

      if (field.fields) {
        processedField.fields = processFields(field.fields, availableLocales)
      }

      if (field.tabs) {
        processedField.tabs = field.tabs.map(tab => ({
          ...tab,
          fields: processFields(tab.fields, availableLocales),
        }))
      }

      return processedField
    })
    .flat()
}

export const betterI18n =
  (pluginOptions: { enabled: boolean }) =>
  (incomingConfig: Config): Config => {
    // eslint-disable-next-line no-console
    if (!incomingConfig.localization) console.error('[betterI18n] No locales available')
    if (!pluginOptions.enabled || !incomingConfig.localization) return incomingConfig
    const config = { ...incomingConfig }

    const availableLocales = config.localization
      ? normalizeLocales(config.localization.locales as ConfigLocales)
      : []

    const defaultLocale = config.localization
      ? config.localization.defaultLocale
      : availableLocales[0].code

    if (!availableLocales.length) {
      throw new Error('No locales available for i18n')
    }

    const languageSelector = localeSelect(availableLocales, defaultLocale)

    config.collections = (config.collections || []).map(collection => {
      const cleanedFields = validateAndCleanFields(collection.fields)
      const hasLocalizableFields = findLocalizableFields(cleanedFields).length > 0

      if (!hasLocalizableFields) return collection

      const modifiedCollection = { ...collection }

      modifiedCollection.fields = [...cleanedFields, languageSelector]

      modifiedCollection.fields = processFields(modifiedCollection.fields, availableLocales)

      modifiedCollection.hooks = {
        ...modifiedCollection.hooks,
        afterRead: [
          ...(modifiedCollection.hooks?.afterRead || []),
          ({ req, doc }) => {
            if (!req.query.locale) return doc

            return filterDocument(doc, availableLocales, req.query.locale as string)
          },
        ],
      }

      return modifiedCollection
    })

    if (config.globals) {
      config.globals = config.globals.map(global => {
        const cleanedFields = validateAndCleanFields(global.fields)
        const hasLocalizableFields = findLocalizableFields(cleanedFields).length > 0

        if (!hasLocalizableFields) return global

        return {
          ...global,
          fields: [...processFields(cleanedFields, availableLocales), languageSelector],
        }
      })
    }

    return config
  }
