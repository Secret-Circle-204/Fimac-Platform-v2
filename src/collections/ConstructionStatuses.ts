import type { CollectionConfig } from 'payload'
import slugify from 'slugify'
import { triggerRevalidate } from '@/lib/cache/revalidate'

export const ConstructionStatuses: CollectionConfig = {
  slug: 'construction-statuses',
  labels: {
    singular: 'Construction Status',
    plural: 'Construction Statuses',
  },
  admin: {
    useAsTitle: 'name',
    listSearchableFields: ['name', 'slug'],
    defaultColumns: ['name', 'slug', 'colorTheme', 'createdAt'],
    group: 'Real Estate',
    hidden: true,
  },
  hooks: {
    afterChange: [
      () => {
        triggerRevalidate('construction-statuses')
      }
    ],
    afterDelete: [
      () => {
        triggerRevalidate('construction-statuses')
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
      label: 'Status Name (EN)',
      admin: {
        description: 'Display name for this status in English (e.g., Ready to Move In, Under Construction).',
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
        description: 'URL-friendly identifier (lowercase, e.g., "ready", "under-construction").',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (value) return value
            if (data?.name) {
              return slugify(data.name, { lower: true, strict: true }).replace(/-/g, '_')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'colorTheme',
      type: 'select',
      required: true,
      defaultValue: 'gray',
      options: [
        { label: 'Green (Emerald)', value: 'emerald' },
        { label: 'Orange (Amber)', value: 'amber' },
        { label: 'Blue (Indigo)', value: 'blue' },
        { label: 'Indigo (Royal)', value: 'indigo' },
        { label: 'Purple (Amethyst)', value: 'purple' },
        { label: 'Gray (Muted)', value: 'gray' },
      ],
      admin: {
        description: 'Visual color theme for badges in search cards and property detail views.',
      },
    },
  ],
}
