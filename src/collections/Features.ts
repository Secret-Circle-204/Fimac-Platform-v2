// src/collections/Features.ts
import { CollectionConfig } from 'payload'

export const Features: CollectionConfig = {
  slug: 'features',
  admin: {
    group: 'Real Estate',
    useAsTitle: 'name',
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
      label: 'Feature Name',
      admin: {
        description: 'Name of the feature (e.g., "Hardwood Floors", "Swimming Pool")',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Interior',
          value: 'interior',
        },
        {
          label: 'Exterior',
          value: 'exterior',
        },
        {
          label: 'Community',
          value: 'community',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },
  ],
}
