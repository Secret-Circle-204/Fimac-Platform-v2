import type { CollectionConfig } from 'payload'
import slugify from 'slugify'
import { triggerRevalidate } from '@/lib/cache/revalidate'

export const PropertyCategories: CollectionConfig = {
  slug: 'property-categories',
  labels: {
    singular: 'Property Category',
    plural: 'Property Categories',
  },
  admin: {
    useAsTitle: 'name',
    listSearchableFields: ['name', 'slug'],
    defaultColumns: ['name', 'slug', 'createdAt'],
    group: 'Real Estate',
  },
  hooks: {
    afterChange: [
      () => {
        triggerRevalidate('property-categories')
      }
    ],
    afterDelete: [
      () => {
        triggerRevalidate('property-categories')
      }
    ]
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.collection === 'users',
    update: ({ req: { user } }) => user?.collection === 'users',
    delete: ({ req: { user } }) => user?.collection === 'users',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      label: 'Category Name',
      admin: {
        description: 'Display name for this category (e.g., Residential, Commercial, Hospitality, Land).',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'SEO Slug',
      admin: {
        hidden: true,
        description: 'URL-friendly identifier.',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (data?.name) {
              return slugify(data.name, { lower: true, strict: true })
            }
            return value
          },
        ],
      },
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Lucide Icon Name',
      admin: {
        description: 'Icon name from Lucide (e.g., Home, Building2, Hotel, Map).',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 0,
    },
  ],
}
