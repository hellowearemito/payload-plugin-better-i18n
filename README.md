# Payload Plugin Better I18N

This plugin aims to fix the janky i18n user experience in Payload CMS by providing a more user-friendly way to manage translations.
To manage localizations you don't have to change the admin ui language anymore. Instead, each collection which has a
`localize` field will have a locale selector in the sidebar where you can switch between locales.

The plugin relies on the [localization](https://payloadcms.com/docs/configuration/localization) configuration of the `payload.config.js` file. You have to define the locales and the default locale there.

### Example payload localization configuration
```typescript
import { buildConfig } from 'payload/config'
export default buildConfig({
  // ...
  localization: {
    locales: ['en', 'de'],
    defaultLocale: 'en'
  }
})
```

## Installation
*note: it is not published yet, so you have to install it from the git repository*
```bash
npm install @hellowearemito/plugin-better-i18n
```

## Usage
To enable the plugin you have to add it to the `plugins` array in the `payload.config.js` file.

```typescript
import { betterI18n } from '@hellowearemito/plugin-better-i18n'

export default buildConfig({
  // ...
  plugins: [
    betterI18n({
      enabled: true
    })
  ]
})
```

### Marking fields for localization
To mark a field for localization you have to add the `localizable` property to the field's `custom` property.
The plugin will automatically create a new field for each locale in the collection.

The usage of `custom` was necessary to avoid collisions with Payload's localizations.

```typescript
export default {
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      custom: {
        localizable: true
      }
    }
  ]
}
```
### Todo
- [ ] Add more tests
- [ ] Add more documentation
- [ ] Lexical HTML converter support
