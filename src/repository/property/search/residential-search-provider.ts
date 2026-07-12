import type { Where } from 'payload'
import { PropertySearchFilters } from '../query-builder'
import { CategorySearchProvider } from './category-search-provider'

export class ResidentialSearchProvider implements CategorySearchProvider {
  buildConditions(filters: PropertySearchFilters): Where[] {
    const conditions: Where[] = []

    // Bedrooms filter (looks inside residential.bedrooms)
    if (filters.bedrooms && filters.bedrooms > 0) {
      conditions.push({
        'residential.bedrooms': {
          greater_than_equal: filters.bedrooms,
        },
      })
    }

    // Bathrooms filter (looks inside residential.bathrooms)
    if (filters.bathrooms && filters.bathrooms > 0) {
      conditions.push({
        'residential.bathrooms': {
          greater_than_equal: filters.bathrooms,
        },
      })
    }

    return conditions
  }
}
