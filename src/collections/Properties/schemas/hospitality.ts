import type { GroupField } from 'payload'

export const hospitalitySchema: GroupField = {
  name: 'hospitality',
  type: 'group',
  admin: {
    condition: (data) => data?.category === 'hospitality',
  },
  fields: [
    // Common Hospitality Fields
    {
      name: 'totalRooms',
      type: 'number',
      index: true,
      admin: {
        description: 'Total number of rooms / keys available',
      },
    },
    {
      name: 'floors',
      type: 'number',
      defaultValue: 1,
      admin: {
        description: 'Total number of floors/stories',
      },
    },
    {
      name: 'starRating',
      type: 'select',
      options: [
        { label: '1 Star', value: '1' },
        { label: '2 Stars', value: '2' },
        { label: '3 Stars', value: '3' },
        { label: '4 Stars', value: '4' },
        { label: '5 Stars', value: '5' },
      ],
      index: true,
    },
    {
      name: 'brand',
      type: 'text',
      label: 'Management Brand',
      admin: {
        description: 'The operating brand or management brand (e.g. Hilton, Marriott, Wyndham, Independent)',
      },
    },
    {
      name: 'lastRenovationYear',
      type: 'number',
      admin: {
        description: 'The year of last major renovation',
      },
    },
    {
      name: 'hasBeachAccess',
      type: 'checkbox',
      defaultValue: false,
    },

    // SubSchema: Hotel / Boutique Hotel Specifics
    {
      name: 'hotel',
      type: 'group',
      label: 'Hotel / Boutique Hotel Specifics',
      admin: {
        condition: (data) => data?.propertyTypeSlug === 'hotel' || data?.propertyTypeSlug === 'boutique-hotel',
      },
      fields: [
        {
          name: 'suites',
          type: 'number',
          label: 'Total Suites',
          defaultValue: 0,
        },
        {
          name: 'restaurants',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'conferenceRooms',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },

    // SubSchema: Motel Specifics
    {
      name: 'motel',
      type: 'group',
      label: 'Motel Specifics',
      admin: {
        condition: (data) => data?.propertyTypeSlug === 'motel',
      },
      fields: [
        {
          name: 'parkingSpaces',
          type: 'number',
          label: 'Parking Spaces',
          defaultValue: 0,
          admin: {
            description: 'Number of dedicated parking spaces for guests',
          },
        },
        {
          name: 'driveUpRooms',
          type: 'checkbox',
          label: 'Drive-up Rooms',
          defaultValue: false,
          admin: {
            description: 'Has rooms with direct exterior drive-up access from parking',
          },
        },
        {
          name: 'isHighwayAccess',
          type: 'checkbox',
          label: 'Highway Access',
          defaultValue: false,
          admin: {
            description: 'Has direct visibility or access to/from a highway',
          },
        },
      ],
    },

    // SubSchema: Resort Specifics
    {
      name: 'resort',
      type: 'group',
      label: 'Resort Specifics',
      admin: {
        condition: (data) => data?.propertyTypeSlug === 'resort',
      },
      fields: [
        {
          name: 'suites',
          type: 'number',
          label: 'Total Suites',
          defaultValue: 0,
        },
        {
          name: 'hasPrivateBeach',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'hasGolfCourse',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },

    // SubSchema: Camp / Lodge Specifics
    {
      name: 'camp',
      type: 'group',
      label: 'Camp / Eco Lodge Specifics',
      admin: {
        condition: (data) => data?.propertyTypeSlug === 'camp' || data?.propertyTypeSlug === 'eco-lodge',
      },
      fields: [
        {
          name: 'tentCapacity',
          type: 'number',
          defaultValue: 1,
        },
        {
          name: 'hasShowers',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'hasElectricity',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
