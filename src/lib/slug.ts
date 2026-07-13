import slugify from "slugify"
import type { FieldHook } from "payload"

/**
 * Returns a beforeValidate Field Hook that generates a unique slug based on a title/name field.
 * Handles duplicates automatically by appending numeric increments (e.g. -1, -2).
 */
export const getUniqueSlugHook = (titleField: string): FieldHook => {
  return async ({ data, value, originalDoc, req, collection }) => {
    // Determine the source title/name value
    const titleValue = data?.[titleField]
    if (!titleValue) {
      return value
    }

    const baseSlug = slugify(titleValue, { lower: true, strict: true })

    // If updating an existing doc and the title didn't change, preserve current slug to prevent unnecessary changes
    if (originalDoc && originalDoc[titleField] === titleValue && originalDoc.slug === value) {
      return value
    }

    const payload = req.payload
    const collectionSlug = collection?.slug
    if (!collectionSlug) {
      return baseSlug
    }

    let uniqueSlug = baseSlug
    let count = 1
    let exists = true

    while (exists) {
      const result = await payload.find({
        collection: collectionSlug as any,
        where: {
          slug: {
            equals: uniqueSlug,
          },
          // Exclude current document during updates
          ...(originalDoc?.id
            ? {
                id: {
                  not_equals: originalDoc.id,
                },
              }
            : {}),
        },
        limit: 1,
        depth: 0,
      })

      if (result.docs.length === 0) {
        exists = false
      } else {
        uniqueSlug = `${baseSlug}-${count}`
        count++
      }
    }

    return uniqueSlug
  }
}
