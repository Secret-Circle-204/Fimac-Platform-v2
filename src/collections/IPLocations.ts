import type { CollectionConfig } from "payload"

export const IPLocations: CollectionConfig = {
  slug: "ip-locations",
  labels: {
    singular: "IP Location",
    plural: "IP Locations",
  },
  admin: {
    useAsTitle: "hashedIp",
    defaultColumns: ["hashedIp", "country", "region", "city", "source", "lastUsed"],
    group: 'System',
    description: "Cached GeoIP locations for privacy-hashed IP addresses.",
  },
  access: {
    read: ({ req: { user } }) => {
      return user?.collection === "users"
    },
    create: () => true, // Allowed for backend geo resolution process
    update: ({ req: { user } }) => {
      return user?.collection === "users" && user?.role === "admin"
    },
    delete: ({ req: { user } }) => {
      return user?.collection === "users" && user?.role === "admin"
    },
  },
  fields: [
    {
      name: "hashedIp",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "country",
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "region",
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "city",
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "source",
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "lastUsed",
      type: "date",
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
