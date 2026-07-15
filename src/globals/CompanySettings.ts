import type { GlobalConfig } from 'payload'
import { diagnosticAccessWrapper } from '@/lib/diagnostics'
import { revalidateTag } from 'next/cache'

export const CompanySettings: GlobalConfig = {
  slug: 'company-settings',
  label: 'Company Settings',
  admin: {
    group: 'Settings',
  },
  access: {
    // Anyone can read (so the frontend can display it)
    read: diagnosticAccessWrapper('read', () => true),
    // Only logged in users (admins) can update
    update: diagnosticAccessWrapper('update', ({ req }) => req.user?.collection === 'users'),
  },
  hooks: {
    afterChange: [
      ({ doc, context }) => {
        if (!context?.skipCacheInvalidation) {
          revalidateTag('company-settings')
        }
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General Information',
          fields: [
            {
              name: 'companyName',
              label: 'Company Name',
              type: 'text',
              defaultValue: 'Fimac',
              required: true,
            },
            {
              name: 'companyLogo',
              label: 'Company Logo',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Strategic Partner',
          description: 'Settings for the dynamic strategic partner (e.g. Itqan, IKEA) displayed on property pages.',
          fields: [
            {
              name: 'partner',
              type: 'group',
              label: 'Partner Configuration',
              fields: [
                {
                  name: 'isActive',
                  label: 'Enable Partner Features',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: 'Turn this on to show the partner integration (badge, visualization button, and design tab) across all eligible property pages.',
                  },
                },
                {
                  name: 'name',
                  label: 'Partner Name',
                  type: 'text',
                  admin: {
                    condition: (_, siblingData) => siblingData?.isActive,
                    description: 'e.g. Itqan',
                  },
                },
                {
                  name: 'websiteUrl',
                  label: 'Website URL',
                  type: 'text',
                  admin: {
                    condition: (_, siblingData) => siblingData?.isActive,
                    description: 'e.g. https://itcansolution.com/',
                  },
                },
                {
                  name: 'logo',
                  label: 'Partner Logo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    condition: (_, siblingData) => siblingData?.isActive,
                  },
                },
                {
                  name: 'badgeText',
                  label: 'Badge Call to Action Text',
                  type: 'text',
                  defaultValue: 'Imagine your home with',
                  admin: {
                    condition: (_, siblingData) => siblingData?.isActive,
                    description: 'Short promotional text to show next to the logo. e.g. "Imagine your home with".',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Contact Information',
          fields: [
            {
              name: 'contactEmail',
              label: 'Contact Email',
              type: 'text',
              defaultValue: 'info@fimacgroup.com',
              required: true,
            },
            {
              name: 'contactPhone',
              label: 'Contact Phone',
              type: 'text',
              defaultValue: '+1 (234) 567-8900',
              required: true,
            },
            {
              name: 'contactOffice',
              label: 'Office Address',
              type: 'textarea',
              defaultValue: '123 Investment Plaza\nKnoxville, TN 37902',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
