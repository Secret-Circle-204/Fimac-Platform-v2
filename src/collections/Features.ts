import { CollectionConfig } from 'payload'
import slugify from 'slugify'

export const Features: CollectionConfig = {
  slug: 'features',
  admin: {
    group: 'Real Estate',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'featureGroup'],
    hidden: true,
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
        description: 'Icon name from Lucide (e.g. Waves, Wifi, Car)',
      },
    },
    {
      name: 'visibleInCategories',
      type: 'select',
      hasMany: true,
      label: 'Visible In Categories',
      options: [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Hospitality', value: 'hospitality' },
        { label: 'Land', value: 'land' },
      ],
      admin: {
        description: 'Specify which property categories can use this feature. Leave empty for all.',
      },
    },
    {
      name: 'visibleInPropertyTypes',
      type: 'relationship',
      relationTo: 'property-types',
      hasMany: true,
      label: 'Visible In Property Types',
      admin: {
        description: 'Specify which property types can use this feature. Leave empty for all.',
      },
    },
    {
      name: 'featureGroup',
      type: 'select',
      label: 'Feature Group',
      options: [
        { label: 'Lifestyle & Leisure', value: 'lifestyle' },
        { label: 'Security & Safety', value: 'security' },
        { label: 'Utilities & Infrastructure', value: 'utilities' },
        { label: 'Amenities & Services', value: 'amenities' },
      ],
      admin: {
        description: 'Categorization grouping for display in front-end.',
      },
    },
  ],
}
