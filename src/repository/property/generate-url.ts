import route from "@/lib/routes"
import { Property } from "@/payload-types"
import slugify from "slugify"

type PropertyLocationInput = {
  street?: string | null
  city?: string | null
  state?: string | null
}

/**
 * Generates an SEO-only slug from raw location data.
 * Does not require a full Property object, making it reusable and testable.
 * Uses strict sanitization to prevent encoding issues and invalid URLs.
 */
export const buildPropertySlug = (location: PropertyLocationInput): string => {
  // Fixed normalization: ignore null/empty, trim spaces
  const components = [location.street, location.city, location.state]
    .filter((comp): comp is string => typeof comp === 'string' && comp.trim().length > 0)
    .map(comp => comp.trim())

  if (components.length === 0) {
    return "property"
  }

  // Prevent multiple dashes by joining with spaces first, then slugify handles it
  const rawString = components.join(" ")

  return slugify(rawString, {
    lower: true,
    strict: true, // Strips special chars like '+', '(', ')', '.'
    trim: true,   // Removes trailing/leading dashes
  })
}

/**
 * The single source of truth for generating a property URL.
 * ID is the source of truth for lookups, slug is just for SEO.
 */
export const buildPropertyUrl = (id: string | number, locationInput: PropertyLocationInput): string => {
  const slug = buildPropertySlug(locationInput)

  return route("property.show", {
    id: String(id),
    slug: slug,
  })
}

/**
 * Legacy wrapper for compatibility with older code that passes the full property.
 * This should be used when the full property is available (e.g., in decorators).
 */
export const generateUrl = (data: Property): string => {
  const address = data.location?.address || { street: '', city: '', state: '' }
  return buildPropertyUrl(data.id, address)
}
