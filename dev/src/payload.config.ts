import { buildConfig } from 'payload/config'
import path from 'path'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Examples } from './collections/Examples'
import Users from './collections/Users'
import { betterI18n } from '../../src'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'French', code: 'fr' },
      { label: 'German', code: 'de' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  editor: lexicalEditor({}),
  collections: [Examples, Users],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [betterI18n({ enabled: true })],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
})
