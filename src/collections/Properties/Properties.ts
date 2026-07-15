import type { CollectionConfig } from 'payload'
import {
  formatAddress,
  syncLocationHook,
  revalidatePropertyCache,
  revalidatePropertyDeleteCache,
  deleteAssociatedPropertyData,
} from './hooks'
import {
  diagnosticAccessWrapper,
  measureBeforeValidate,
  measureAfterChange,
} from '@/lib/diagnostics'
import { validateLatField, validateLngField } from '@/lib/geo/is-valid-coordinate'
import { buildCategoryFields } from './specs-registry'


export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    group: 'Real Estate',
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'listingStatus'],
  },
  access: {
    read: diagnosticAccessWrapper('read', () => true),
    create: diagnosticAccessWrapper('create', ({ req }) => req.user?.collection === 'users'),
    update: diagnosticAccessWrapper('update', ({ req }) => req.user?.collection === 'users'),
    delete: diagnosticAccessWrapper('delete', ({ req }) => req.user?.collection === 'users'),
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (data?.propertyType) {
          try {
            const pType = await req.payload.findByID({
              collection: 'property-types',
              id: data.propertyType,
              depth: 1,
              req,
            })
            if (pType) {
              data.propertyTypeSlug = pType.slug
              if (pType.category && typeof pType.category === 'object') {
                data.category = pType.category.slug
              }
            }
          } catch (error) {
            req.payload.logger.error(`Error populating type details in Properties beforeValidate: ${error}`)
          }
        }
        return data
      },
      measureBeforeValidate('property_beforeValidate'),
    ],
    beforeChange: [syncLocationHook],
    beforeDelete: [deleteAssociatedPropertyData],
    afterChange: [measureAfterChange('property_afterChange', revalidatePropertyCache)],
    afterRead: [formatAddress],
    afterDelete: [revalidatePropertyDeleteCache],
  },

  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        disabled: true,
      },
    },

    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'sellers',
      index: true,
      admin: {
        description: 'The property owner/seller contact',
        position: 'sidebar',
      },
    },
    {
      name: 'seller_request',
      type: 'relationship',
      relationTo: 'seller-requests',
      index: true,
      admin: {
        description: 'Original seller request (if applicable)',
        position: 'sidebar',
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: {
        description: 'Total tracked property views',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'propertyTypeSlug',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'propertyTypeWatcher',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/fields/PropertyTypeWatcher#PropertyTypeWatcherField',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              type: 'collapsible',
              label: 'Basic Information',
              admin: {
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      index: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'category',
                      type: 'select',
                      required: true,
                      index: true,
                      options: [
                        { label: 'Residential', value: 'residential' },
                        { label: 'Commercial', value: 'commercial' },
                        { label: 'Hospitality', value: 'hospitality' },
                        { label: 'Land', value: 'land' },
                      ],
                      admin: {
                        width: '25%',
                        description: 'Select the main category.',
                      },
                    },
                    {
                      name: 'propertyType',
                      type: 'relationship',
                      relationTo: 'property-types',
                      index: true,
                      filterOptions: ({ data }) => {
                        if (data?.category) {
                          return {
                            'category.slug': {
                              equals: data.category,
                            },
                          }
                        }
                        return false
                      },
                      admin: {
                        width: '25%',
                        description: 'Select property type.',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'listingStatus',
                      type: 'relationship',
                      relationTo: 'listing-statuses',
                      required: true,
                      index: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'constructionStatus',
                      type: 'relationship',
                      relationTo: 'construction-statuses',
                      required: false,
                      index: true,
                      admin: {
                        width: '50%',
                        description: 'Physical construction state.',
                      },
                    },
                  ],
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Pricing & Area Size',
              admin: {
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'price',
                      type: 'number',
                      index: true,
                      admin: {
                        width: '40%',
                      },
                    },
                    {
                      name: 'currency',
                      type: 'select',
                      required: true,
                      defaultValue: 'EGP',
                      index: true,
                      options: [
                        { label: 'EGP (Egyptian Pound)', value: 'EGP' },
                        { label: 'USD (US Dollar)', value: 'USD' },
                        { label: 'EUR (Euro)', value: 'EUR' },
                      ],
                      admin: {
                        width: '20%',
                      },
                    },
                    {
                      name: 'area',
                      type: 'number',
                      index: true,
                      admin: {
                        width: '40%',
                        description: 'Total area in square meters (m²)',
                      },
                    },
                  ],
                },
                {
                  name: 'basePriceInUSD',
                  type: 'number',
                  index: true,
                  admin: {
                    hidden: true,
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Specifications & Performance Metrics',
              admin: {
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'residential',
                  type: 'group',
                  admin: {
                    condition: (data) => data?.category === 'residential',
                  },
                  fields: buildCategoryFields('residential'),
                },
                {
                  name: 'commercial',
                  type: 'group',
                  admin: {
                    condition: (data) => data?.category === 'commercial',
                  },
                  fields: buildCategoryFields('commercial'),
                },
                {
                  name: 'hospitality',
                  type: 'group',
                  admin: {
                    condition: (data) => data?.category === 'hospitality',
                  },
                  fields: buildCategoryFields('hospitality'),
                },
                {
                  name: 'land',
                  type: 'group',
                  admin: {
                    condition: (data) => data?.category === 'land',
                  },
                  fields: buildCategoryFields('land'),
                },
                {
                  name: 'operationalData',
                  type: 'group',
                  label: 'Operational Metrics',
                  admin: {
                    condition: (data) => data?.category === 'hospitality',
                    description: 'Business metrics — updated regularly. Separate from property specifications.',
                  },
                  fields: [
                    { name: 'avgDailyRate', type: 'number', label: 'ADR (Average Daily Rate)' },
                    { name: 'occupancyRate', type: 'number', label: 'Occupancy Rate (%)' },
                    { name: 'revPAR', type: 'number', label: 'RevPAR' },
                    { name: 'lastReportDate', type: 'date', label: 'Last Report Date' },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Features & Custom Specifications',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'features',
                  type: 'relationship',
                  relationTo: 'features',
                  hasMany: true,
                  index: true,
                  admin: {
                    description: 'Select the features for this property.',
                  },
                },
                {
                  name: 'customSpecifications',
                  label: 'Custom Specifications',
                  type: 'array',
                  admin: {
                    initCollapsed: true,
                    description: 'Additional specifications for rare/special cases. Not searchable.',
                  },
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    {
                      name: 'icon',
                      type: 'text',
                      label: 'Lucide Icon Name',
                      admin: {
                        description: 'Optional Lucide icon name (e.g. Wind, Sun, Battery, Wifi)',
                      },
                    },
                    {
                      name: 'valueType',
                      type: 'select',
                      required: true,
                      defaultValue: 'text',
                      options: [
                        { label: 'Text', value: 'text' },
                        { label: 'Number', value: 'number' },
                        { label: 'Date', value: 'date' },
                        { label: 'Yes/No', value: 'boolean' },
                        { label: 'URL', value: 'url' },
                      ],
                    },
                    { name: 'value', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Photos',
          fields: [
            {
              name: 'photos',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                components: {
                  Field: '@/components/admin/fields/CustomMediaField#CustomMediaField',
                },
              },
            },
          ],
        },
        {
          label: 'Location',
          fields: [
            {
              name: 'mapsUrlInput',
              type: 'text',
              label: 'Smart Location Helper',
              admin: {
                description:
                  'Paste a Google Maps URL (short/long), coordinates (lat,lng), or search address to auto-fill details.',
              },
            },
            {
              name: 'location',
              type: 'group',
              label: 'Autonomous Location Data',
              fields: [
                {
                  name: 'geo',
                  type: 'group',
                  label: 'Geospatial Coordinates',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'lat',
                          type: 'number',
                          label: 'Latitude',
                          index: true,
                          validate: validateLatField,
                        },
                        {
                          name: 'lng',
                          type: 'number',
                          label: 'Longitude',
                          index: true,
                          validate: validateLngField,
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'address',
                  type: 'group',
                  label: 'Address Snapshot',
                  fields: [
                    { name: 'street', type: 'text' },
                    {
                      type: 'row',
                      fields: [
                        { name: 'city', type: 'text', index: true },
                        { name: 'state', type: 'text', index: true },
                        { name: 'country', type: 'text', label: 'Country', defaultValue: 'Egypt', index: true },
                        { name: 'zip', type: 'text', index: true },
                      ],
                    },
                    {
                      name: 'fullAddress',
                      type: 'text',
                      admin: {
                        readOnly: true,
                        description: 'Auto-generated from components above.',
                      },
                    },
                  ],
                },
                {
                  name: 'search',
                  type: 'group',
                  admin: { hidden: true },
                  fields: [
                    { name: 'citySlug', type: 'text', index: true },
                    { name: 'stateSlug', type: 'text', index: true },
                    { name: 'normalizedAddress', type: 'text' },
                  ],
                },
                {
                  name: 'meta',
                  type: 'group',
                  label: 'System Metadata',
                  admin: {
                    position: 'sidebar',
                  },
                  fields: [
                    {
                      name: 'source',
                      type: 'select',
                      defaultValue: 'manual',
                      options: [
                        { label: 'Manual Entry', value: 'manual' },
                        { label: 'Google Maps Extraction', value: 'google_maps' },
                        { label: 'Bulk Import', value: 'imported' },
                      ],
                    },
                    { name: 'extractedAt', type: 'date', admin: { readOnly: true } },
                    { name: 'extractionConfidence', type: 'number', admin: { readOnly: true } },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Legacy Data (Read-only during transition)',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'street',
                  type: 'text',
                  admin: { readOnly: true },
                  label: 'Legacy Street',
                },
                {
                  name: 'location_legacy',
                  type: 'relationship',
                  relationTo: 'locations',
                  index: true,
                  admin: { readOnly: true },
                  label: 'Legacy Relation',
                },
              ],
            },
          ],
        },
        {
          label: 'Project',
          fields: [
            {
              name: 'hasProject',
              type: 'checkbox',
              label: 'Has Project Details',
              defaultValue: false,
            },
            {
              name: 'projectImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Project Image',
              admin: {
                condition: (data) => !!data?.hasProject,
              },
            },
            {
              name: 'projectDescription',
              type: 'richText',
              label: 'Project Description',
              admin: {
                condition: (data) => !!data?.hasProject,
              },
            },
          ],
        },
      ],
    },
  ],
}
