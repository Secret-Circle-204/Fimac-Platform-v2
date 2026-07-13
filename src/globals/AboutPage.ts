import type { GlobalConfig } from 'payload'
import { triggerRevalidate } from '@/lib/cache/revalidate'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
  admin: {
    group: 'Website Pages',
  },
  access: {
    read: () => true,
    update: ({ req }) => req.user?.collection === 'users',
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        triggerRevalidate('about-page')
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero Section',
          fields: [
            {
              name: 'heroTitle',
              label: 'Hero Title',
              type: 'text',
              defaultValue: 'Financial Investment Management Advice Consultants',
              required: true,
            },
            {
              name: 'heroDescription',
              label: 'Hero Description',
              type: 'textarea',
              defaultValue:
                'FIMAC (Financial Investment Management Advice Consultants) is a premier global consultancy specializing in the sale and acquisition of hospitality properties.',
              required: true,
            },
          ],
        },
        {
          label: 'Vision & Mission',
          fields: [
            {
              name: 'visionTitle',
              label: 'Vision Section Title',
              type: 'text',
              defaultValue: 'Built on vision, driven by purpose',
              required: true,
            },
            {
              name: 'visionText',
              label: 'Vision Statement',
              type: 'textarea',
              defaultValue:
                "To be the world's most trusted and influential platform for hospitality property transactions, redefining the standards of excellence and becoming the first choice for professionals seeking to buy or list hospitality assets.",
              required: true,
            },
            {
              name: 'missionText',
              label: 'Mission Statement',
              type: 'textarea',
              defaultValue:
                'Our mission is to empower hospitality business owners, buyers, and brokers by providing a seamless, secure, and expert-led platform that facilitates successful transactions.',
              required: true,
            },
            {
              name: 'visionImage',
              label: 'Vision Section Image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'values',
              type: 'array',
              label: 'Company Values',
              required: true,
              fields: [
                {
                  name: 'title',
                  label: 'Value Title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  label: 'Value Description',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Strengths & Keys of Success',
          fields: [
            {
              name: 'strengthsTitle',
              label: 'Strengths Title',
              type: 'text',
              defaultValue: 'Why hospitality leaders partner with FIMAC',
              required: true,
            },
            {
              name: 'strengths',
              type: 'array',
              label: 'Our Strengths',
              required: true,
              fields: [
                {
                  name: 'strength',
                  label: 'Strength Statement',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'keysOfSuccess',
              type: 'array',
              label: 'Keys of Success',
              required: true,
              fields: [
                {
                  name: 'key',
                  label: 'Success Key',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'strengthsImage',
              label: 'Strengths Section Image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
  ],
}
