import type { GroupField } from 'payload'

export const commercialSchema: GroupField = {
  name: 'commercial',
  type: 'group',
  admin: {
    condition: (data) => data?.category === 'commercial',
  },
  fields: [
    // Common Commercial Fields
    {
      name: 'floor',
      type: 'number',
      admin: {
        description: 'Floor number where the property is located',
      },
    },
    {
      name: 'parkingSpaces',
      type: 'number',
      index: true,
      admin: {
        description: 'Number of dedicated parking spaces',
      },
    },
    {
      name: 'licenseType',
      type: 'text',
      admin: {
        description: 'Type of license required/available (e.g. Commercial, Administrative, Medical)',
      },
    },

    // SubSchema: Office Specifics
    {
      name: 'office',
      type: 'group',
      label: 'Office Specifics',
      admin: {
        condition: (data) => data?.propertyTypeSlug === 'office' || data?.propertyTypeSlug === 'coworking-space',
      },
      fields: [
        {
          name: 'meetingRooms',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'hasReception',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'internetType',
          type: 'select',
          options: [
            { label: 'Fiber Optic', value: 'fiber' },
            { label: 'ADSL / VDSL', value: 'adsl' },
            { label: 'None', value: 'none' },
          ],
        },
        {
          name: 'securityLevel',
          type: 'select',
          options: [
            { label: '24/7 Gated / Guarded', value: '24_7' },
            { label: 'Business Hours Only', value: 'business_hours' },
            { label: 'None', value: 'none' },
          ],
        },
        {
          name: 'elevators',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },

    // SubSchema: Restaurant / Cafe Specifics
    {
      name: 'restaurant',
      type: 'group',
      label: 'Restaurant / Cafe Specifics',
      admin: {
        condition: (data) => data?.propertyTypeSlug === 'restaurant' || data?.propertyTypeSlug === 'cafe',
      },
      fields: [
        {
          name: 'kitchenCount',
          type: 'number',
          defaultValue: 1,
        },
        {
          name: 'hasExhaust',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'hasGasConnection',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'outdoorSeatingCapacity',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },

    // SubSchema: Warehouse Specifics
    {
      name: 'warehouse',
      type: 'group',
      label: 'Warehouse Specifics',
      admin: {
        condition: (data) => data?.propertyTypeSlug === 'warehouse',
      },
      fields: [
        {
          name: 'loadingDocks',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'ceilingHeight',
          type: 'number',
          admin: {
            description: 'Ceiling height in meters',
          },
        },
        {
          name: 'hasTruckAccess',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'fireSystem',
          type: 'select',
          options: [
            { label: 'Automatic Sprinklers', value: 'sprinkler' },
            { label: 'Extinguishers Only', value: 'extinguisher' },
            { label: 'Full Integrated Fire System', value: 'full' },
            { label: 'None', value: 'none' },
          ],
        },
      ],
    },

    // SubSchema: Factory Specifics
    {
      name: 'factory',
      type: 'group',
      label: 'Factory Specifics',
      admin: {
        condition: (data) => data?.propertyTypeSlug === 'factory',
      },
      fields: [
        {
          name: 'powerCapacityKW',
          type: 'number',
          admin: {
            description: 'Power capacity in Kilowatts (KW)',
          },
        },
        {
          name: 'hazardZone',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Low Hazard', value: 'low' },
            { label: 'Medium Hazard', value: 'medium' },
            { label: 'High Hazard', value: 'high' },
          ],
        },
        {
          name: 'industrialLicense',
          type: 'text',
        },
      ],
    },

    // SubSchema: Retail Shop / Mall Specifics
    {
      name: 'retail',
      type: 'group',
      label: 'Retail / Shop Specifics',
      admin: {
        condition: (data) => data?.propertyTypeSlug === 'retail-shop' || data?.propertyTypeSlug === 'mall',
      },
      fields: [
        {
          name: 'frontageWidth',
          type: 'number',
          admin: {
            description: 'Frontage width in meters',
          },
        },
        {
          name: 'hasStorageRoom',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'ceilingHeight',
          type: 'number',
        },
      ],
    },

    // SubSchema: Medical Specifics
    {
      name: 'medical',
      type: 'group',
      label: 'Medical (Clinic / Lab / Center) Specifics',
      admin: {
        condition: (data) => data?.propertyTypeSlug === 'clinic' || data?.propertyTypeSlug === 'medical-center' || data?.propertyTypeSlug === 'hospital',
      },
      fields: [
        {
          name: 'hasWaitingRoom',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'medicalLicense',
          type: 'text',
        },
        {
          name: 'numberOfExamRooms',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
  ],
}
