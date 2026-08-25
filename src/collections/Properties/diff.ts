import type { Property } from '@/payload-types'

// Helper to extract string ID or Slug from a relationship field
export const getRelationId = (field: unknown): string | number | null => {
  if (!field) return null
  if (typeof field === 'object' && field !== null && 'id' in field) {
    const obj = field as { id: unknown }
    if (typeof obj.id === 'string' || typeof obj.id === 'number') {
      return obj.id
    }
  }
  if (typeof field === 'string' || typeof field === 'number') {
    return field
  }
  return null
}

export const getRelationSlug = (field: unknown): string | null => {
  if (!field) return null
  if (typeof field === 'object' && field !== null && 'slug' in field) {
    const obj = field as { slug: unknown }
    if (typeof obj.slug === 'string') {
      return obj.slug
    }
  }
  return null
}

const getCity = (doc: Partial<Property> | undefined | null): string | null => {
  return doc?.location?.address?.city || null
}

const getCountry = (doc: Partial<Property> | undefined | null): string | null => {
  return doc?.location?.address?.country || null
}

const getPhotoIds = (doc: Partial<Property> | undefined | null): string => {
  if (!doc?.photos || !Array.isArray(doc.photos)) return ''
  return doc.photos
    .map((p: unknown) => getRelationId(p))
    .filter((id): id is string | number => id !== null)
    .sort()
    .join(',')
}

export function didFeaturedPresentationChange(
  previous: Partial<Property> | undefined | null,
  current: Partial<Property> | undefined | null
): boolean {
  // If either doc is missing (creation/deletion), presentation has changed
  if (!previous || !current) return true

  // Check critical fields
  if (getRelationId(previous.listingStatus) !== getRelationId(current.listingStatus)) return true
  if (previous.sortOrder !== current.sortOrder) return true
  if (previous.price !== current.price) return true
  if (previous.currency !== current.currency) return true
  if (previous.title !== current.title) return true
  if (previous.area !== current.area) return true
  if (previous.category !== current.category) return true
  if (previous.street !== current.street) return true
  if (getPhotoIds(previous) !== getPhotoIds(current)) return true
  if (getCity(previous) !== getCity(current)) return true
  if (getCountry(previous) !== getCountry(current)) return true
  if (getRelationId(previous.propertyType) !== getRelationId(current.propertyType)) return true

  return false
}

export function didFilterUniverseChange(
  previous: Partial<Property> | undefined | null,
  current: Partial<Property> | undefined | null
): boolean {
  if (!previous || !current) return true

  // City and Country affect search dropdown values
  if (getCity(previous) !== getCity(current)) return true
  if (getCountry(previous) !== getCountry(current)) return true

  // Listing status changes (e.g. from draft to active, which includes/excludes the property in COUNT queries)
  if (getRelationId(previous.listingStatus) !== getRelationId(current.listingStatus)) return true
  
  // Property type category or slug changes
  if (getRelationId(previous.propertyType) !== getRelationId(current.propertyType)) return true

  return false
}
