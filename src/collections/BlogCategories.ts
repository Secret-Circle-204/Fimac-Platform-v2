import type { CollectionConfig } from "payload"
import slugify from "slugify"

export const BlogCategories: CollectionConfig = {
  slug: "blog-categories",
  labels: {
    singular: "Blog Category",
    plural: "Blog Categories",
  },
  admin: {
    group: 'Content & Marketing',
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "description"],
  },
  access: {
    read: () => true, // Public can read categories
    create: ({ req: { user } }) => user?.collection === "users", // Only admins
    update: ({ req: { user } }) => user?.collection === "users",
    delete: ({ req: { user } }) => user?.collection === "users",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
      label: "Category Name",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "URL Slug",
      admin: {
        description: "URL-friendly version of the category name",
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (!value && data?.name) {
              return slugify(data.name, { lower: true, strict: true })
            }
            return value
          },
        ],
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Category Description",
      admin: {
        description: "Brief description of this category",
      },
    },
    {
      name: "color",
      type: "select",
      label: "Badge Color",
      defaultValue: "blue",
      options: [
        { label: "Blue", value: "blue" },
        { label: "Green", value: "green" },
        { label: "Red", value: "red" },
        { label: "Yellow", value: "yellow" },
        { label: "Purple", value: "purple" },
        { label: "Gray", value: "gray" },
      ],
      admin: {
        description: "Color for category badges in the UI",
      },
    },
  ],
}
