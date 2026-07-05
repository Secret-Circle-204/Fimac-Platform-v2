import type { CollectionConfig } from "payload"

export const Newsletters: CollectionConfig = {
  slug: "newsletters",
  labels: {
    singular: "Newsletter Subscriber",
    plural: "Newsletter Subscribers",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "status", "subscribeDate", "source"],
    group: 'Content & Marketing',
  },
  access: {
    // Only admins can access subscriber list
    read: ({ req: { user } }) => user?.collection === "users",
    create: () => true, // Anyone can subscribe
    update: ({ req: { user } }) => user?.collection === "users",
    delete: ({ req: { user } }) => user?.collection === "users",
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      label: "Email Address",
    },
    {
      name: "firstName",
      type: "text",
      label: "First Name",
    },
    {
      name: "lastName",
      type: "text",
      label: "Last Name",
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "subscribed",
      options: [
        { label: "Subscribed", value: "subscribed" },
        { label: "Unsubscribed", value: "unsubscribed" },
        { label: "Bounced", value: "bounced" },
        { label: "Complained", value: "complained" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "subscribeDate",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      label: "Subscribe Date",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "unsubscribeDate",
      type: "date",
      label: "Unsubscribe Date",
      admin: {
        position: "sidebar",
        readOnly: true,
        condition: (data) => data.status === "unsubscribed",
      },
    },
    {
      name: "source",
      type: "select",
      label: "Subscription Source",
      options: [
        { label: "Homepage", value: "homepage" },
        { label: "Blog", value: "blog" },
        { label: "Contact Page", value: "contact" },
        { label: "Footer", value: "footer" },
        { label: "Popup", value: "popup" },
        { label: "Manual Import", value: "manual" },
        { label: "Other", value: "other" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "interests",
      type: "select",
      hasMany: true,
      label: "Interests",
      options: [
        { label: "Investment Opportunities", value: "investment" },
        { label: "Market News", value: "market-news" },
        { label: "Property Listings", value: "listings" },
        { label: "Blog Posts", value: "blog" },
        { label: "Industry Trends", value: "trends" },
        { label: "Events", value: "events" },
      ],
      admin: {
        description: "Types of content the subscriber is interested in",
      },
    },
    {
      name: "preferences",
      type: "group",
      label: "Email Preferences",
      fields: [
        {
          name: "frequency",
          type: "select",
          label: "Email Frequency",
          defaultValue: "weekly",
          options: [
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
          ],
        },
        {
          name: "htmlEmails",
          type: "checkbox",
          defaultValue: true,
          label: "Receive HTML Emails",
        },
      ],
    },
    {
      name: "ipAddress",
      type: "text",
      label: "IP Address",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "userAgent",
      type: "text",
      label: "User Agent",
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: "doubleOptIn",
      type: "checkbox",
      defaultValue: false,
      label: "Double Opt-In Confirmed",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Whether subscriber confirmed their email address",
      },
    },
    {
      name: "confirmationDate",
      type: "date",
      label: "Confirmation Date",
      admin: {
        position: "sidebar",
        readOnly: true,
        condition: (data) => data.doubleOptIn === true,
      },
    },
    {
      name: "notes",
      type: "textarea",
      label: "Internal Notes",
      admin: {
        description: "Internal notes about this subscriber",
      },
    },
  ],
}
