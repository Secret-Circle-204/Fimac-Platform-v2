import type { CollectionConfig } from 'payload'
import { service } from '@/services'
import { triggerRevalidate } from '@/lib/cache/revalidate'
import { buildCategoryFields } from './Properties/specs-registry'


export const SellerRequests: CollectionConfig = {
  slug: 'seller-requests',
  labels: {
    singular: 'Seller Request',
    plural: 'Seller Requests',
  },
  admin: {
    useAsTitle: 'referenceNumber',
    defaultColumns: ['referenceNumber', 'property_title', 'full_name', 'property_type', 'status', 'createdAt'],
    group: 'CRM & Users',
    description: 'Incoming property listing requests from sellers',
  },
  access: {
    create: () => true, // Anyone can submit a listing request
    read: ({ req: { user } }) => user?.collection === 'users',
    update: ({ req: { user } }) => user?.collection === 'users',
    delete: ({ req: { user } }) => user?.collection === 'users',
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (data?.property_type) {
          try {
            const pType = await req.payload.findByID({
              collection: 'property-types',
              id: data.property_type,
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
            req.payload.logger.error(`Error populating type details in SellerRequests beforeValidate: ${error}`)
          }
        }
        return data
      }
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation !== 'create') return data

        // Auto-create or link a Seller record
        try {
          const existingSellers = await req.payload.find({
            collection: 'sellers',
            where: {
              or: [{ email: { equals: data.email } }, { phone: { equals: data.phone } }],
            },
            limit: 1,
            depth: 0,
          })

          let sellerId: number | string

          if (existingSellers.docs.length > 0) {
            // Link to existing seller
            sellerId = existingSellers.docs[0].id
          } else {
            // Create new seller with secure temporary password
            const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
            const newSeller = await req.payload.create({
              collection: 'sellers',
              data: {
                full_name: data.full_name,
                email: data.email,
                password: tempPassword,
                phone: data.phone,
                verification_status: 'pending',
              },
            })
            sellerId = newSeller.id
          }

          // Directly assign the seller ID to the document data before saving
          data.seller = sellerId
        } catch (error) {
          console.error('Error auto-linking seller in beforeChange:', error)
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, context }) => {
        if (context?.skipCacheInvalidation) return;
        const sellerId = doc.seller && typeof doc.seller === 'object' ? doc.seller.id : doc.seller;
        if (sellerId) {
          triggerRevalidate(`seller-requests-${sellerId}`);
        }
      }
    ],
    afterDelete: [
      async ({ doc, context }) => {
        if (context?.skipCacheInvalidation) return;
        const sellerId = doc.seller && typeof doc.seller === 'object' ? doc.seller.id : doc.seller;
        if (sellerId) {
          triggerRevalidate(`seller-requests-${sellerId}`);
        }
      }
    ]
  },
  fields: [
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
      name: 'category',
      type: 'select',
      options: [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Hospitality', value: 'hospitality' },
        { label: 'Land', value: 'land' },
      ],
      admin: {
        readOnly: true,
        description: 'Automatically derived from property type.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Property Details',
          fields: [
            {
              name: 'property_type',
              type: 'relationship',
              relationTo: 'property-types',
              required: true,
              label: 'Property Type',
            },
            {
              name: 'property_title',
              type: 'text',
              required: true,
              label: 'Property Title',
            },
            {
              name: 'property_description',
              type: 'textarea',
              required: true,
              label: 'Property Description',
            },
            {
              name: 'property_location',
              type: 'text',
              required: true,
              label: 'Address / Street',
            },
            {
              name: 'city',
              type: 'text',
              required: true,
              label: 'City',
            },
            {
              name: 'state',
              type: 'text',
              required: true,
              label: 'State / Region',
            },
            {
              name: 'country',
              type: 'text',
              required: true,
              label: 'Country',
              defaultValue: 'Egypt',
            },
            {
              name: 'zip',
              type: 'text',
              label: 'Zip / Postal Code',
            },
            {
              name: 'full_address',
              type: 'text',
              label: 'Full Address',
            },
            {
              name: 'asking_price',
              type: 'number',
              required: true,
              label: 'Asking Price',
            },
            {
              name: 'currency',
              type: 'select',
              required: true,
              defaultValue: 'USD',
              options: [
                { label: 'EGP (Egyptian Pound)', value: 'EGP' },
                { label: 'USD (US Dollar)', value: 'USD' },
                { label: 'EUR (Euro)', value: 'EUR' },
              ],
            },
            {
              name: 'property_size',
              type: 'number',
              label: 'Property Size (Sq M)',
            },
            {
              name: 'latitude',
              type: 'number',
              label: 'Latitude',
            },
            {
              name: 'longitude',
              type: 'number',
              label: 'Longitude',
            },
            {
              name: 'google_maps_url',
              type: 'text',
              label: 'Google Maps Link',
            },
            {
              name: 'constructionStatus',
              type: 'relationship',
              relationTo: 'construction-statuses',
              required: true,
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
              ],
            },
            {
              name: 'features',
              type: 'relationship',
              relationTo: 'features',
              hasMany: true,
              index: true,
              admin: {
                description: 'Select the features for this property request.',
              },
            },
            {
              name: 'customSpecifications',
              label: 'Custom Specifications',
              type: 'array',
              admin: {
                initCollapsed: true,
                description: 'Additional specifications for rare/special cases.',
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
        {
          label: 'Seller Information',
          fields: [
            {
              name: 'full_name',
              type: 'text',
              required: true,
              label: 'Full Name',
              admin: {
                readOnly: true,
                description: 'Registered name of the seller at submission time.',
              },
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              label: 'Email Address',
              admin: {
                readOnly: true,
                description: 'Registered email address of the seller at submission time.',
              },
            },
            {
              name: 'phone',
              type: 'text',
              required: true,
              label: 'Phone Number',
              admin: {
                readOnly: true,
                description: 'Registered phone number of the seller at submission time.',
              },
            },
          ],
        },
      ],
    },
    // Sidebar fields
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Under Review', value: 'reviewing' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Listed', value: 'listed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'referenceNumber',
      type: 'text',
      label: 'Reference Number',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        afterRead: [
          ({ data }) => {
            return data?.id ? `Request #${data.id}` : undefined
          },
        ],
      },
    },
    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'sellers',
      index: true,
      label: 'Seller Profile',
      admin: {
        position: 'sidebar',
        description: 'Auto-linked seller account record',
        readOnly: true,
      },
    },
    {
      name: 'publishedProperty',
      type: 'relationship',
      relationTo: 'properties',
      label: 'Published Property',
      admin: {
        position: 'sidebar',
        description: 'The live property document created from this request',
        readOnly: true,
      },
    },
    {
      name: 'publishButton',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/admin/fields/PublishButton#PublishButtonField',
        },
      },
    },
    {
      name: 'admin_notes',
      type: 'textarea',
      label: 'Admin Notes',
      admin: {
        description: 'Internal notes (not visible to seller)',
      },
    },
  ],
  endpoints: [
    {
      path: '/:id/publish',
      method: 'post',
      handler: async (req) => {
        const { user, payload } = req

        // Authorization: only authenticated admin users
        if (!user || user.collection !== 'users') {
          return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 401 })
        }

        const requestId = req.routeParams?.id
        if (!requestId) {
          return Response.json({ error: 'Missing seller request ID' }, { status: 400 })
        }

        try {
          const result = await service.propertyPublishing.publishRequest(Number(requestId), req)

          let sellerId: string | number | null | undefined = undefined
          if (result.property.seller) {
            if (typeof result.property.seller === 'object' && 'id' in result.property.seller) {
              sellerId = result.property.seller.id
            } else if (typeof result.property.seller === 'number' || typeof result.property.seller === 'string') {
              sellerId = result.property.seller
            }
          }

          if (sellerId) {
            triggerRevalidate(`seller-properties-${sellerId}`)
            triggerRevalidate(`seller-requests-${sellerId}`)
          }
          triggerRevalidate('search-results')
          triggerRevalidate('featured-properties')
          triggerRevalidate('search-filters')

          return Response.json({
            success: true,
            propertyId: result.property.id,
            alreadyPublished: result.alreadyPublished,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Publishing failed'
          payload.logger.error(`[SellerRequests:publish] ${message}`)
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  ],
}
