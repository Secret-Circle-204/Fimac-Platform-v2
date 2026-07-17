import type { CollectionConfig } from 'payload'


export const Buyers: CollectionConfig = {
  slug: 'buyers',
  labels: {
    singular: 'Buyer',
    plural: 'Buyers',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days in seconds
  },
  admin: {
    group: 'CRM & Users',
    useAsTitle: 'full_name',
    defaultColumns: ['full_name', 'email', 'verification_status', 'createdAt'],
  },
  fields: [
    {
      name: 'full_name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'company_name',
      type: 'text',
      label: 'Company Name (Optional)',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'google_id',
      type: 'text',
      unique: true,
      label: 'Google Account ID',
      admin: {
        readOnly: true,
        description: 'Linked Google account identifier',
      },
    },
    {
      name: 'profile_image',
      type: 'text',
      label: 'Profile Image URL',
      admin: {
        readOnly: true,
        description: 'Profile image from Google account',
      },
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
          label: 'Documents Submitted',
          value: 'submitted',
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
        description: 'Current verification status of the buyer',
      },
    },
    {
      name: 'proof_of_funds',
      type: 'upload',
      relationTo: 'media',
      label: 'Proof of Funds Document',
      admin: {
        description:
          'Upload proof of financial capability (bank statement, investment portfolio, etc.)',
      },
    },



    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal Notes',
      admin: {
        description: 'Internal notes about this buyer (only visible to admins)',
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
      // Buyers can only see their own data
      return {
        id: {
          equals: user.id,
        },
      }
    },
    // Public can create (for registration), but will need verification
    create: () => true,
    // Only admins and the user themselves can update
    update: ({ req: { user } }) => {
      if (!user) {
        return false
      }
      if (user.collection === 'users') {
        return true
      }
      return {
        id: {
          equals: user.id,
        },
      }
    },
    // Only admins (and not moderators) can delete
    delete: ({ req: { user } }) => {
      return user?.collection === 'users' && user?.role === 'admin'
    },
  },
}
