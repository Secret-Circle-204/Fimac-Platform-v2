import { PropertySearchFilters } from '../query-builder'

/**
 * Maps incoming search intents (e.g. from homepage cards or custom shortcut links)
 * to exact database filters. This decouples user intents (like "Land" or "Elite Real Estate")
 * from strict database field representations.
 */
export function resolveSearchIntent(filters: PropertySearchFilters): PropertySearchFilters {
  const resolved = { ...filters }

  // Map of URL type slugs to category slugs
  const typeToCategoryMap: Record<string, string> = {
    land: 'land',
    commercial: 'commercial',
    hospitality: 'hospitality',
    residential: 'residential',
    'elite-real-estate': 'residential', // elite-real-estate represents luxury residential properties
  }

  const incomingType = resolved.type?.toLowerCase()

  if (incomingType && typeToCategoryMap[incomingType]) {
    // The type filter is actually pointing to a category intent.
    // Move it to category filter, and clear type filter.
    resolved.category = typeToCategoryMap[incomingType]
    resolved.type = 'all'
  }

  // Also sanitize category if it's provided directly
  if (resolved.category && resolved.category !== 'all') {
    resolved.category = resolved.category.toLowerCase()
  }

  return resolved
}
