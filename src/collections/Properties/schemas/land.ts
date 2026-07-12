import type { GroupField } from 'payload'

export const landSchema: GroupField = {
  name: 'land',
  type: 'group',
  admin: {
    condition: (data) => data?.category === 'land',
  },
  fields: [
    {
      name: 'zoning',
      type: 'select',
      options: [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Industrial', value: 'industrial' },
        { label: 'Agricultural', value: 'agricultural' },
        { label: 'Mixed Use', value: 'mixed' },
      ],
      index: true,
      admin: {
        description: 'Approved zoning classification for the land',
      },
    },
    {
      name: 'roadWidth',
      type: 'number',
      admin: {
        description: 'Width of the main road facing the land (in meters)',
      },
    },
    {
      name: 'frontageWidth',
      type: 'number',
      admin: {
        description: 'Length of the property line bordering the street (in meters)',
      },
    },
    {
      name: 'hasUtilities',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Electricity, water, and sewage connections available',
      },
    },
    {
      name: 'allowedFloors',
      type: 'number',
      admin: {
        description: 'Maximum number of building floors allowed by permit',
      },
    },
    {
      name: 'buildingRatio',
      type: 'number',
      admin: {
        description: 'Maximum footprint percentage allowed to build on (e.g. 60 for 60%)',
      },
    },
    {
      name: 'isCorner',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Is the plot located on a corner (faces two streets)',
      },
    },
    {
      name: 'slope',
      type: 'select',
      options: [
        { label: 'Flat / Level', value: 'flat' },
        { label: 'Gentle Slope', value: 'gentle' },
        { label: 'Moderate Slope', value: 'moderate' },
        { label: 'Steep Slope', value: 'steep' },
      ],
      admin: {
        description: 'The physical gradient/slope of the land',
      },
    },
    {
      name: 'soilType',
      type: 'text',
      admin: {
        description: 'Type of soil or ground structure (e.g. Sandy, Rocky, Clay)',
      },
    },
  ],
}
