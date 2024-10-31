import type { CollectionConfig } from 'payload/types'

export const Examples: CollectionConfig = {
  slug: 'localizable',
  labels: {
    singular: 'Localizable',
    plural: 'Localizable',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      custom: { localizable: true },
    },
    {
      name: 'content',
      label: 'Content',
      type: 'richText',
      custom: { localizable: true },
    },
    {
      type: 'array',
      name: 'blocks',
      label: 'Blocks',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          custom: { localizable: true },
        },
        {
          name: 'content',
          label: 'Content',
          type: 'richText',
          custom: { localizable: true },
        },
      ],
    },
    {
      type: 'tabs',
      label: 'Tabs',
      tabs: [
        {
          name: 'tab1',
          label: 'Tab 1',
          fields: [
            {
              name: 'title',
              label: 'Tab 1 Title',
              type: 'text',
              required: true,
              custom: { localizable: true },
            },
          ],
        },
        {
          name: 'tab2',
          label: 'Tab 2',
          fields: [
            {
              name: 'title',
              label: 'Tab 2 Title',
              type: 'text',
              required: true,
              custom: { localizable: true },
            },
          ],
        },
      ],
    },
  ],
}
