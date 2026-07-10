import type { CollectionConfig } from "payload"

export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  labels: {
    singular: "Contact Message",
    plural: "Contact Messages",
  },
  admin: {
    useAsTitle: "subject",
    defaultColumns: ["fullName", "email", "inquiryType", "status", "createdAt"],
    group: 'Content & Marketing',
  },
  access: {
    // Only admins can access contact messages
    read: ({ req: { user } }) => user?.collection === "users",
    create: () => true, // Anyone can submit a contact form
    update: ({ req: { user } }) => user?.collection === "users",
    delete: ({ req: { user } }) => user?.collection === "users",
  },
  fields: [
    {
      name: "fullName",
      type: "text",
      required: true,
      label: "Full Name",
    },
    {
      name: "email",
      type: "email",
      required: true,
      label: "Email Address",
    },
    {
      name: "phone",
      type: "text",
      label: "Phone Number",
    },
    {
      name: "inquiryType",
      type: "select",
      required: true,
      options: [
        { label: "Buying Opportunities", value: "buyer" },
        { label: "List My Property", value: "property-owner" },
        { label: "General Inquiry", value: "general" },
        { label: "Partnership Opportunities", value: "partnership" },
        { label: "Technical Support", value: "support" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "subject",
      type: "text",
      required: true,
      label: "Subject",
    },
    {
      name: "message",
      type: "textarea",
      required: true,
      label: "Message",
    },
    {
      name: "property",
      type: "relationship",
      relationTo: "properties",
      label: "Related Property",
      admin: {
        description: "The property this inquiry is about (if applicable)",
      },
    },
    {
      name: "preferredContact",
      type: "select",
      label: "Preferred Contact Method",
      options: [
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "WhatsApp", value: "whatsapp" },
      ],
    },
    {
      name: "buyingTimeline",
      type: "select",
      label: "Buying Timeline",
      options: [
        { label: "Immediately", value: "immediate" },
        { label: "1-3 Months", value: "1_to_3_months" },
        { label: "3-6 Months", value: "3_to_6_months" },
        { label: "6+ Months", value: "6_plus_months" },
        { label: "Just Browsing", value: "browsing" },
      ],
    },
    {
      name: "budgetRange",
      type: "group",
      label: "Budget Range",
      fields: [
        {
          name: "min",
          type: "number",
          label: "Minimum Budget",
        },
        {
          name: "max",
          type: "number",
          label: "Maximum Budget",
        },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "In Progress", value: "in-progress" },
        { label: "Resolved", value: "resolved" },
        { label: "Archived", value: "archived" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "priority",
      type: "select",
      defaultValue: "normal",
      options: [
        { label: "Low", value: "low" },
        { label: "Normal", value: "normal" },
        { label: "High", value: "high" },
        { label: "Urgent", value: "urgent" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "assignedTo",
      type: "relationship",
      relationTo: "users",
      label: "Assigned To",
      admin: {
        position: "sidebar",
        description: "Assign this message to a team member",
      },
    },
    {
      name: "notes",
      type: "textarea",
      label: "Internal Notes",
      admin: {
        description: "Internal notes for team (not visible to sender)",
      },
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
      name: "doubleOptInConfirmed",
      type: "checkbox",
      defaultValue: false,
      label: "Email Confirmed",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "confirmedAt",
      type: "date",
      label: "Confirmed At",
      admin: {
        position: "sidebar",
        readOnly: true,
        condition: (data) => data.doubleOptInConfirmed === true,
      },
    },
    {
      name: "confirmationToken",
      type: "text",
      label: "Confirmation Token",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Auto-generated double opt-in token",
      },
    },
    {
      name: "confirmationExpiresAt",
      type: "date",
      label: "Confirmation Expires At",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Token expires after 24 hours",
      },
    },
  ],
}
