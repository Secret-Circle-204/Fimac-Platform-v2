import type { CollectionConfig } from 'payload'
import { listingStatusOptions } from './listing-status-map'
import { heatingTypeOptions } from './heating-options'
import { formatAddress, syncLocationHook, revalidatePropertyCache, revalidatePropertyDeleteCache } from './hooks'
import {
  diagnosticAccessWrapper,
  measureBeforeValidate,
  measureAfterChange,
} from '@/lib/diagnostics'
import { validateLatField, validateLngField } from '@/lib/geo/is-valid-coordinate'

export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    group: 'Real Estate',
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'listingStatus'],
  },
  access: {
    read: diagnosticAccessWrapper('read', () => true),
    create: diagnosticAccessWrapper(
      'create',
      ({ req }) => req.user?.collection === 'users',
    ),
    update: diagnosticAccessWrapper(
      'update',
      ({ req }) => req.user?.collection === 'users',
    ),
    delete: diagnosticAccessWrapper(
      'delete',
      ({ req }) => req.user?.collection === 'users',
    ),
  },
  hooks: {
    beforeValidate: [measureBeforeValidate('property_beforeValidate')],
    beforeChange: [syncLocationHook],
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
      admin: {
        description: 'Total tracked property views',
        position: 'sidebar',
        readOnly: true,
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
            },
            {
              name: 'propertyType',
              type: 'relationship',
              relationTo: 'property-types',
              index: true,
              admin: {
                description: 'Select or add the type of this property.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  index: true,
                  admin: {
                    width: '70%',
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
                    width: '30%',
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
            {
              name: 'listingStatus',
              type: 'select',
              required: true,
              index: true,
              options: listingStatusOptions,
            },
            {
              name: 'constructionStatus',
              type: 'select',
              required: true,
              defaultValue: 'ready',
              index: true,
              options: [
                { label: 'Ready to Move In', value: 'ready' },
                { label: 'Under Construction', value: 'under_construction' },
                { label: 'Brand New (First Occupancy)', value: 'brand_new' },
                { label: 'Off-Plan', value: 'off_plan' },
                { label: 'Fully Renovated', value: 'renovated' },
              ],
              admin: {
                description: 'The physical construction state of the property.',
              },
            },
            {
              name: 'details',
              type: 'group',
              fields: [
                {
                  name: 'bedrooms',
                  type: 'number',
                },
                {
                  name: 'bathrooms',
                  type: 'number',
                },
                {
                  name: 'squareMeters',
                  type: 'number',
                },
                {
                  name: 'lotSize',
                  type: 'number',
                },
                {
                  name: 'yearBuilt',
                  type: 'number',
                },
                {
                  name: 'heatingType',
                  type: 'select',
                  options: heatingTypeOptions,
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
                description: 'Paste a Google Maps URL (short/long), coordinates (lat,lng), or search address to auto-fill details.',
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
                        { name: 'lat', type: 'number', label: 'Latitude', index: true, validate: validateLatField },
                        { name: 'lng', type: 'number', label: 'Longitude', index: true, validate: validateLngField },
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
                        { name: 'city', type: 'text' },
                        { name: 'state', type: 'text' },
                        { name: 'country', type: 'text', label: 'Country', defaultValue: 'Egypt' },
                        { name: 'zip', type: 'text' },
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
          label: 'Features',
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
          ],
        },
      ],
    },
  ],
}
