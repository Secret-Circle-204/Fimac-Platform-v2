import type { CollectionConfig } from "payload"

export const VerificationCodes: CollectionConfig = {
  slug: "verification-codes",
  labels: {
    singular: "Verification Code",
    plural: "Verification Codes",
  },
  admin: {
    group: 'System',
    useAsTitle: "email",
    defaultColumns: ["email", "code", "expires_at", "verified"],
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      label: "Email Address",
      index: true,
    },
    {
      name: "code",
      type: "text",
      required: true,
      label: "Verification Code",
      admin: {
        description: "6-digit verification code",
      },
    },
    {
      name: "user_type",
      type: "select",
      required: true,
      options: [
        { label: "Buyer", value: "buyers" },
        { label: "Seller", value: "sellers" },
      ],
      label: "User Type",
    },
    {
      name: "expires_at",
      type: "date",
      required: true,
      label: "Expires At",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "verified",
      type: "checkbox",
      defaultValue: false,
      label: "Verified",
      admin: {
        description: "Has this code been used to verify an account?",
      },
    },
    {
      name: "verified_at",
      type: "date",
      label: "Verified At",
      admin: {
        condition: (data) => data.verified === true,
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "attempts",
      type: "number",
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: "Number of failed verification attempts",
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Set expires_at to 15 minutes from now if creating
        if (operation === "create" && !data.expires_at) {
          const expiresAt = new Date()
          expiresAt.setMinutes(expiresAt.getMinutes() + 15)
          data.expires_at = expiresAt.toISOString()
        }
        return data
      },
    ],
  },
  access: {
    // Only admins can read verification codes
    read: ({ req: { user } }) => user?.collection === "users",
    // API can create codes
    create: () => true,
    // Only admins (and not moderators) can update/delete
    update: ({ req: { user } }) => user?.collection === "users" && user?.role === "admin",
    delete: ({ req: { user } }) => user?.collection === "users" && user?.role === "admin",
  },
}
