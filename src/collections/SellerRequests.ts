import type { CollectionConfig } from 'payload'
import { service } from '@/services'
import { triggerRevalidate } from '@/lib/cache/revalidate'

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
      async ({ doc }) => {
        const sellerId = doc.seller && typeof doc.seller === 'object' ? doc.seller.id : doc.seller;
        if (sellerId) {
          triggerRevalidate(`seller-requests-${sellerId}`);
        }
      }
    ],
    afterDelete: [
      async ({ doc }) => {
        const sellerId = doc.seller && typeof doc.seller === 'object' ? doc.seller.id : doc.seller;
        if (sellerId) {
          triggerRevalidate(`seller-requests-${sellerId}`);
        }
      }
    ]
  },
  fields: [
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
              name: 'bedrooms',
              type: 'number',
              label: 'Bedrooms',
            },
            {
              name: 'bathrooms',
              type: 'number',
              label: 'Bathrooms',
            },
            {
              name: 'constructionStatus',
              type: 'relationship',
              relationTo: 'construction-statuses',
              required: true,
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
