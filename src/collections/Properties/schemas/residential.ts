import type { GroupField } from 'payload'
import { heatingTypeOptions } from '../heating-options'

export const residentialSchema: GroupField = {
  name: 'residential',
  type: 'group',
  admin: {
    condition: (data) => data?.category === 'residential',
  },
  fields: [
    // Common Residential Fields
    {
      name: 'bedrooms',
      type: 'number',
      index: true,
      admin: {
        description: 'Number of bedrooms',
      },
    },
    {
      name: 'bathrooms',
      type: 'number',
      index: true,
      admin: {
        description: 'Number of bathrooms',
      },
    },
    {
      name: 'floor',
      type: 'number',
      admin: {
        description: 'Floor number (e.g. for apartments)',
      },
    },
    {
      name: 'floors',
      type: 'number',
      admin: {
        description: 'Total number of floors/stories (e.g. for villas)',
      },
    },
    {
      name: 'yearBuilt',
      type: 'number',
      admin: {
        description: 'The year the property was built',
      },
    },
    {
      name: 'heatingType',
      type: 'select',
      options: heatingTypeOptions,
      admin: {
        description: 'Type of heating system',
      },
    },

    // SubSchema: Villa / Penthouse / Townhouse details
    {
      name: 'villa',
      type: 'group',
      label: 'Villa / Townhouse Specifics',
      admin: {
        description: 'Details specific to villas, penthouses, and townhouses',
        condition: (data) => data?.propertyTypeSlug === 'villa' || data?.propertyTypeSlug === 'penthouse' || data?.propertyTypeSlug === 'townhouse' || data?.propertyTypeSlug === 'duplex',
      },
      fields: [
        {
          name: 'pools',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'hasGarden',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'hasGarage',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'hasMajlis',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'hasDriverRoom',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'hasMaidRoom',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },

    // SubSchema: Apartment / Duplex / Studio details
    {
      name: 'apartment',
      type: 'group',
      label: 'Apartment / Studio Specifics',
      admin: {
        description: 'Details specific to apartments, studios, and duplexes',
        condition: (data) => data?.propertyTypeSlug === 'apartment' || data?.propertyTypeSlug === 'studio' || data?.propertyTypeSlug === 'duplex',
      },
      fields: [
        {
          name: 'hasBalcony',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'hasMaidRoom',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },

    // SubSchema: Chalet details
    {
      name: 'chalet',
      type: 'group',
      label: 'Chalet Specifics',
      admin: {
        description: 'Details specific to chalets and holiday homes',
        condition: (data) => data?.propertyTypeSlug === 'chalet',
      },
      fields: [
        {
          name: 'hasPool',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'hasGarden',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isBeachfront',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
