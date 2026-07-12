import type { CollectionConfig } from "payload"

export const PropertyViews: CollectionConfig = {
  slug: "property-views",
  labels: {
    singular: "Property View",
    plural: "Property Views",
  },
  admin: {
    useAsTitle: "id",
    defaultColumns: ["property", "user", "viewedAt", "source", "device"],
    group: 'Real Estate',
    description: "System-generated analytics log of unique property views. This collection is read-only.",
    components: {
      views: {
        list: {
          Component: "@/components/admin/PropertyViewsDashboard",
        },
      },
    },
  },
  access: {
    read: ({ req: { user } }) => {
      return user?.collection === "users"
    },
    create: () => true,
    update: ({ req: { user } }) => {
      // Only admins can update
      return user?.collection === "users"
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete
      return user?.collection === "users"
    },
  },
  fields: [
    {
      name: "property",
      type: "relationship",
      relationTo: "properties",
      required: true,
      index: true,
      admin: {
        readOnly: true,
        description: "The property that was viewed",
      },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: ["buyers", "sellers"],
      index: true,
      admin: {
        readOnly: true,
        description: "The logged-in buyer or seller who viewed the property (optional)",
      },
    },
    {
      name: "visitorId",
      type: "text",
      required: true,
      index: true,
      admin: {
        readOnly: true,
        description: "Unique identifier for the visitor (hashed fingerprint)",
      },
    },
    {
      name: "sessionId",
      type: "text",
      index: true,
      admin: {
        readOnly: true,
        description: "Session identifier for tracking multiple views in one session",
      },
    },
    {
      name: "viewedAt",
      type: "date",
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
        date: {
          displayFormat: "MMM dd, yyyy - hh:mm a",
        },
      },
    },
    {
      name: "userAgent",
      type: "text",
      admin: {
        readOnly: true,
        description: "Browser user agent",
      },
    },
    {
      name: "ipAddress",
      type: "text",
      index: true,
      admin: {
        readOnly: true,
        description: "Visitor IP address (hashed for privacy)",
      },
    },
    {
      name: "source",
      type: "select",
      options: [
        { label: "Direct", value: "direct" },
        { label: "Search Engine", value: "search" },
        { label: "Social Media", value: "social" },
        { label: "Email", value: "email" },
        { label: "Referral", value: "referral" },
        { label: "Other", value: "other" },
      ],
      admin: {
        readOnly: true,
        description: "Traffic source",
      },
    },
    {
      name: "referrer",
      type: "text",
      admin: {
        readOnly: true,
        description: "Referrer URL",
      },
    },
    {
      name: "device",
      type: "select",
      options: [
        { label: "Desktop", value: "desktop" },
        { label: "Mobile", value: "mobile" },
        { label: "Tablet", value: "tablet" },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: "location",
      type: "group",
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: "country",
          type: "text",
        },
        {
          name: "city",
          type: "text",
        },
        {
          name: "region",
          type: "text",
        },
      ],
    },
  ],
  timestamps: true,
}
