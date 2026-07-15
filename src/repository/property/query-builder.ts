import type { Where } from 'payload'
import { SearchOrchestrator } from './search/search-orchestrator'
import { resolveSearchIntent } from './search/search-intent-resolver'

export interface PropertySearchFilters {
  location?: string
  lat?: number
  lng?: number
  radius?: number
  type?: string
  category?: string
  country?: string
  city?: string
  quickPrice?: string
  listingStatus?: string
  constructionStatus?: string
  bedrooms?: number
  bathrooms?: number
  minArea?: number
  maxArea?: number
  starRating?: string
  zoning?: string
  isCorner?: boolean
  features?: string[]
  locationIds?: (string | number)[]
}

const orchestrator = new SearchOrchestrator()

/**
 * Centrally builds a Payload CMS Where query based on search filters.
 * Filters are applied at the database query level to ensure SQL-level efficiency.
 */
export function buildPropertySearchQuery(filters: PropertySearchFilters): Where {
  const resolvedFilters = resolveSearchIntent(filters)
  return orchestrator.buildQuery(resolvedFilters)
}

