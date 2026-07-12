import type { CollectionConfig } from 'payload'
import slugify from 'slugify'
import { triggerRevalidate } from '@/lib/cache/revalidate'

export const PropertyTypes: CollectionConfig = {
  slug: 'property-types',
  labels: {
    singular: 'Property Type',
    plural: 'Property Types',
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
        triggerRevalidate('property-types')
      }
    ],
    afterDelete: [
      () => {
        triggerRevalidate('property-types')
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
      label: 'Type Name',
      admin: {
        description: 'Display name for this property type (e.g., Villa, Hotel, Resort).',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'property-categories',
      required: true,
      index: true,
      admin: {
        description: 'Select the main category for this property type.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'SEO Slug',
      admin: {
        hidden: true, // Comply with user demand to hide completely from Admin view
        description: 'URL-friendly identifier (lowercase, e.g., "villa", "elite-real-estate").',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            // Automatically generate slug from name on creation/update
            if (data?.name) {
              return slugify(data.name, { lower: true, strict: true })
            }
            return value
          },
        ],
      },
    },
  ],
}
