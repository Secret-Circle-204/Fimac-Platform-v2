import type { CollectionConfig } from "payload"
import { triggerRevalidate } from '@/lib/cache/revalidate'
import { getUniqueSlugHook } from "@/lib/slug"

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  labels: {
    singular: "Blog Post",
    plural: "Blog Posts",
  },
  admin: {
    group: 'Website Pages',
    useAsTitle: "title",
    defaultColumns: ["title", "author", "category", "publishedDate", "status"],
    preview: (doc) => {
      return `/blog/${doc.slug}`
    },
  },
  hooks: {
    afterChange: [
      () => {
        triggerRevalidate('blog-posts')
        triggerRevalidate('blog')
      }
    ],
    afterDelete: [
      () => {
        triggerRevalidate('blog-posts')
        triggerRevalidate('blog')
      }
    ]
  },
  access: {
    // Only published posts are visible to public
    read: ({ req: { user } }) => {
      if (user?.collection === "users") {
        return true // Admins can see all posts
      }
      return {
        status: {
          equals: "published",
        },
      }
    },
    create: ({ req: { user } }) => user?.collection === "users",
    update: ({ req: { user } }) => user?.collection === "users",
    delete: ({ req: { user } }) => user?.collection === "users",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: "Post Title",
            },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              label: "URL Slug",
              admin: {
                hidden: true,
              },
              hooks: {
                beforeValidate: [getUniqueSlugHook("title")],
              },
            },
            {
              name: "excerpt",
              type: "textarea",
              required: true,
              label: "Excerpt",
              admin: {
                description: "Brief summary (150-200 characters recommended)",
              },
            },
            {
              name: "content",
              type: "richText",
              required: true,
              label: "Post Content",
            },
            {
              name: "featuredImage",
              type: "upload",
              relationTo: "media",
              required: true,
              label: "Featured Image",
              admin: {
                description: "Main image for the post (recommended: 1200x630px)",
              },
            },
          ],
        },
        {
          label: "Meta",
          fields: [
            {
              name: "author",
              type: "text",
              required: true,
              defaultValue: "Fimac Group Team",
              label: "Author Name",
            },
            {
              name: "category",
              type: "relationship",
              relationTo: "blog-categories",
              required: true,
              label: "Category",
            },
            {
              name: "tags",
              type: "array",
              label: "Tags",
              fields: [
                {
                  name: "tag",
                  type: "text",
                },
              ],
              admin: {
                description: "Tags for better organization and SEO",
              },
            },
            {
              name: "status",
              type: "select",
              required: true,
              index: true,
              defaultValue: "draft",
              options: [
                {
                  label: "Draft",
                  value: "draft",
                },
                {
                  label: "Published",
                  value: "published",
                },
                {
                  label: "Archived",
                  value: "archived",
                },
              ],
            },
            {
              name: "publishedDate",
              type: "date",
              label: "Published Date",
              index: true,
              admin: {
                description: "The date when this post was/will be published",
                date: {
                  pickerAppearance: "dayAndTime",
                },
              },
            },
            {
              name: "featured",
              type: "checkbox",
              defaultValue: false,
              label: "Featured Post",
              admin: {
                description: "Display this post prominently on the blog homepage",
              },
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seo",
              type: "group",
              fields: [
                {
                  name: "metaTitle",
                  type: "text",
                  label: "Meta Title",
                  admin: {
                    description: "Custom SEO title (defaults to post title)",
                  },
                },
                {
                  name: "metaDescription",
                  type: "textarea",
                  label: "Meta Description",
                  admin: {
                    description: "Custom SEO description (defaults to excerpt)",
                  },
                },
                {
                  name: "metaKeywords",
                  type: "text",
                  label: "Meta Keywords",
                  admin: {
                    description: "Comma-separated keywords for SEO",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
