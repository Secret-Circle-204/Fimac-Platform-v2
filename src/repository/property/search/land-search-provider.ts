import type { Where } from 'payload'
import { PropertySearchFilters } from '../query-builder'
import { CategorySearchProvider } from './category-search-provider'

export class LandSearchProvider implements CategorySearchProvider {
  buildConditions(filters: PropertySearchFilters): Where[] {
    const conditions: Where[] = []

    if (filters.zoning && filters.zoning !== 'all') {
      conditions.push({
        'land.zoning': {
          equals: filters.zoning,
        },
      })
    }

    if (filters.isCorner !== undefined) {
      conditions.push({
        'land.isCorner': {
          equals: filters.isCorner,
        },
      })
    }

    return conditions
  }
}
