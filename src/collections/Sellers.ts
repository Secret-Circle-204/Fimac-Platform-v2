import type { CollectionConfig } from 'payload'

export const Sellers: CollectionConfig = {
  slug: 'sellers',
  labels: {
    singular: 'Seller',
    plural: 'Sellers',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days in seconds
  },
  admin: {
    useAsTitle: 'full_name',
    defaultColumns: ['full_name', 'email', 'properties_count', 'verification_status', 'createdAt'],
    group: 'CRM & Users',
    description: 'Registered sellers/owners with properties listed',
  },
  fields: [
    {
      name: 'full_name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Phone Number',
    },
    {
      name: 'company_name',
      type: 'text',
      label: 'Company / Business Name (Optional)',
    },
    {
      name: 'verification_status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending Verification',
          value: 'pending',
        },
        {
          label: 'Verified - Active',
          value: 'verified',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
      admin: {
        description: 'Current verification status of the seller',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal Notes',
      admin: {
        description: 'Internal notes about this seller (only visible to admins)',
      },
    },
    {
      name: 'properties_count',
      type: 'number',
      label: 'Linked Properties Count',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Total number of properties listed on the platform for this seller',
      },
    },
  ],
  access: {
    // Only authenticated users can read
    read: ({ req: { user } }) => {
      if (!user) {
        return false
      }
      // Admins (users collection) can see all
      if (user.collection === 'users') {
        return true
      }
      // Sellers can only see their own data
      if (user.collection === 'sellers') {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Public can create (for registration)
    create: () => true,
    // Only admins and the user themselves can update
    update: ({ req: { user } }) => {
      if (!user) {
        return false
      }
      if (user.collection === 'users') {
        return true
      }
      if (user.collection === 'sellers') {
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    // Only admins (and not moderators) can delete
    delete: ({ req: { user } }) => {
      return user?.collection === 'users' && user?.role === 'admin'
    },
  },
}
