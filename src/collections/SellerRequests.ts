import type { CollectionConfig } from 'payload'

export const SellerRequests: CollectionConfig = {
  slug: 'seller-requests',
  labels: {
    singular: 'Seller Request',
    plural: 'Seller Requests',
  },
  admin: {
    useAsTitle: 'property_title',
    defaultColumns: ['property_title', 'full_name', 'property_type', 'status', 'createdAt'],
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
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Seller Information',
          fields: [
            {
              name: 'full_name',
              type: 'text',
              required: true,
              label: 'Full Name',
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              label: 'Email Address',
            },
            {
              name: 'phone',
              type: 'text',
              required: true,
              label: 'Phone Number',
            },
          ],
        },
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
              label: 'Property Location',
              admin: {
                description: 'City, State, or full address',
              },
            },
            {
              name: 'asking_price',
              type: 'number',
              label: 'Asking Price (USD)',
            },
            {
              name: 'property_size',
              type: 'number',
              label: 'Property Size (sq ft / acres)',
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
      name: 'seller',
      type: 'relationship',
      relationTo: 'sellers',
      label: 'Seller Profile',
      admin: {
        position: 'sidebar',
        description: 'Auto-linked seller account record',
        readOnly: true,
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
}
