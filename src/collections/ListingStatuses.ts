import type { CollectionConfig } from 'payload'
import slugify from 'slugify'
import { triggerRevalidate } from '@/lib/cache/revalidate'

export const ListingStatuses: CollectionConfig = {
  slug: 'listing-statuses',
  labels: {
    singular: 'Listing Status',
    plural: 'Listing Statuses',
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
      ({ context }) => {
        if (!context?.skipCacheInvalidation) {
          triggerRevalidate('listing-statuses')
        }
      }
    ],
    afterDelete: [
      ({ context }) => {
        if (!context?.skipCacheInvalidation) {
          triggerRevalidate('listing-statuses')
        }
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
      label: 'Status Name',
      admin: {
        description: 'Display name for this status (e.g., Open Contract, Closed Contract, Draft).',
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
        description: 'URL-friendly identifier (lowercase, e.g., "forsale", "sold", "draft").',
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
      name: 'colorTheme',
      type: 'select',
      required: true,
      defaultValue: 'gray',
      options: [
        { label: 'Green (Emerald)', value: 'emerald' },
        { label: 'Blue (Indigo)', value: 'blue' },
        { label: 'Gray (Muted)', value: 'gray' },
        { label: 'Orange (Amber)', value: 'amber' },
        { label: 'Red (Rose)', value: 'rose' },
        { label: 'Gold (Royal)', value: 'gold' },
      ],
      admin: {
        description: 'Visual color theme for badges in the dashboard and property details.',
      },
    },
  ],
}
