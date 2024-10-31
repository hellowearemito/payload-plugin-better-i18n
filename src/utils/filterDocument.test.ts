import { it, describe, expect } from 'vitest'

import { filterDocument } from './filterDocument'

const availableLocales = [
  { code: 'en-gb', label: 'English' },
  { code: 'fr-fr', label: 'French' },
  { code: 'es-es', label: 'Spanish' },
  { code: 'de-de', label: 'German' },
]

describe('filterDocument', () => {
  const locale = 'en-gb'

  it('should handle basic localized fields', () => {
    const input = {
      'title_en-gb': 'English Title',
      'title_fr-fr': 'French Title',
      'description_en-gb': 'English Description',
    }

    const expected = {
      title: 'English Title',
      description: 'English Description',
    }

    expect(filterDocument(input, availableLocales, locale)).toEqual(expected)
  })

  it('should process nested arrays in layout and items', () => {
    const input = {
      layout: [
        {
          'title_en-gb': 'Section 1',
          items: [{ 'name_en-gb': 'Item 1' }, { 'name_en-gb': 'Item 2' }],
        },
      ],
    }

    const expected = {
      layout: [
        {
          title: 'Section 1',
          items: [{ name: 'Item 1' }, { name: 'Item 2' }],
        },
      ],
    }

    expect(filterDocument(input, availableLocales, locale)).toEqual(expected)
  })

  it('should handle accordionBlocks when provided in extraKeys', () => {
    const input = {
      items: [
        {
          'title_en-gb': 'Main Item',
          accordionBlocks: [
            {
              items: [
                {
                  'title_en-gb': 'Accordion Title',
                  'content_en-gb': 'Accordion Content',
                },
              ],
            },
          ],
        },
      ],
    }

    const expected = {
      items: [
        {
          title: 'Main Item',
          accordionBlocks: [
            {
              items: [
                {
                  title: 'Accordion Title',
                  content: 'Accordion Content',
                },
              ],
            },
          ],
        },
      ],
    }

    expect(filterDocument(input, availableLocales, locale)).toEqual(expected)
  })

  it('should handle deeply nested objects', () => {
    const input = {
      level1: {
        level2: {
          level3: {
            'title_en-gb': 'Deep Title',
            'description_en-gb': 'Deep Description',
          },
        },
      },
    }

    const expected = {
      level1: {
        level2: {
          level3: {
            title: 'Deep Title',
            description: 'Deep Description',
          },
        },
      },
    }

    expect(filterDocument(input, availableLocales, locale)).toEqual(expected)
  })

  it('should handle mixed content with arrays, objects and localized fields', () => {
    const input = {
      layout: [
        {
          'title_en-gb': 'Section',
          content: {
            'main_en-gb': 'Main Content',
            details: {
              'subtitle_en-gb': 'Subtitle',
            },
          },
          items: [
            {
              'name_en-gb': 'Item 1',
              metadata: {
                'description_en-gb': 'Description 1',
              },
            },
          ],
        },
      ],
    }

    const expected = {
      layout: [
        {
          title: 'Section',
          content: {
            main: 'Main Content',
            details: {
              subtitle: 'Subtitle',
            },
          },
          items: [
            {
              name: 'Item 1',
              metadata: {
                description: 'Description 1',
              },
            },
          ],
        },
      ],
    }

    expect(filterDocument(input, availableLocales, locale)).toEqual(expected)
  })

  it('should handle empty or null values', () => {
    const input = {
      'title_en-gb': '',
      'description_en-gb': null,
      'content_en-gb': undefined,
      items: [],
    }

    const expected = {
      title: '',
      description: null,
      content: undefined,
      items: [],
    }

    expect(filterDocument(input, availableLocales, locale)).toEqual(expected)
  })

  it('should preserve non-localized fields', () => {
    const input = {
      id: '123',
      createdAt: '2024-01-01',
      'title_en-gb': 'Title',
      metadata: {
        version: 1,
        'name_en-gb': 'Name',
      },
    }

    const expected = {
      id: '123',
      createdAt: '2024-01-01',
      title: 'Title',
      metadata: {
        version: 1,
        name: 'Name',
      },
    }

    expect(filterDocument(input, availableLocales, locale)).toEqual(expected)
  })

  describe('multi-locale handling', () => {
    it('should filter correct locale from multiple available locales', () => {
      const input = {
        'title_en-gb': 'English Title',
        'title_fr-fr': 'Titre Français',
        'title_es-es': 'Título Español',
        'title_de-de': 'Deutscher Titel',
        'description_en-gb': 'English Description',
        'description_fr-fr': 'Description Française',
        'description_es-es': 'Descripción Española',
        'description_de-de': 'Deutsche Beschreibung',
      }

      // Test English locale
      expect(filterDocument(input, availableLocales, 'en-gb')).toEqual({
        title: 'English Title',
        description: 'English Description',
      })

      // Test French locale
      expect(filterDocument(input, availableLocales, 'fr-fr')).toEqual({
        title: 'Titre Français',
        description: 'Description Française',
      })

      // Test Spanish locale
      expect(filterDocument(input, availableLocales, 'es-es')).toEqual({
        title: 'Título Español',
        description: 'Descripción Española',
      })
    })

    it('should handle missing translations gracefully', () => {
      const input = {
        'title_en-gb': 'Title in English',
        'title_fr-fr': 'Titre en Français',
        'description_en-gb': 'Description in English',
        // note: no French description
        metadata: {
          'status_en-gb': 'Active',
          'status_fr-fr': 'Actif',
          'notes_en-gb': 'Some notes',
          // note: no French notes
        },
      }

      // Test French locale with missing translations
      expect(filterDocument(input, availableLocales, 'fr-fr')).toEqual({
        title: 'Titre en Français',
        metadata: {
          status: 'Actif',
        },
      })

      // Test non-existent locale
      expect(filterDocument(input, availableLocales, 'es_es')).toEqual({
        metadata: {},
      })
    })

    it('should handle mixed localized and non-localized content', () => {
      const input = {
        id: '123',
        createdAt: '2024-01-01',
        'title_en-gb': 'English Title',
        'title_fr-fr': 'Titre Français',
        metadata: {
          version: 1,
          'author_en-gb': 'John Doe',
          'author_fr-fr': 'Jean Dupont',
          lastModified: '2024-01-02',
        },
        stats: {
          views: 100,
          'likes_en-gb': '50 likes',
          'likes_fr-fr': "50 j'aime",
        },
      }

      expect(filterDocument(input, availableLocales, 'fr-fr')).toEqual({
        id: '123',
        createdAt: '2024-01-01',
        title: 'Titre Français',
        metadata: {
          version: 1,
          author: 'Jean Dupont',
          lastModified: '2024-01-02',
        },
        stats: {
          views: 100,
          likes: "50 j'aime",
        },
      })
    })
  })
})
